
'use server';

import { initializeFirebase } from "@/firebase";
import {
  doc,
  collection,
  runTransaction,
  serverTimestamp,
  increment,
  Timestamp,
  FieldValue
} from "firebase/firestore";
import type { Event, SchemaVersion, SchemaField } from "@/lib/firestore-types";
import type { InferenceResult } from "./schema-inference";

interface ProcessEventParams {
  streamId: string;
  rawPayload: string;
  contentType: string;
  sizeBytes: number;
  hash: string;
  metadata: Record<string, any>;
  inferenceResult: InferenceResult;
}

export async function processAndStoreEvent({
  streamId,
  rawPayload,
  contentType,
  sizeBytes,
  hash,
  metadata,
  inferenceResult
}: ProcessEventParams) {
  const { firestore } = initializeFirebase();
  const {
    shapeHash,
    schemaFields,
    parseStatus,
    parsedJson,
    flattenedFields,
    parseError
  } = inferenceResult;

  // Use shapeHash as the document ID for schema versions for atomic checks.
  const schemaVersionId = shapeHash;
  const streamRef = doc(firestore, 'streams', streamId);
  const schemaVersionRef = doc(streamRef, 'schemaVersions', schemaVersionId);
  const eventRef = doc(collection(streamRef, 'events'));

  if (parseError) {
    metadata.parseError = parseError;
  }

  try {
    await runTransaction(firestore, async (transaction) => {
      // 1. Read schema and stream docs
      const schemaVersionDoc = await transaction.get(schemaVersionRef);
      const streamDoc = await transaction.get(streamRef);

      // 2. Write SchemaVersion if it's new
      if (!schemaVersionDoc.exists()) {
        const newSchemaVersion: Omit<SchemaVersion, 'schemaVersionId'> = {
          streamId: streamId,
          createdAt: serverTimestamp(),
          shapeHash: shapeHash,
          fields: schemaFields,
          notes: 'Initial version for this shape.',
        };
        transaction.set(schemaVersionRef, newSchemaVersion);
      }

      // 3. Write the Event
      const newEvent: Omit<Event, 'eventId'> = {
        streamId,
        receivedAt: serverTimestamp(),
        contentType: contentType,
        sizeBytes,
        rawPayload, // For Firestore, this should be a string. Base64 for binary.
        parseStatus,
        parsedJson: parsedJson ?? null,
        flattenedFields: flattenedFields ?? null,
        schemaVersionId,
        hash,
        metadata,
      };
      transaction.set(eventRef, newEvent);

      // 4. Write/Update Stream
      if (!streamDoc.exists()) {
        transaction.set(streamRef, {
          createdAt: serverTimestamp(),
          lastSeenAt: serverTimestamp(),
          stats: {
            eventCount: 1,
            schemaVersionCount: 1,
            errorRate: parseStatus === 'FAILED' ? 100 : 0
          },
        });
      } else {
        transaction.update(streamRef, {
          lastSeenAt: serverTimestamp(),
          'stats.eventCount': increment(1),
          'stats.schemaVersionCount': !schemaVersionDoc.exists() ? increment(1) : increment(0),
        });
      }
    });
    return { success: true, eventId: eventRef.id };
  } catch (error: any) {
    console.error("Ingestion transaction failed:", error);
    return { success: false, error: error.message };
  }
}

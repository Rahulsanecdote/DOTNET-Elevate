// Based on the Canonical Data Model in the project brief.

/**
 * Represents a stream of events. Stored in /streams/{streamId}
 */
export interface Stream {
  // streamId is the document ID
  createdAt: { seconds: number; nanoseconds: number };
  lastSeenAt: { seconds: number; nanoseconds: number };
  stats?: {
    eventCount?: number;
    errorRate?: number;
    schemaVersionCount?: number;
  };
}

/**
 * Represents a field within a schema version.
 */
export interface SchemaField {
  path: string;
  type: string;
  nullable: boolean;
  example: any;
  frequency: number;
}

/**
 * Represents a specific version of the schema for a given stream.
 * Stored in /streams/{streamId}/schemaVersions/{schemaVersionId}
 */
export interface SchemaVersion {
  // schemaVersionId is the document ID
  streamId: string;
  createdAt: { seconds: number; nanoseconds: number };
  shapeHash: string;
  fields: SchemaField[];
  notes?: string;
}

/**
 * Represents an event ingested by the system.
 * Stored in /streams/{streamId}/events/{eventId}
 */
export interface Event {
  // eventId is the document ID
  streamId: string;
  receivedAt: { seconds: number; nanoseconds: number };
  contentType: string;
  sizeBytes: number;
  rawPayload: string; // Can be base64 for binary data.
  parseStatus: 'OK' | 'FAILED' | 'PARTIAL';
  parsedJson?: any;
  flattenedFields?: Record<string, string | number | boolean>;
  schemaVersionId?: string;
  hash?: string;
  metadata?: {
    headers?: Record<string, string>;
    remoteIp?: string;
    parseError?: string;
  };
}

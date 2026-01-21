import { NextRequest, NextResponse } from 'next/server';
import { createHash } from 'crypto';
import { inferSchemaFromPayload } from '@/lib/schema-inference';
import { processAndStoreEvent } from '@/lib/ingestion-service';

const MAX_PAYLOAD_SIZE = 1 * 1024 * 1024; // 1MB

export async function POST(
  req: NextRequest,
  { params }: { params: { streamId?: string[] } }
) {
  try {
    // 1. Determine Stream ID
    let streamId = params.streamId?.[0];
    if (!streamId) {
        streamId = req.headers.get('X-Stream-Id') ?? `anonymous-${req.ip ?? 'unknown'}`;
    }
    // Sanitize streamId to be a valid Firestore document ID
    streamId = streamId.replace(/[^a-zA-Z0-9_-]/g, '_');


    // 2. Read raw payload
    const rawPayloadBuffer = await req.arrayBuffer();
    const sizeBytes = rawPayloadBuffer.byteLength;
    const contentType = req.headers.get('Content-Type') || 'application/octet-stream';

    // 3. Basic validation
    if (sizeBytes === 0) {
        return NextResponse.json({ error: 'Payload cannot be empty' }, { status: 400 });
    }
    if (sizeBytes > MAX_PAYLOAD_SIZE) {
        return NextResponse.json({ error: `Payload size exceeds limit of ${MAX_PAYLOAD_SIZE} bytes` }, { status: 413 });
    }

    // 4. Prepare payload for inference and storage
    let rawPayloadForStorage: string;
    let payloadForInference: string;

    const isJson = contentType.includes('json');
    const isText = contentType.includes('text');

    if (isJson || isText) {
        payloadForInference = Buffer.from(rawPayloadBuffer).toString('utf-8');
        rawPayloadForStorage = payloadForInference;
    } else {
        // Treat as binary and Base64 encode for storage.
        payloadForInference = ''; // Do not attempt to infer schema from binary.
        rawPayloadForStorage = Buffer.from(rawPayloadBuffer).toString('base64');
    }

    const hash = createHash('sha256').update(rawPayloadForStorage).digest('hex');

    // 5. Infer Schema
    const inferenceResult = inferSchemaFromPayload(payloadForInference, contentType);

    // 6. Prepare metadata
    const headers: Record<string, string> = {};
     req.headers.forEach((value, key) => {
        headers[key] = value;
    });
    const metadata: Record<string, any> = {
        remoteIp: req.ip,
        headers: headers,
    };

    // 7. Process and Store
    const result = await processAndStoreEvent({
        streamId,
        rawPayload: rawPayloadForStorage,
        contentType,
        sizeBytes,
        hash,
        metadata,
        inferenceResult,
    });

    if (result.success) {
        return NextResponse.json({ status: 'received', eventId: result.eventId }, { status: 202 });
    } else {
        return NextResponse.json({ error: 'Failed to process event', details: result.error }, { status: 500 });
    }
   } catch (error: any) {
        console.error("Unhandled error in ingestion route:", error);
        return NextResponse.json({ error: 'An unexpected error occurred.' }, { status: 500 });
   }
}

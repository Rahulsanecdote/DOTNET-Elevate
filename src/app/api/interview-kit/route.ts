
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { verifyIdToken } from '@/lib/server/firebaseAdmin';
import { checkAndIncrementRateLimit } from '@/lib/server/rateLimit';
import { findKitByHashAdmin, createInterviewKitDocAdmin, updateInterviewKitDocAdmin } from '@/lib/server/firestoreAdmin';
import { generateInterviewKit } from '@/ai/flows/generate-interview-kit';

// Zod schema for validating the incoming request body.
const RequestBodySchema = z.object({
  inputHash: z.string(),
  resumeText: z.string().optional(),
  jdText: z.string().optional(),
  targetRole: z.string().optional(),
}).refine(data => data.resumeText || data.jdText, {
  message: "Either resumeText or jdText must be provided.",
  path: ["resumeText"],
});

export async function POST(req: NextRequest) {
  try {
    // 1. Authenticate the user
    const authHeader = req.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized: Missing or invalid token' }, { status: 401 });
    }
    const idToken = authHeader.split('Bearer ')[1];
    const uid = await verifyIdToken(idToken);

    // 2. Validate the request body
    const body = await req.json();
    const parsedBody = RequestBodySchema.safeParse(body);

    if (!parsedBody.success) {
      return NextResponse.json({ error: 'Invalid request body', details: parsedBody.error.format() }, { status: 400 });
    }
    const { inputHash, resumeText, jdText, targetRole } = parsedBody.data;

    // 3. Apply rate limiting
    await checkAndIncrementRateLimit(uid);

    // 4. Check for cached result
    const cachedKit = await findKitByHashAdmin(uid, inputHash);
    if (cachedKit) {
      // If kit is ready or processing, return its ID immediately.
      return NextResponse.json({ kitId: cachedKit.id }, { status: 200 });
    }

    // 5. Create a new kit document with "processing" status
    const sourceType = resumeText && jdText ? 'both' : (resumeText ? 'resume' : 'jobDescription');
    const kitId = await createInterviewKitDocAdmin(uid, {
      inputHash,
      sourceType,
      roleTitle: targetRole || null,
      resumeText,
      jdText,
    });

    // Respond immediately to the client with the new Kit ID.
    // The generation process will continue in the background.
    const response = NextResponse.json({ kitId }, { status: 202 });

    // 6. Fire-and-forget generation process
    (async () => {
      try {
        const generatedData = await generateInterviewKit({ resumeText, jdText, targetRole });
        await updateInterviewKitDocAdmin(uid, kitId, {
          ...generatedData,
          status: 'ready',
        });
      } catch (error: any) {
        console.error(`[Kit ${kitId}] Generation failed:`, error);
        await updateInterviewKitDocAdmin(uid, kitId, {
          status: 'error',
          errorMessage: error.message || 'An unknown error occurred during generation.',
        });
      }
    })();
    
    return response;

  } catch (error: any) {
    if (error.code === 'auth/id-token-expired' || error.code === 'auth/argument-error') {
      return NextResponse.json({ error: 'Unauthorized: ' + error.message }, { status: 401 });
    }
    if (error.message.startsWith('You have reached')) {
      return NextResponse.json({ error: error.message }, { status: 429 });
    }
    console.error('[API /interview-kit] Unhandled Error:', error);
    return NextResponse.json({ error: 'An internal server error occurred.' }, { status: 500 });
  }
}

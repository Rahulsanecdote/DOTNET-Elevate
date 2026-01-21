
import * as admin from 'firebase-admin';

// This file is the single source of truth for the Firebase Admin SDK.
// It ensures the SDK is initialized only once.

const serviceAccountKeyJson = process.env.FIREBASE_SERVICE_ACCOUNT_KEY_JSON_BASE64
  ? Buffer.from(process.env.FIREBASE_SERVICE_ACCOUNT_KEY_JSON_BASE64, 'base64').toString('utf-8')
  : '';

if (!admin.apps.length) {
  if (!serviceAccountKeyJson) {
    if (process.env.NODE_ENV === "production") {
      console.error("Firebase Admin SDK credentials are not set. Ensure FIREBASE_SERVICE_ACCOUNT_KEY_JSON_BASE64 is in your environment variables.");
    }
  } else {
    try {
      admin.initializeApp({
        credential: admin.credential.cert(JSON.parse(serviceAccountKeyJson)),
      });
    } catch (e: any) {
        console.error("Failed to initialize Firebase Admin SDK:", e.message);
    }
  }
}

const adminAuth = admin.auth();
const adminDb = admin.firestore();

/**
 * Verifies a Firebase ID token and returns the user's UID.
 * @param idToken The Firebase ID token from the client.
 * @returns The UID of the authenticated user.
 * @throws An error if the token is invalid or expired.
 */
async function verifyIdToken(idToken: string): Promise<string> {
  const decodedToken = await adminAuth.verifyIdToken(idToken);
  return decodedToken.uid;
}

export { adminAuth, adminDb, verifyIdToken };

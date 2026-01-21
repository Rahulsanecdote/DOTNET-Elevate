
import { adminDb } from './firebaseAdmin';
import { FieldValue } from 'firebase-admin/firestore';
import type { InterviewKit } from '@/lib/interviewKit/types';

// This file contains server-side Firestore data access functions using the Admin SDK.

const getKitsCollection = (uid: string) => {
  return adminDb.collection('users').doc(uid).collection('interviewKits');
};

/**
 * Finds an existing interview kit by the hash of its input content using the Admin SDK.
 * @param uid The user's ID.
 * @param inputHash The hash to search for.
 * @returns The ID and status of the found kit, or null if not found.
 */
export async function findKitByHashAdmin(uid: string, inputHash: string): Promise<{ id: string, status: InterviewKit['status'] } | null> {
  const kitsCollection = getKitsCollection(uid);
  const snapshot = await kitsCollection.where('inputHash', '==', inputHash).limit(1).get();

  if (snapshot.empty) {
    return null;
  }

  const doc = snapshot.docs[0];
  const data = doc.data() as InterviewKit;
  return { id: doc.id, status: data.status };
}

/**
 * Creates a new interview kit document with "processing" status using the Admin SDK.
 * @param uid The user's ID.
 * @param initialData The initial data for the kit.
 * @returns The ID of the newly created document.
 */
export async function createInterviewKitDocAdmin(
  uid: string,
  initialData: Pick<InterviewKit, 'inputHash' | 'sourceType' | 'roleTitle' | 'resumeText' | 'jdText'>
): Promise<string> {
  const kitsCollection = getKitsCollection(uid);
  const docData = {
    ...initialData,
    questions: [],
    skillsDetected: [],
    seniorityGuess: null,
    status: 'processing' as const,
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  };

  const docRef = await kitsCollection.add(docData);
  return docRef.id;
}

/**
 * Updates an existing interview kit document using the Admin SDK.
 * @param uid The user's ID.
 * @param kitId The ID of the kit to update.
 * @param dataToUpdate The partial data to merge into the document.
 */
export async function updateInterviewKitDocAdmin(
  uid: string,
  kitId: string,
  dataToUpdate: Partial<InterviewKit>
): Promise<void> {
  const kitDocRef = getKitsCollection(uid).doc(kitId);
  const docData = {
    ...dataToUpdate,
    updatedAt: FieldValue.serverTimestamp(),
  };
  await kitDocRef.update(docData);
}

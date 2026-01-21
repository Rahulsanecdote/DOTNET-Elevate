'use client';

import {
  doc,
  collection,
  addDoc,
  updateDoc,
  onSnapshot,
  query,
  where,
  getDocs,
  serverTimestamp,
  type Firestore,
  type FirestoreDataConverter,
  type PartialWithFieldValue,
  type WithFieldValue,
} from 'firebase/firestore';
import { InterviewKit, InterviewKitSchema } from './types';
import { errorEmitter, FirestorePermissionError } from '@/firebase';

// Firestore data converter to ensure type safety
const interviewKitConverter: FirestoreDataConverter<InterviewKit> = {
  toFirestore: (kit: WithFieldValue<InterviewKit>) => {
    // The data going to Firestore should be a plain object.
    // Zod schema should have been validated before calling this.
    const { id, ...data } = kit; // remove client-side id before sending to firestore
    return data;
  },
  fromFirestore: (snapshot, options) => {
    const data = snapshot.data(options);
    // Use Zod to parse and validate the data from Firestore,
    // which provides runtime validation and type safety.
    const parsed = InterviewKitSchema.parse({
      ...data,
      id: snapshot.id, // add the document id to the object
    });
    return parsed;
  }
};

const getKitsCollection = (db: Firestore, uid: string) => {
    return collection(db, 'users', uid, 'interviewKits').withConverter(interviewKitConverter);
};

/**
 * Creates a new interview kit document in Firestore.
 * Does not block and returns the promise which resolves with the new ID.
 * @param db Firestore instance
 * @param uid The user's ID.
 * @param initialData The initial data for the kit.
 * @returns A promise that resolves with the ID of the newly created document.
 */
export function createInterviewKitDoc(db: Firestore, uid: string, initialData: Pick<InterviewKit, 'inputHash' | 'sourceType' | 'roleTitle' | 'seniorityGuess' | 'skillsDetected' | 'resumeText' | 'jdText'>): Promise<string> {
  const kitsCollection = getKitsCollection(db, uid);
  const docData = {
    ...initialData,
    questions: [],
    status: 'processing' as const,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  return new Promise<string>((resolve, reject) => {
    addDoc(kitsCollection, docData)
      .then(docRef => {
        resolve(docRef.id);
      })
      .catch(error => {
        errorEmitter.emit('permission-error', new FirestorePermissionError({
          path: kitsCollection.path,
          operation: 'create',
          requestResourceData: docData,
        }));
        reject(error);
      });
  });
}

/**
 * Updates an existing interview kit document.
 * @param db Firestore instance
 * @param uid The user's ID.
 * @param kitId The ID of the kit to update.
 * @param patch The data to update.
 */
export function updateInterviewKitDoc(db: Firestore, uid: string, kitId: string, patch: Partial<InterviewKit>): void {
    const kitDocRef = doc(db, 'users', uid, 'interviewKits', kitId);
    const docData: PartialWithFieldValue<InterviewKit> = {
      ...patch,
      updatedAt: serverTimestamp(),
    };
    updateDoc(kitDocRef, docData).catch(error => {
      errorEmitter.emit('permission-error', new FirestorePermissionError({
        path: kitDocRef.path,
        operation: 'update',
        requestResourceData: docData,
      }));
    });
}

/**
 * Listens for real-time updates to a specific interview kit.
 * @param db Firestore instance
 * @param uid The user's ID.
 * @param kitId The ID of the kit to listen to.
 * @param callback A function to be called with the kit data on each update.
 * @returns An unsubscribe function to stop listening.
 */
export function listenToInterviewKit(db: Firestore, uid: string, kitId: string, callback: (kit: InterviewKit | null) => void): () => void {
  const kitDocRef = doc(db, 'users', uid, 'interviewKits', kitId).withConverter(interviewKitConverter);

  const unsubscribe = onSnapshot(kitDocRef, (doc) => {
    callback(doc.exists() ? doc.data() : null);
  }, (error) => {
    console.error(`Error listening to interview kit ${kitId}:`, error);
    errorEmitter.emit('permission-error', new FirestorePermissionError({
        path: kitDocRef.path,
        operation: 'get', // listening is a 'get' operation in rules
    }));
    callback(null);
  });

  return unsubscribe;
}

/**
 * Finds an existing interview kit by the hash of its input content.
 * @param db Firestore instance
 * @param uid The user's ID.
 * @param inputHash The hash to search for.
 * @returns The ID of the found kit, or null if not found.
 */
export async function findKitByHash(db: Firestore, uid: string, inputHash: string): Promise<string | null> {
    const kitsCollection = getKitsCollection(db, uid);
    const q = query(kitsCollection, where('inputHash', '==', inputHash));
    
    try {
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
            return querySnapshot.docs[0].id;
        }
        return null;
    } catch (error) {
        errorEmitter.emit('permission-error', new FirestorePermissionError({
            path: kitsCollection.path,
            operation: 'list', // querying is a 'list' operation
        }));
        // Re-throw so the caller can handle the failed query
        throw error;
    }
}

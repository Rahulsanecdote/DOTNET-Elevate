'use client';

import { ref, uploadBytes, getDownloadURL, type Storage } from 'firebase/storage';

type UploadResult = {
  path: string;
  downloadUrl: string;
};

/**
 * Uploads a file to a user-specific path in Firebase Storage.
 * @param storage The Firebase Storage instance.
 * @param uid The user's unique ID.
 * @param kitId The unique ID for the interview kit.
 * @param file The file to upload.
 * @param kind The type of file being uploaded ('resume' or 'jd').
 * @returns A promise that resolves with the storage path and download URL.
 */
export async function uploadFileForUser(
  storage: Storage,
  uid: string,
  kitId: string,
  file: File,
  kind: 'resume' | 'jd'
): Promise<UploadResult> {
  if (!uid) {
    throw new Error('User ID is required for upload.');
  }
  const fileExtension = file.name.split('.').pop() || 'file';
  const storagePath = `users/${uid}/uploads/${kitId}/${kind}.${fileExtension}`;
  const fileRef = ref(storage, storagePath);

  const snapshot = await uploadBytes(fileRef, file);
  const downloadUrl = await getDownloadURL(snapshot.ref);

  return {
    path: storagePath,
    downloadUrl,
  };
}

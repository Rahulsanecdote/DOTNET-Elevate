'use client';

import type { User } from 'firebase/auth';

interface CreateKitPayload {
  inputHash: string;
  resumeText?: string;
  jdText?: string;
  targetRole?: string;
}

/**
 * Initiates the interview kit generation process by calling the server API.
 * @param user The currently authenticated Firebase user.
 * @param payload The data required for kit generation.
 * @returns A promise that resolves to the new kit's ID.
 */
export async function createInterviewKitRequest(user: User, payload: CreateKitPayload): Promise<string> {
  if (!user) {
    throw new Error('User is not authenticated.');
  }

  try {
    const idToken = await user.getIdToken();

    const response = await fetch('/api/interview-kit', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${idToken}`,
      },
      body: JSON.stringify(payload),
    });

    const responseData = await response.json();

    if (!response.ok) {
      throw new Error(responseData.error || `HTTP error! status: ${response.status}`);
    }

    if (!responseData.kitId) {
        throw new Error("API did not return a kitId.");
    }

    return responseData.kitId;
  } catch (error: any) {
    console.error('Failed to create interview kit request:', error);
    // Re-throw the error so the calling component can handle it in the UI
    throw error;
  }
}

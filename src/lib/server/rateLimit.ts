
import { adminDb } from './firebaseAdmin';
import { FieldValue } from 'firebase-admin/firestore';

const MAX_GENERATIONS_PER_DAY = 5;

/**
 * Checks if a user has exceeded their daily generation limit and increments their count.
 * This function uses a Firestore transaction to ensure atomicity.
 * @param uid The user's ID.
 * @returns A promise that resolves if the user is within their limit, and rejects if they are not.
 */
export async function checkAndIncrementRateLimit(uid: string): Promise<void> {
  const rateLimitRef = adminDb.collection('users').doc(uid).collection('metadata').doc('rateLimits');
  const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format

  try {
    await adminDb.runTransaction(async (transaction) => {
      const doc = await transaction.get(rateLimitRef);

      if (!doc.exists) {
        // First time user is generating, create the document.
        transaction.set(rateLimitRef, { counts: { [today]: 1 } });
        return;
      }

      const data = doc.data();
      const count = data?.counts?.[today] || 0;

      if (count >= MAX_GENERATIONS_PER_DAY) {
        throw new Error('You have reached the maximum of 5 generations per day.');
      }

      // Using FieldValue.increment is the atomic way to update a counter.
      // The key is dot-notated to update the specific map field.
      transaction.update(rateLimitRef, { [`counts.${today}`]: FieldValue.increment(1) });
    });
  } catch (error: any) {
    // Re-throw the specific error for the API route to handle.
    if (error.message.startsWith('You have reached')) {
      throw error;
    }
    // Log other potential transaction failures and throw a generic error.
    console.error('Rate limit transaction failed:', error);
    throw new Error('Could not verify generation limit.');
  }
}

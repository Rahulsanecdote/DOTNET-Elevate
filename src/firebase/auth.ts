'use client';

import { useUser, type UserHookResult } from '@/firebase/provider';

interface AnonAuthResult {
  uid: string | null;
  loading: boolean;
  error: Error | null;
}

/**
 * Provides the anonymous user's authentication state.
 * Assumes an AuthProvider is wrapping the component tree
 * and handling the anonymous sign-in flow.
 *
 * @returns {AnonAuthResult} An object containing the user's UID, loading state, and any errors.
 */
export function useAnonAuth(): AnonAuthResult {
  const { user, isUserLoading, userError }: UserHookResult = useUser();

  return {
    uid: user?.uid ?? null,
    loading: isUserLoading,
    error: userError,
  };
}

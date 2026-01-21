'use client';

import { FirebaseClientProvider, useFirebase } from '@/firebase';
import { initiateAnonymousSignIn } from '@/firebase/non-blocking-login';
import { useEffect, type ReactNode } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

/**
 * This component waits for the initial auth state to be determined.
 * If no user is logged in, it triggers the anonymous sign-in flow.
 * It also displays a loading state during the initial check.
 */
function AuthManager({ children }: { children: ReactNode }) {
  const { user, isUserLoading, auth } = useFirebase();

  useEffect(() => {
    // When the initial user check is done and there's no user, sign in.
    if (!isUserLoading && !user && auth) {
      initiateAnonymousSignIn(auth);
    }
  }, [isUserLoading, user, auth]);

  // Display a loading UI while Firebase determines the auth state.
  if (isUserLoading) {
    return (
       <div className="flex h-screen w-full items-center justify-center">
          <div className="w-1/3 space-y-4">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-48 w-full" />
          </div>
       </div>
    );
  }

  return <>{children}</>;
}


/**
 * A central component to wrap all application-level providers.
 */
export function Providers({ children }: { children: ReactNode }) {
  return (
    <FirebaseClientProvider>
      <AuthManager>
        {children}
      </AuthManager>
    </FirebaseClientProvider>
  );
}

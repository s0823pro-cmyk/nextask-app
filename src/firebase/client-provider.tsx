
'use client';

import React, { useMemo, useEffect, type ReactNode } from 'react';
import { FirebaseProvider } from '@/firebase/provider';
import { initializeFirebase } from '@/firebase';
import { signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import { usePathname } from 'next/navigation';

interface FirebaseClientProviderProps {
  children: ReactNode;
}

export function FirebaseClientProvider({ children }: FirebaseClientProviderProps) {
  const firebaseServices = useMemo(() => {
    return initializeFirebase();
  }, []);

  const pathname = usePathname();

  useEffect(() => {
    const { auth } = firebaseServices;
    if (!auth) return;

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      // 共有ポータルの閲覧時のみ、未ログインであれば匿名ログインを行う
      // window.location の代わりに next/navigation の usePathname を考慮
      const isPublicView = pathname?.startsWith('/view/');
      
      if (!user && isPublicView) {
        signInAnonymously(auth).catch((error) => {
          if (process.env.NODE_ENV !== 'production') {
            console.error("Anonymous sign-in failed:", error);
          }
        });
      }
    });

    return () => unsubscribe();
  }, [firebaseServices, pathname]);

  return (
    <FirebaseProvider
      firebaseApp={firebaseServices.firebaseApp}
      auth={firebaseServices.auth}
      firestore={firebaseServices.firestore}
    >
      {children}
    </FirebaseProvider>
  );
}

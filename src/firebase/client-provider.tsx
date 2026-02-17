
'use client';

import React, { useMemo, useEffect, type ReactNode } from 'react';
import { FirebaseProvider } from '@/firebase/provider';
import { initializeFirebase } from '@/firebase';
import { signInAnonymously, onAuthStateChanged } from 'firebase/auth';

interface FirebaseClientProviderProps {
  children: ReactNode;
}

export function FirebaseClientProvider({ children }: FirebaseClientProviderProps) {
  const firebaseServices = useMemo(() => {
    return initializeFirebase();
  }, []);

  useEffect(() => {
    const { auth } = firebaseServices;
    if (!auth) return;

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      // 共有ポータルの閲覧時のみ、未ログインであれば匿名ログインを行う
      // これにより管理者ログイン画面での干渉を防ぐ
      const isPublicView = window.location.pathname.startsWith('/view/');
      
      if (!user && isPublicView) {
        signInAnonymously(auth).catch((error) => {
          if (process.env.NODE_ENV !== 'production') {
            console.error("Anonymous sign-in failed:", error);
          }
        });
      }
    });

    return () => unsubscribe();
  }, [firebaseServices]);

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

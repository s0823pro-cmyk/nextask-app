
'use client';

import React, { useMemo, useEffect, type ReactNode } from 'react';
import { FirebaseProvider } from '@/firebase/provider';
import { initializeFirebase } from '@/firebase';
import { signInAnonymously, onAuthStateChanged } from 'firebase/auth';

interface FirebaseClientProviderProps {
  children: ReactNode;
}

/**
 * クライアントサイドでFirebaseを初期化し、認証状態を管理するプロバイダー。
 * ログインしていない場合に自動で匿名ログインを行い、共有URLの閲覧を可能にします。
 */
export function FirebaseClientProvider({ children }: FirebaseClientProviderProps) {
  const firebaseServices = useMemo(() => {
    // クライアントサイドでFirebaseサービスを初期化
    return initializeFirebase();
  }, []);

  useEffect(() => {
    const { auth } = firebaseServices;
    if (!auth) return;

    // 認証状態の変更を監視
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      // 完全にログアウトしている場合のみ、共有URL閲覧のために匿名ログインを実行
      if (!user) {
        signInAnonymously(auth).catch((error) => {
          // 開発環境でのデバッグ用。本番環境ではサイレントに失敗させる
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

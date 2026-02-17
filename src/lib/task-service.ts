'use client';

import { 
  doc, 
  Firestore
} from 'firebase/firestore';
import { Task, Client } from './types';
import { setDocumentNonBlocking, deleteDocumentNonBlocking } from '@/firebase/non-blocking-updates';

/**
 * 取引先のタスクを保存する際、管理者用マスターとクライアント用ビューの両方を更新します。
 */
export function saveTaskWithSync(db: Firestore, task: Task, clientIdentifier: string) {
  const taskRef = doc(db, 'tasks', task.id);
  const viewRef = doc(db, 'client_task_views', clientIdentifier, 'tasks', task.id);

  // 非同期（ノンブロッキング）で両方に書き込み
  setDocumentNonBlocking(taskRef, task, { merge: true });
  setDocumentNonBlocking(viewRef, task, { merge: true });
}

/**
 * 取引先のタスクを削除する際、両方のコレクションから削除します。
 */
export function deleteTaskWithSync(db: Firestore, taskId: string, clientIdentifier?: string) {
  const taskRef = doc(db, 'tasks', taskId);
  deleteDocumentNonBlocking(taskRef);

  if (clientIdentifier) {
    const viewRef = doc(db, 'client_task_views', clientIdentifier, 'tasks', taskId);
    deleteDocumentNonBlocking(viewRef);
  }
}

/**
 * 取引先を保存します。
 */
export function saveClientFirestore(db: Firestore, client: Client) {
  const clientRef = doc(db, 'clients', client.id);
  setDocumentNonBlocking(clientRef, client, { merge: true });
}

/**
 * 取引先を削除します。
 */
export function deleteClientFirestore(db: Firestore, clientId: string) {
  const clientRef = doc(db, 'clients', clientId);
  deleteDocumentNonBlocking(clientRef);
}

export function generateId() {
  return Math.random().toString(36).substring(2, 11);
}

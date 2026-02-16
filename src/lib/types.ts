export type TaskStatus = 'todo' | 'in_progress' | 'pending' | 'done';

export interface Task {
  id: string;
  clientId: string;
  title: string;
  description: string;
  status: TaskStatus;
  receptionDate: string;
  dueDate: string;
  subtasks: string[];
  pdfName?: string;
  pdfData?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Client {
  id: string;
  name: string;
  color: string;
  dedicatedUrlIdentifier: string;
  contactEmail?: string;
}

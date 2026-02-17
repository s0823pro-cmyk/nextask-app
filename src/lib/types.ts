export type TaskStatus = 'todo' | 'in_progress' | 'pending' | 'done' | 'awaiting_payment';

export interface TaskPdf {
  name: string;
  data: string;
}

export interface Task {
  id: string;
  clientId: string;
  title: string;
  description: string;
  constructionType?: string;
  status: TaskStatus;
  receptionDate: string;
  dueDate: string;
  subtasks: string[];
  pdfs?: TaskPdf[];
  createdAt: string;
  updatedAt: string;
}

export type ClientType = 'prime' | 'sub';

export interface Client {
  id: string;
  name: string;
  color: string;
  dedicatedUrlIdentifier: string;
  clientType?: ClientType;
  contactEmail?: string;
}

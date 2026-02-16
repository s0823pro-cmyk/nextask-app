export type TaskStatus = 'todo' | 'in_progress' | 'done';

export interface Task {
  id: string;
  clientId: string;
  title: string;
  description: string;
  status: TaskStatus;
  dueDate: string;
  subtasks: string[];
  createdAt: string;
}

export interface Client {
  id: string;
  name: string;
  color: string;
}
import { Task, TaskStatus } from './types';

const STORAGE_KEY = 'dailyflow_tasks';

export const getTasks = (clientId: string): Task[] => {
  if (typeof window === 'undefined') return [];
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) return [];
  const allTasks: Task[] = JSON.parse(stored);
  return allTasks.filter(t => t.clientId === clientId);
};

export const saveTask = (task: Task) => {
  const stored = localStorage.getItem(STORAGE_KEY);
  let allTasks: Task[] = stored ? JSON.parse(stored) : [];
  
  const index = allTasks.findIndex(t => t.id === task.id);
  if (index >= 0) {
    allTasks[index] = task;
  } else {
    allTasks.push(task);
  }
  
  localStorage.setItem(STORAGE_KEY, JSON.stringify(allTasks));
};

export const deleteTask = (taskId: string) => {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) return;
  let allTasks: Task[] = JSON.parse(stored);
  allTasks = allTasks.filter(t => t.id !== taskId);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(allTasks));
};

export const updateTaskStatus = (taskId: string, status: TaskStatus) => {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) return;
  let allTasks: Task[] = JSON.parse(stored);
  const index = allTasks.findIndex(t => t.id === taskId);
  if (index >= 0) {
    allTasks[index].status = status;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(allTasks));
  }
};
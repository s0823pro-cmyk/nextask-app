import { Task, TaskStatus, Client } from './types';

const STORAGE_KEY = 'dailyflow_tasks';
const CLIENTS_STORAGE_KEY = 'dailyflow_clients';

// Default clients if none exist
const DEFAULT_CLIENTS: Client[] = [
  { id: "acme-inc", name: "株式会社アクメ", color: "bg-blue-500" },
  { id: "global-corp", name: "グローバル合同会社", color: "bg-green-500" },
  { id: "future-tech", name: "フューチャー・テック", color: "bg-purple-500" },
];

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

// Client Management
export const getClients = (): Client[] => {
  if (typeof window === 'undefined') return DEFAULT_CLIENTS;
  const stored = localStorage.getItem(CLIENTS_STORAGE_KEY);
  if (!stored) {
    localStorage.setItem(CLIENTS_STORAGE_KEY, JSON.stringify(DEFAULT_CLIENTS));
    return DEFAULT_CLIENTS;
  }
  return JSON.parse(stored);
};

export const saveClient = (client: Client) => {
  const clients = getClients();
  const index = clients.findIndex(c => c.id === client.id);
  if (index >= 0) {
    clients[index] = client;
  } else {
    clients.push(client);
  }
  localStorage.setItem(CLIENTS_STORAGE_KEY, JSON.stringify(clients));
};

export const deleteClient = (clientId: string) => {
  const clients = getClients().filter(c => c.id !== clientId);
  localStorage.setItem(CLIENTS_STORAGE_KEY, JSON.stringify(clients));
};

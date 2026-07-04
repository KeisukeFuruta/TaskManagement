export type Priority = 'urgent' | 'high' | 'medium' | 'low' | 'none';

export interface Card {
  id: string;
  title: string;
  memo: string | null;
  priority: string | null;
  dueDate: string | null;
  position: number;
  createdAt: string;
  updatedAt: string;
}

export interface TaskList {
  id: string;
  title: string;
  position: number;
  cards: Card[];
  createdAt: string;
  updatedAt: string;
}

export interface Board {
  id: string;
  title: string;
  position: number | null;
  lists: TaskList[];
  createdAt: string;
  updatedAt: string;
}

export interface SearchParams {
  title?: string;
  priority?: string;
  dueDate?: string;
}

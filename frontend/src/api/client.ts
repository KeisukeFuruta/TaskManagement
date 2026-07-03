import type { Board, Card, TaskList, SearchParams } from '../types/board';

const BASE = '/api';

async function get<T>(path: string): Promise<T> {
  const res = await fetch(BASE + path);
  if (!res.ok) throw new Error(`${res.status} ${path}`);
  return res.json();
}

export const fetchBoards = (): Promise<Board[]> => get('/boards');

export const fetchLists = (boardId: string): Promise<TaskList[]> =>
  get(`/boards/${boardId}/lists`);

export const fetchCards = (listId: string): Promise<Card[]> =>
  get(`/lists/${listId}/cards`);

export const searchCards = (params: SearchParams): Promise<Card[]> => {
  const q = new URLSearchParams();
  if (params.title) q.set('title', params.title);
  if (params.priority) q.set('priority', params.priority);
  if (params.dueDate) q.set('dueDate', params.dueDate);
  return get(`/cards/search?${q.toString()}`);
};

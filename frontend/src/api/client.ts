import type { Board, Card, TaskList, SearchParams } from '../types/board';

const BASE = '/api';

async function get<T>(path: string): Promise<T> {
  const res = await fetch(BASE + path);
  if (!res.ok) throw new Error(`${res.status} ${path}`);
  return res.json();
}

async function post<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(BASE + path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
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

export const createBoard = (title: string): Promise<Board> =>
  post('/boards', { title });

export const createList = (boardId: string, title: string): Promise<TaskList> =>
  post(`/boards/${boardId}/lists`, { title });

export const createCard = (
  listId: string,
  data: { title: string; memo?: string; priority?: string; dueDate?: string }
): Promise<Card> => post(`/lists/${listId}/cards`, data);

import type { Board, Card, TaskList, SearchParams } from '../types/board';

const BASE = '/api';

async function throwIfNotOk(res: Response, path: string): Promise<void> {
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`${res.status} ${res.statusText}: ${path}${text ? ` — ${text}` : ''}`);
  }
}

async function get<T>(path: string): Promise<T> {
  const res = await fetch(BASE + path);
  await throwIfNotOk(res, path);
  return res.json();
}

async function post<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(BASE + path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  await throwIfNotOk(res, path);
  return res.json();
}

async function put<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(BASE + path, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  await throwIfNotOk(res, path);
  return res.json();
}

async function del(path: string): Promise<void> {
  const res = await fetch(BASE + path, { method: 'DELETE' });
  await throwIfNotOk(res, path);
}

async function patch(path: string, body: unknown): Promise<void> {
  const res = await fetch(BASE + path, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  await throwIfNotOk(res, path);
}

async function patchJson<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(BASE + path, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  await throwIfNotOk(res, path);
  return res.json();
}

export const fetchBoards = (): Promise<Board[]> => get('/boards');

export const fetchLists = (boardId: string): Promise<TaskList[]> =>
  get(`/boards/${boardId}/lists`);

export const fetchCards = (listId: string): Promise<Card[]> => get(`/lists/${listId}/cards`);

export const searchCards = (params: SearchParams): Promise<Card[]> => {
  const q = new URLSearchParams();
  if (params.title) q.set('title', params.title);
  if (params.priority) q.set('priority', params.priority);
  if (params.dueDate) q.set('dueDate', params.dueDate);
  return get(`/cards/search?${q.toString()}`);
};

export const createBoard = (title: string): Promise<Board> => post('/boards', { title });

export const createList = (boardId: string, title: string): Promise<TaskList> =>
  post(`/boards/${boardId}/lists`, { title });

export const createCard = (
  listId: string,
  data: { title: string; memo?: string; priority?: string; dueDate?: string }
): Promise<Card> => post(`/lists/${listId}/cards`, data);

export const updateBoard = (id: string, body: { title: string }): Promise<Board> =>
  put(`/boards/${id}`, body);

export const updateList = (
  id: string,
  body: { title: string; position: number }
): Promise<TaskList> => put(`/lists/${id}`, body);

export const updateCard = (
  id: string,
  body: {
    title: string;
    memo?: string | null;
    priority?: string | null;
    dueDate?: string | null;
    position: number;
  }
): Promise<Card> => put(`/cards/${id}`, body);

export type ReorderItem = { id: string; position: number };

export const reorderBoards = (items: ReorderItem[]): Promise<void> =>
  patch('/boards/reorder', items);

export const reorderLists = (boardId: string, items: ReorderItem[]): Promise<void> =>
  patch(`/boards/${boardId}/lists/reorder`, items);

export const reorderCards = (listId: string, items: ReorderItem[]): Promise<void> =>
  patch(`/lists/${listId}/cards/reorder`, items);

export const moveCard = (
  cardId: string,
  body: { listId: string; position: number }
): Promise<Card> => patchJson(`/cards/${cardId}/move`, body);

export const deleteBoard = (id: string): Promise<void> => del(`/boards/${id}`);
export const deleteList = (id: string): Promise<void> => del(`/lists/${id}`);
export const deleteCard = (id: string): Promise<void> => del(`/cards/${id}`);

import { useState, useRef } from 'react';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { fetchBoards, fetchLists, fetchCards, updateBoard } from '../api/client';
import { ListColumn } from './ListColumn';
import AddListButton from './AddListButton';
import type { TaskList } from '../types/board';

export function BoardView() {
  const queryClient = useQueryClient();
  const [selectedBoardId, setSelectedBoardId] = useState<string | null>(null);
  const [editingBoardId, setEditingBoardId] = useState<string | null>(null);
  const [boardTitleInput, setBoardTitleInput] = useState('');
  const boardTitleInputRef = useRef<HTMLInputElement>(null);

  const boardUpdateMutation = useMutation({
    mutationFn: ({ id, title }: { id: string; title: string }) => updateBoard(id, { title }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['boards'] });
      setEditingBoardId(null);
    },
    onError: () => setEditingBoardId(null),
  });

  const startEditingBoard = (id: string, currentTitle: string) => {
    setBoardTitleInput(currentTitle);
    setEditingBoardId(id);
    setTimeout(() => boardTitleInputRef.current?.select(), 0);
  };

  const commitBoardTitle = (id: string, originalTitle: string) => {
    const trimmed = boardTitleInput.trim();
    if (!trimmed || trimmed === originalTitle) {
      setEditingBoardId(null);
      return;
    }
    boardUpdateMutation.mutate({ id, title: trimmed });
  };

  const handleBoardTitleKeyDown = (e: React.KeyboardEvent, id: string, originalTitle: string) => {
    if (e.key === 'Enter') commitBoardTitle(id, originalTitle);
    if (e.key === 'Escape') setEditingBoardId(null);
  };

  const { data: boards, isLoading: loadingBoards, error: boardError } = useQuery({
    queryKey: ['boards'],
    queryFn: fetchBoards,
  });

  const board = boards?.find((b) => b.id === selectedBoardId) ?? boards?.[0];

  const { data: lists, isLoading: loadingLists } = useQuery({
    queryKey: ['lists', board?.id],
    queryFn: () => fetchLists(board!.id),
    enabled: !!board,
  });

  const listsWithCards = useQuery({
    queryKey: ['listsWithCards', lists?.map((l) => `${l.id}-${l.updatedAt}`)],
    queryFn: async () => {
      if (!lists) return [];
      const results = await Promise.all(
        lists.map(async (list) => {
          const cards = await fetchCards(list.id);
          return { ...list, cards } as TaskList;
        })
      );
      return results;
    },
    enabled: !!lists && lists.length > 0,
  });

  if (loadingBoards) {
    return <div className="loading">読み込み中...</div>;
  }

  if (boardError) {
    return (
      <div className="error-state">
        <p className="error">サーバーに接続できませんでした</p>
        <button
          className="btn-retry"
          onClick={() => queryClient.invalidateQueries({ queryKey: ['boards'] })}
        >
          再試行
        </button>
      </div>
    );
  }

  if (!board) {
    return <div className="empty-board">ボードがありません</div>;
  }

  return (
    <div className="board-container">
      <div className="board-tabs">
        {(boards ?? []).map((b) => (
          <div
            key={b.id}
            className={`board-tab${b.id === board.id ? ' board-tab--active' : ''}`}
            onClick={() => setSelectedBoardId(b.id)}
          >
            {editingBoardId === b.id ? (
              <input
                ref={boardTitleInputRef}
                className="board-tab-input"
                value={boardTitleInput}
                onChange={e => setBoardTitleInput(e.target.value)}
                onBlur={() => commitBoardTitle(b.id, b.title)}
                onKeyDown={e => handleBoardTitleKeyDown(e, b.id, b.title)}
                onClick={e => e.stopPropagation()}
                disabled={boardUpdateMutation.isPending}
              />
            ) : (
              <span onDoubleClick={e => { e.stopPropagation(); startEditingBoard(b.id, b.title); }}>
                {b.title}
              </span>
            )}
          </div>
        ))}
      </div>
      <div className="board">
        {loadingLists || listsWithCards.isLoading ? (
          <div className="loading">読み込み中...</div>
        ) : (
          <>
            {(listsWithCards.data ?? []).map((list) => (
              <ListColumn key={list.id} list={list} boardId={board.id} />
            ))}
            <AddListButton boardId={board.id} />
          </>
        )}
      </div>
    </div>
  );
}

import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { fetchBoards, fetchLists, fetchCards } from '../api/client';
import { ListColumn } from './ListColumn';
import AddListButton from './AddListButton';
import type { TaskList } from '../types/board';

export function BoardView() {
  const queryClient = useQueryClient();
  const [selectedBoardId, setSelectedBoardId] = useState<string | null>(null);

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
    queryKey: ['listsWithCards', lists?.map((l) => l.id)],
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
          <button
            key={b.id}
            className={`board-tab${b.id === board.id ? ' board-tab--active' : ''}`}
            onClick={() => setSelectedBoardId(b.id)}
          >
            {b.title}
          </button>
        ))}
      </div>
      <div className="board">
        {loadingLists || listsWithCards.isLoading ? (
          <div className="loading">読み込み中...</div>
        ) : (
          <>
            {(listsWithCards.data ?? []).map((list) => (
              <ListColumn key={list.id} list={list} />
            ))}
            <AddListButton boardId={board.id} />
          </>
        )}
      </div>
    </div>
  );
}

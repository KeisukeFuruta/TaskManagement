import { useQuery } from '@tanstack/react-query';
import { fetchBoards, fetchLists, fetchCards } from '../api/client';
import { ListColumn } from './ListColumn';
import type { TaskList } from '../types/board';

export function BoardView() {
  const { data: boards, isLoading: loadingBoards, error: boardError } = useQuery({
    queryKey: ['boards'],
    queryFn: fetchBoards,
  });

  const board = boards?.[0];

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

  if (loadingBoards || loadingLists || listsWithCards.isLoading) {
    return <div className="loading">読み込み中...</div>;
  }

  if (boardError) {
    return <div className="error">ボードの読み込みに失敗しました</div>;
  }

  if (!board) {
    return <div className="empty-board">ボードがありません</div>;
  }

  return (
    <div className="board-container">
      <h2 className="board-title">{board.title}</h2>
      <div className="board">
        {(listsWithCards.data ?? []).map((list) => (
          <ListColumn key={list.id} list={list} />
        ))}
      </div>
    </div>
  );
}

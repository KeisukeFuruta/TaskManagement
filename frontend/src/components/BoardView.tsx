import { useState, useRef, useEffect, useCallback } from 'react';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import {
  DndContext,
  DragOverlay,
  closestCenter,
  pointerWithin,
  rectIntersection,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
  type DragOverEvent,
  type CollisionDetection,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  horizontalListSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable';
import {
  fetchBoards,
  fetchLists,
  fetchCards,
  updateBoard,
  reorderBoards,
  reorderLists,
  reorderCards,
  moveCard,
  type ReorderItem,
} from '../api/client';
import { SortableList } from './SortableList';
import { SortableBoardTab } from './SortableBoardTab';
import { CardItem } from './CardItem';
import AddListButton from './AddListButton';
import type { Board, TaskList, Card } from '../types/board';

const PRIORITY_ORDER: Record<string, number> = { urgent: 0, high: 1, medium: 2, low: 3 };

export function BoardView() {
  const queryClient = useQueryClient();
  const [selectedBoardId, setSelectedBoardId] = useState<string | null>(null);
  const [editingBoardId, setEditingBoardId] = useState<string | null>(null);
  const [boardTitleInput, setBoardTitleInput] = useState('');
  const boardTitleInputRef = useRef<HTMLInputElement>(null);

  const [localBoards, setLocalBoards] = useState<Board[]>([]);
  const [localLists, setLocalLists] = useState<TaskList[]>([]);
  const [activeCard, setActiveCard] = useState<Card | null>(null);

  // Refs to track drag source/current list without causing re-renders
  const activeCardSourceListId = useRef<string | null>(null);
  const draggingCardCurrentListId = useRef<string | null>(null);
  const isDragging = useRef(false);

  // rectIntersection primary: カードのbounding rectが対象に重なるかで判定
  // pointerWithin（前の実装）はポインター位置ベースなので、少し横にズレるだけで隣リストに誤検知する
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const cardAwareCollision = useCallback<CollisionDetection>((args) => {
    if (args.active.data.current?.type === 'card') {
      const currentListId = draggingCardCurrentListId.current;
      const intersecting = rectIntersection(args);

      if (intersecting.length > 0) {
        if (currentListId) {
          const inCurrentList = intersecting.filter(({ id }) => {
            const data = args.droppableContainers.find(c => c.id === id)?.data?.current;
            return data?.listId === currentListId ||
                   (data?.type === 'list-container' && data?.listId === currentListId);
          });
          if (inCurrentList.length > 0) return inCurrentList;
        }
        return intersecting;
      }

      // カード間の隙間フォールバック: 現在リスト内のみ（クロスリスト誤検知を防ぐ）
      const within = pointerWithin(args);
      if (!currentListId) return within;
      return within.filter(({ id }) => {
        const data = args.droppableContainers.find(c => c.id === id)?.data?.current;
        return data?.listId === currentListId ||
               (data?.type === 'list-container' && data?.listId === currentListId);
      });
    }
    return closestCenter(args);
  }, []);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const boardUpdateMutation = useMutation({
    mutationFn: ({ id, title }: { id: string; title: string }) => updateBoard(id, { title }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['boards'] });
      setEditingBoardId(null);
    },
    onError: () => setEditingBoardId(null),
  });

  const reorderBoardsMutation = useMutation({
    mutationFn: (items: ReorderItem[]) => reorderBoards(items),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['boards'] }),
    onError: () => { if (boards) setLocalBoards(boards); },
  });

  const reorderListsMutation = useMutation({
    mutationFn: ({ boardId, items }: { boardId: string; items: ReorderItem[] }) =>
      reorderLists(boardId, items),
    onSuccess: (_, { boardId }) =>
      queryClient.invalidateQueries({ queryKey: ['listsWithCards', boardId] }),
    onError: () => { if (listsWithCards.data) setLocalLists(listsWithCards.data); },
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
    queryKey: ['listsWithCards', board?.id],
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

  useEffect(() => {
    if (boards) setLocalBoards(boards);
  }, [boards]);

  useEffect(() => {
    if (listsWithCards.data && !isDragging.current) setLocalLists(listsWithCards.data);
  }, [listsWithCards.data]);

  function handleSortCards(listId: string, by: 'priority' | 'dueDate') {
    const list = localLists.find(l => l.id === listId);
    if (!list) return;

    const sorted = [...list.cards].sort((a, b) => {
      if (by === 'priority') {
        const pa = PRIORITY_ORDER[a.priority ?? ''] ?? 4;
        const pb = PRIORITY_ORDER[b.priority ?? ''] ?? 4;
        if (pa !== pb) return pa - pb;
        // Secondary sort by dueDate (null goes last)
        if (!a.dueDate && !b.dueDate) return 0;
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return a.dueDate.localeCompare(b.dueDate);
      } else {
        if (!a.dueDate && !b.dueDate) return 0;
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return a.dueDate.localeCompare(b.dueDate);
      }
    });

    setLocalLists(prev => prev.map(l => l.id === listId ? { ...l, cards: sorted } : l));

    const items = sorted.map((c, i) => ({ id: c.id, position: i }));
    reorderCards(listId, items).then(() => {
      queryClient.invalidateQueries({ queryKey: ['listsWithCards', board?.id] });
    });
  }

  function handleDragStart(event: DragStartEvent) {
    isDragging.current = true;
    const { active } = event;
    if (active.data.current?.type === 'card') {
      const listId = active.data.current.listId as string;
      activeCardSourceListId.current = listId;
      draggingCardCurrentListId.current = listId;
      const sourceList = localLists.find(l => l.id === listId);
      setActiveCard(sourceList?.cards.find(c => c.id === active.id) ?? null);
    }
  }

  function handleDragOver(event: DragOverEvent) {
    const { active, over } = event;
    if (!over || active.data.current?.type !== 'card') return;

    const currentListId = draggingCardCurrentListId.current;
    if (!currentListId) return;

    const activeId = active.id as string;
    const overData = over.data.current;

    let targetListId: string;
    if (overData?.type === 'card') {
      targetListId = overData.listId as string;
    } else if (overData?.type === 'list-container') {
      targetListId = overData.listId as string;
    } else {
      return;
    }

    if (currentListId === targetListId) return;

    setLocalLists(prev => {
      const currentList = prev.find(l => l.id === currentListId);
      const targetList = prev.find(l => l.id === targetListId);
      if (!currentList || !targetList) return prev;

      const card = currentList.cards.find(c => c.id === activeId);
      if (!card) return prev;

      const newCurrentCards = currentList.cards.filter(c => c.id !== activeId);

      let insertIndex: number;
      if (overData?.type === 'card') {
        insertIndex = targetList.cards.findIndex(c => c.id === over.id);
        if (insertIndex === -1) insertIndex = targetList.cards.length;
      } else {
        insertIndex = targetList.cards.length;
      }

      const newTargetCards = [...targetList.cards];
      newTargetCards.splice(insertIndex, 0, card);

      return prev.map(l => {
        if (l.id === currentListId) return { ...l, cards: newCurrentCards };
        if (l.id === targetListId) return { ...l, cards: newTargetCards };
        return l;
      });
    });

    draggingCardCurrentListId.current = targetListId;
  }

  function handleDragEnd(event: DragEndEvent) {
    isDragging.current = false;
    setActiveCard(null);
    const { active, over } = event;
    const type = active.data.current?.type as 'board' | 'list' | 'card' | undefined;

    if (type === 'card') {
      const originalListId = activeCardSourceListId.current;
      const currentListId = draggingCardCurrentListId.current;
      activeCardSourceListId.current = null;
      draggingCardCurrentListId.current = null;

      if (!originalListId || !currentListId || !over) return;

      if (currentListId !== originalListId) {
        // Cross-list: card was already moved visually by onDragOver, persist now
        const targetList = localLists.find(l => l.id === currentListId);
        const sourceList = localLists.find(l => l.id === originalListId);
        if (!targetList) return;

        const newPosition = targetList.cards.findIndex(c => c.id === active.id);
        if (newPosition === -1) return;

        moveCard(active.id as string, { listId: currentListId, position: newPosition })
          .then(() => Promise.all([
            reorderCards(currentListId, targetList.cards.map((c, i) => ({ id: c.id, position: i }))),
            ...(sourceList
              ? [reorderCards(originalListId, sourceList.cards.map((c, i) => ({ id: c.id, position: i })))]
              : []),
          ]))
          .then(() => queryClient.invalidateQueries({ queryKey: ['listsWithCards', board?.id] }));
      } else {
        // Same list: use over position for final reorder
        if (!over || active.id === over.id) return;

        const sourceList = localLists.find(l => l.id === currentListId);
        if (!sourceList) return;

        const oldIndex = sourceList.cards.findIndex(c => c.id === active.id);
        const newIndex = sourceList.cards.findIndex(c => c.id === over.id);
        if (oldIndex === -1 || newIndex === -1) return;

        const reorderedCards = arrayMove(sourceList.cards, oldIndex, newIndex);
        setLocalLists(prev =>
          prev.map(l => l.id === sourceList.id ? { ...l, cards: reorderedCards } : l)
        );
        const items = reorderedCards.map((c, i) => ({ id: c.id, position: i }));
        reorderCards(sourceList.id, items).then(() => {
          queryClient.invalidateQueries({ queryKey: ['listsWithCards', board?.id] });
        });
      }
      return;
    }

    if (!over || active.id === over.id) return;

    if (type === 'board') {
      const oldIndex = localBoards.findIndex(b => b.id === active.id);
      const newIndex = localBoards.findIndex(b => b.id === over.id);
      if (oldIndex === -1 || newIndex === -1) return;
      const reordered = arrayMove(localBoards, oldIndex, newIndex);
      setLocalBoards(reordered);
      const items = reordered.map((b, i) => ({ id: b.id, position: i }));
      reorderBoardsMutation.mutate(items);

    } else if (type === 'list') {
      const oldIndex = localLists.findIndex(l => l.id === active.id);
      const newIndex = localLists.findIndex(l => l.id === over.id);
      if (oldIndex === -1 || newIndex === -1 || !board) return;
      const reordered = arrayMove(localLists, oldIndex, newIndex);
      setLocalLists(reordered);
      const items = reordered.map((l, i) => ({ id: l.id, position: i }));
      reorderListsMutation.mutate({ boardId: board.id, items });
    }
  }

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
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
      collisionDetection={cardAwareCollision}
      autoScroll={{ threshold: { x: 0, y: 0.2 } }}
    >
      <div className="board-container">
        <SortableContext items={localBoards.map(b => b.id)} strategy={horizontalListSortingStrategy}>
          <div className="board-tabs">
            {localBoards.map((b) => (
              <SortableBoardTab
                key={b.id}
                board={b}
                isActive={b.id === board.id}
                isEditing={editingBoardId === b.id}
                titleInput={boardTitleInput}
                inputRef={boardTitleInputRef}
                onSelect={() => setSelectedBoardId(b.id)}
                onDoubleClick={() => startEditingBoard(b.id, b.title)}
                onTitleChange={setBoardTitleInput}
                onBlur={() => commitBoardTitle(b.id, b.title)}
                onKeyDown={(e) => handleBoardTitleKeyDown(e, b.id, b.title)}
                isPending={boardUpdateMutation.isPending}
              />
            ))}
          </div>
        </SortableContext>

        <div className="board">
          {loadingLists || listsWithCards.isLoading ? (
            <div className="loading">読み込み中...</div>
          ) : (
            <>
              <SortableContext items={localLists.map(l => l.id)} strategy={horizontalListSortingStrategy}>
                {localLists.map((list) => (
                  <SortableList
                    key={list.id}
                    list={list}
                    boardId={board.id}
                    onSortCards={(by) => handleSortCards(list.id, by)}
                  />
                ))}
              </SortableContext>
              <AddListButton boardId={board.id} />
            </>
          )}
        </div>
      </div>
      <DragOverlay>
        {activeCard ? <CardItem card={activeCard} /> : null}
      </DragOverlay>
    </DndContext>
  );
}

import { useState, useRef } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import type { TaskList } from '../types/board';
import { updateList, deleteList } from '../api/client';
import { SortableCard } from './SortableCard';
import AddCardModal from './AddCardModal';
import ConfirmModal from './ConfirmModal';

interface Props {
  list: TaskList;
  boardId: string;
  dragHandleProps?: React.HTMLAttributes<HTMLSpanElement>;
  onSortCards: (by: 'priority' | 'dueDate') => void;
}

export function ListColumn({ list, boardId, dragHandleProps, onSortCards }: Props) {
  const { setNodeRef: setDropRef } = useDroppable({
    id: `list-drop-${list.id}`,
    data: { type: 'list-container', listId: list.id },
  });

  const [editing, setEditing] = useState(false);
  const [titleInput, setTitleInput] = useState(list.title);
  const inputRef = useRef<HTMLInputElement>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const queryClient = useQueryClient();
  const deleteMutation = useMutation({
    mutationFn: () => deleteList(list.id),
    onSuccess: () => {
      setConfirmDelete(false);
      queryClient.invalidateQueries({ queryKey: ['listsWithCards', boardId] });
      queryClient.invalidateQueries({ queryKey: ['lists', boardId] });
    },
  });

  const mutation = useMutation({
    mutationFn: (title: string) => updateList(list.id, { title, position: list.position }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['listsWithCards', boardId] });
      setEditing(false);
    },
    onError: () => {
      setTitleInput(list.title);
      setEditing(false);
    },
  });

  const startEditing = () => {
    setTitleInput(list.title);
    setEditing(true);
    setTimeout(() => inputRef.current?.select(), 0);
  };

  const commit = () => {
    const trimmed = titleInput.trim();
    if (!trimmed || trimmed === list.title) {
      setEditing(false);
      setTitleInput(list.title);
      return;
    }
    mutation.mutate(trimmed);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.nativeEvent.isComposing) commit();
    if (e.key === 'Escape') {
      setEditing(false);
      setTitleInput(list.title);
    }
  };

  return (
    <div className="list">
      <div className="list-header">
        <span className="drag-handle list-drag-handle" {...dragHandleProps} title="ドラッグして並び替え">
          ⠿
        </span>
        {editing ? (
          <input
            ref={inputRef}
            className="form-input list-title-input"
            value={titleInput}
            onChange={e => setTitleInput(e.target.value)}
            onBlur={commit}
            onKeyDown={handleKeyDown}
            disabled={mutation.isPending}
          />
        ) : (
          <span className="list-title" onDoubleClick={startEditing} title="ダブルクリックで編集">
            {list.title}
          </span>
        )}
        <span className="card-count">{list.cards.length}</span>
        <button
          className="list-delete-btn"
          onClick={() => setConfirmDelete(true)}
          title="リストを削除"
        >
          ×
        </button>
        <div className="sort-buttons">
          <button
            className="btn-sort"
            onClick={() => onSortCards('priority')}
            title="優先度順に並び替え（保存されます）"
          >
            優先度順
          </button>
          <button
            className="btn-sort"
            onClick={() => onSortCards('dueDate')}
            title="日付順に並び替え（保存されます）"
          >
            日付順
          </button>
        </div>
      </div>
      <div className="cards" ref={setDropRef}>
        <SortableContext items={list.cards.map(c => c.id)} strategy={verticalListSortingStrategy}>
          {list.cards.map((card) => (
            <SortableCard key={card.id} card={card} listId={list.id} />
          ))}
        </SortableContext>
        {list.cards.length === 0 && (
          <p className="empty-list">カードがありません</p>
        )}
      </div>
      <AddCardModal listId={list.id} />
      {confirmDelete && (
        <ConfirmModal
          message={`「${list.title}」を削除しますか？\nカードもすべて削除されます。`}
          onConfirm={() => deleteMutation.mutate()}
          onCancel={() => setConfirmDelete(false)}
          isPending={deleteMutation.isPending}
        />
      )}
    </div>
  );
}

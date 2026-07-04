import { useState, useRef } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { TaskList } from '../types/board';
import { updateList } from '../api/client';
import { CardItem } from './CardItem';
import AddCardModal from './AddCardModal';

interface Props {
  list: TaskList;
  boardId: string;
}

export function ListColumn({ list, boardId }: Props) {
  const [editing, setEditing] = useState(false);
  const [titleInput, setTitleInput] = useState(list.title);
  const inputRef = useRef<HTMLInputElement>(null);

  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: (title: string) => updateList(list.id, { title, position: list.position }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lists', boardId] });
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
    if (e.key === 'Enter') commit();
    if (e.key === 'Escape') {
      setEditing(false);
      setTitleInput(list.title);
    }
  };

  return (
    <div className="list">
      <div className="list-header">
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
      </div>
      <div className="cards">
        {list.cards.map((card) => (
          <CardItem key={card.id} card={card} />
        ))}
        {list.cards.length === 0 && (
          <p className="empty-list">カードがありません</p>
        )}
      </div>
      <AddCardModal listId={list.id} />
    </div>
  );
}

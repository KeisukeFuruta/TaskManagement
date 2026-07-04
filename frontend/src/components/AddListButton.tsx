import { useState, useRef, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createList } from '../api/client';

interface Props {
  boardId: string;
}

export default function AddListButton({ boardId }: Props) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: (listTitle: string) => createList(boardId, listTitle),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['listsWithCards', boardId] });
    },
  });

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  const handleSubmit = () => {
    const trimmed = title.trim();
    if (!trimmed) return;
    setOpen(false);
    setTitle('');
    mutation.mutate(trimmed);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.nativeEvent.isComposing) handleSubmit();
    if (e.key === 'Escape') setOpen(false);
  };

  if (!open) {
    return (
      <div className="add-list-col">
        <button className="btn-add-list" onClick={() => setOpen(true)}>
          + リストを追加
        </button>
      </div>
    );
  }

  return (
    <div className="add-list-col">
      <div className="add-list-form">
        <input
          ref={inputRef}
          className="add-list-input"
          value={title}
          onChange={e => setTitle(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="リスト名を入力"
        />
        <div className="add-list-actions">
          <button
            className="btn-primary"
            onClick={handleSubmit}
            disabled={!title.trim()}
          >
            追加
          </button>
          <button className="btn-secondary" onClick={() => setOpen(false)}>✕</button>
        </div>
      </div>
    </div>
  );
}

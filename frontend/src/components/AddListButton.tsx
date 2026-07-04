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
    mutationFn: () => createList(boardId, title),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lists'] });
      queryClient.invalidateQueries({ queryKey: ['listsWithCards'] });
      setTitle('');
      setOpen(false);
    },
  });

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  const handleSubmit = () => {
    if (title.trim()) mutation.mutate();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSubmit();
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
            disabled={!title.trim() || mutation.isPending}
          >
            {mutation.isPending ? '追加中...' : '追加'}
          </button>
          <button className="btn-secondary" onClick={() => setOpen(false)}>✕</button>
        </div>
      </div>
    </div>
  );
}

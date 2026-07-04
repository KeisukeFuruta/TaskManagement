import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createCard } from '../api/client';

interface Props {
  listId: string;
}

export default function AddCardModal({ listId }: Props) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [memo, setMemo] = useState('');
  const [priority, setPriority] = useState('');
  const [dueDate, setDueDate] = useState('');

  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: () => createCard(listId, { title, memo: memo || undefined, priority: priority || undefined, dueDate: dueDate || undefined }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['listsWithCards'] });
      handleClose();
    },
  });

  const handleClose = () => {
    setOpen(false);
    setTitle('');
    setMemo('');
    setPriority('');
    setDueDate('');
  };

  return (
    <>
      <button className="btn-add-card" onClick={() => setOpen(true)}>
        + カードを追加
      </button>

      {open && (
        <div className="modal-overlay" onClick={handleClose}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2>カードを追加</h2>

            <div className="form-group">
              <label>タイトル *</label>
              <input
                className="form-input"
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="カードのタイトル"
                autoFocus
              />
            </div>

            <div className="form-group">
              <label>メモ</label>
              <textarea
                className="form-textarea"
                value={memo}
                onChange={e => setMemo(e.target.value)}
                placeholder="メモ（任意）"
              />
            </div>

            <div className="form-group">
              <label>優先度</label>
              <select className="form-select" value={priority} onChange={e => setPriority(e.target.value)}>
                <option value="">なし</option>
                <option value="urgent">緊急</option>
                <option value="high">高</option>
                <option value="medium">中</option>
                <option value="low">低</option>
              </select>
            </div>

            <div className="form-group">
              <label>期限日</label>
              <input
                type="date"
                className="form-input"
                value={dueDate}
                onChange={e => setDueDate(e.target.value)}
              />
            </div>

            <div className="modal-actions">
              <button className="btn-secondary" onClick={handleClose}>キャンセル</button>
              <button
                className="btn-primary"
                onClick={() => mutation.mutate()}
                disabled={!title.trim() || mutation.isPending}
              >
                {mutation.isPending ? '追加中...' : '追加'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

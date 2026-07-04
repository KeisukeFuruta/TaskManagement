import { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateCard } from '../api/client';
import type { Card } from '../types/board';

interface Props {
  card: Card;
  onClose: () => void;
}

export default function EditCardModal({ card, onClose }: Props) {
  const [title, setTitle] = useState(card.title);
  const [memo, setMemo] = useState(card.memo ?? '');
  const [priority, setPriority] = useState((card.priority ?? '').toLowerCase());
  const [dueDate, setDueDate] = useState(card.dueDate ?? '');

  useEffect(() => {
    setTitle(card.title);
    setMemo(card.memo ?? '');
    setPriority((card.priority ?? '').toLowerCase());
    setDueDate(card.dueDate ?? '');
  }, [card]);

  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: () =>
      updateCard(card.id, {
        title,
        memo: memo || null,
        priority: priority || null,
        dueDate: dueDate || null,
        position: card.position,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['listsWithCards'] });
      onClose();
    },
  });

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <h2>カードを編集</h2>

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
          <button className="btn-secondary" onClick={onClose}>キャンセル</button>
          <button
            className="btn-primary"
            onClick={() => mutation.mutate()}
            disabled={!title.trim() || mutation.isPending}
          >
            {mutation.isPending ? '保存中...' : '保存'}
          </button>
        </div>
      </div>
    </div>
  );
}

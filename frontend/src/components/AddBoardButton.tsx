import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createBoard } from '../api/client';

export default function AddBoardButton() {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');

  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: () => createBoard(title),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['boards'] });
      handleClose();
    },
  });

  const handleClose = () => {
    setOpen(false);
    setTitle('');
  };

  return (
    <>
      <button className="btn-add-board" onClick={() => setOpen(true)}>
        + ボードを追加
      </button>

      {open && (
        <div className="modal-overlay" onClick={handleClose}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2>ボードを追加</h2>

            <div className="form-group">
              <label>ボード名 *</label>
              <input
                className="form-input"
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="ボード名を入力"
                autoFocus
                onKeyDown={e => { if (e.key === 'Enter' && !e.nativeEvent.isComposing && title.trim()) mutation.mutate(); }}
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

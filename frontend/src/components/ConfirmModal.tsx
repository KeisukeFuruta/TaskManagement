interface Props {
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  isPending?: boolean;
}

export default function ConfirmModal({ message, onConfirm, onCancel, isPending }: Props) {
  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal modal--confirm" onClick={e => e.stopPropagation()}>
        <p className="confirm-message">{message}</p>
        <div className="modal-actions">
          <button className="btn-secondary" onClick={onCancel} disabled={isPending}>
            キャンセル
          </button>
          <button className="btn-danger" onClick={onConfirm} disabled={isPending}>
            {isPending ? '削除中...' : '削除'}
          </button>
        </div>
      </div>
    </div>
  );
}

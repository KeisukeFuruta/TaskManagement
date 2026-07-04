import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { Board } from '../types/board';

interface Props {
  board: Board;
  isActive: boolean;
  isEditing: boolean;
  titleInput: string;
  inputRef: React.RefObject<HTMLInputElement | null>;
  onSelect: () => void;
  onDoubleClick: () => void;
  onTitleChange: (value: string) => void;
  onBlur: () => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
  isPending: boolean;
  onDelete: () => void;
}

export function SortableBoardTab({
  board,
  isActive,
  isEditing,
  titleInput,
  inputRef,
  onSelect,
  onDoubleClick,
  onTitleChange,
  onBlur,
  onKeyDown,
  isPending,
  onDelete,
}: Props) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: board.id, data: { type: 'board' } });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`board-tab${isActive ? ' board-tab--active' : ''}`}
      onClick={onSelect}
      {...attributes}
      {...listeners}
    >
      {isEditing ? (
        <input
          ref={inputRef}
          className="board-tab-input"
          value={titleInput}
          onChange={e => onTitleChange(e.target.value)}
          onBlur={onBlur}
          onKeyDown={onKeyDown}
          onClick={e => e.stopPropagation()}
          disabled={isPending}
        />
      ) : (
        <>
          <span onDoubleClick={e => { e.stopPropagation(); onDoubleClick(); }}>
            {board.title}
          </span>
          <button
            className="board-tab-delete"
            onClick={e => { e.stopPropagation(); onDelete(); }}
            title="ボードを削除"
          >
            ×
          </button>
        </>
      )}
    </div>
  );
}

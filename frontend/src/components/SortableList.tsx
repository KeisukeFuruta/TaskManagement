import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { ListColumn } from './ListColumn';
import type { TaskList } from '../types/board';

interface Props {
  list: TaskList;
  boardId: string;
  onSortCards: (by: 'priority' | 'dueDate') => void;
}

export function SortableList({ list, boardId, onSortCards }: Props) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: list.id, data: { type: 'list' } });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style}>
      <ListColumn
        list={list}
        boardId={boardId}
        dragHandleProps={{ ...attributes, ...listeners }}
        onSortCards={onSortCards}
      />
    </div>
  );
}

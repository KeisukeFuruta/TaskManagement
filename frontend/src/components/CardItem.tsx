import { useState } from 'react';
import type { Card } from '../types/board';
import EditCardModal from './EditCardModal';

const PRIORITY_LABEL: Record<string, string> = {
  urgent: '緊急',
  high: '高',
  medium: '中',
  low: '低',
};

function getDueClass(dueDate: string | null): string {
  if (!dueDate) return '';
  const today = new Date().toISOString().slice(0, 10);
  if (dueDate < today) return 'overdue';
  if (dueDate === today) return 'today';
  return '';
}

interface Props {
  card: Card;
}

export function CardItem({ card }: Props) {
  const [editing, setEditing] = useState(false);
  const priority = (card.priority ?? 'none').toLowerCase();
  const dueClass = getDueClass(card.dueDate);

  return (
    <>
      <div className={`card priority-${priority}`} onClick={() => setEditing(true)}>
        {priority !== 'none' && (
          <div className={`card-priority ${priority}`}>
            {PRIORITY_LABEL[priority] ?? priority}
          </div>
        )}
        <div className="card-title">{card.title}</div>
        {card.dueDate && (
          <div className={`card-due ${dueClass}`}>
            📅 {card.dueDate.replace(/-/g, '/')}
          </div>
        )}
      </div>

      {editing && (
        <EditCardModal card={card} onClose={() => setEditing(false)} />
      )}
    </>
  );
}

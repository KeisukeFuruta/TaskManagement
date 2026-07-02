import type { Card } from '../types/board';

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
  const priority = card.priority ?? 'none';
  const dueClass = getDueClass(card.dueDate);

  return (
    <div className={`card priority-${priority}`}>
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
  );
}

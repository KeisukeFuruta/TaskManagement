import type { TaskList } from '../types/board';
import { CardItem } from './CardItem';

interface Props {
  list: TaskList;
}

export function ListColumn({ list }: Props) {
  return (
    <div className="list">
      <div className="list-header">
        <span className="list-title">{list.title}</span>
        <span className="card-count">{list.cards.length}</span>
      </div>
      <div className="cards">
        {list.cards.map((card) => (
          <CardItem key={card.id} card={card} />
        ))}
        {list.cards.length === 0 && (
          <p className="empty-list">カードがありません</p>
        )}
      </div>
    </div>
  );
}

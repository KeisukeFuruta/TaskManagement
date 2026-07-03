import { useQuery } from '@tanstack/react-query';
import { searchCards } from '../api/client';
import { CardItem } from './CardItem';
import type { SearchParams } from '../types/board';

interface Props {
  params: SearchParams;
}

export function SearchResults({ params }: Props) {
  const { data: cards, isLoading, error } = useQuery({
    queryKey: ['search', params],
    queryFn: () => searchCards(params),
  });

  if (isLoading) return <div className="loading">検索中...</div>;
  if (error) return <div className="error">検索に失敗しました</div>;

  return (
    <div className="search-results">
      <h2 className="search-results-title">
        検索結果 <span className="result-count">{cards?.length ?? 0} 件</span>
      </h2>
      {cards && cards.length > 0 ? (
        <div className="search-cards">
          {cards.map((card) => (
            <CardItem key={card.id} card={card} />
          ))}
        </div>
      ) : (
        <p className="no-results">該当するカードが見つかりませんでした</p>
      )}
    </div>
  );
}

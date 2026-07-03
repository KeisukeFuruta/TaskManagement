import { useState } from 'react';
import type { SearchParams } from '../types/board';

interface Props {
  onSearch: (params: SearchParams) => void;
  onClear: () => void;
  isSearching: boolean;
}

export function SearchBar({ onSearch, onClear, isSearching }: Props) {
  const [title, setTitle] = useState('');
  const [priority, setPriority] = useState('');
  const [dueDate, setDueDate] = useState('');

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSearch({ title: title || undefined, priority: priority || undefined, dueDate: dueDate || undefined });
  }

  function handleClear() {
    setTitle('');
    setPriority('');
    setDueDate('');
    onClear();
  }

  return (
    <form className="search-bar" onSubmit={handleSubmit}>
      <input
        className="search-input"
        type="text"
        placeholder="タイトルで検索..."
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
      <select
        className="search-select"
        value={priority}
        onChange={(e) => setPriority(e.target.value)}
      >
        <option value="">優先度 (全て)</option>
        <option value="urgent">緊急</option>
        <option value="high">高</option>
        <option value="medium">中</option>
        <option value="low">低</option>
      </select>
      <input
        className="search-date"
        type="date"
        value={dueDate}
        onChange={(e) => setDueDate(e.target.value)}
      />
      <button className="btn-search" type="submit">検索</button>
      {isSearching && (
        <button className="btn-clear" type="button" onClick={handleClear}>
          クリア
        </button>
      )}
    </form>
  );
}

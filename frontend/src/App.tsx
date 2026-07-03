import { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BoardView } from './components/BoardView';
import { SearchBar } from './components/SearchBar';
import { SearchResults } from './components/SearchResults';
import type { SearchParams } from './types/board';
import './App.css';

const queryClient = new QueryClient();

function AppContent() {
  const [searchParams, setSearchParams] = useState<SearchParams | null>(null);

  return (
    <div className="app">
      <header className="header">
        <h1 className="app-title">TaskBoard</h1>
        <SearchBar
          onSearch={(params) => setSearchParams(params)}
          onClear={() => setSearchParams(null)}
          isSearching={searchParams !== null}
        />
      </header>
      <main className="main">
        {searchParams ? (
          <SearchResults params={searchParams} />
        ) : (
          <BoardView />
        )}
      </main>
    </div>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppContent />
    </QueryClientProvider>
  );
}

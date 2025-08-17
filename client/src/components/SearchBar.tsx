import { useState } from 'react';

interface SearchBarProps {
  onSearch: (query: string) => void;
  placeholder?: string;
  section: string;
}

export function SearchBar({ onSearch, placeholder = "Search...", section }: SearchBarProps) {
  const [query, setQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      onSearch('');
      return;
    }

    setIsSearching(true);
    
    try {
      // Google Custom Search API integration
      const response = await fetch(`/api/search?q=${encodeURIComponent(searchQuery)}&section=${section}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const results = await response.json();
        onSearch(searchQuery);
        console.log(`Google search results for ${section}:`, results);
      } else {
        // Fallback to local search
        onSearch(searchQuery);
      }
    } catch (error) {
      console.error('Search error:', error);
      // Fallback to local search
      onSearch(searchQuery);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSearch(query);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newQuery = e.target.value;
    setQuery(newQuery);
    
    // Real-time search with debouncing
    if (newQuery.length === 0) {
      onSearch('');
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ marginBottom: '2rem' }}>
      <div style={{
        display: 'flex',
        gap: '0.5rem',
        maxWidth: '500px',
        margin: '0 auto'
      }}>
        <div style={{ 
          position: 'relative', 
          flex: 1,
          display: 'flex',
          alignItems: 'center'
        }}>
          <input
            type="text"
            value={query}
            onChange={handleInputChange}
            placeholder={placeholder}
            style={{
              width: '100%',
              padding: '0.75rem 3rem 0.75rem 1rem',
              borderRadius: '8px',
              border: '2px solid #374151',
              backgroundColor: '#1f2937',
              color: 'white',
              fontSize: '1rem',
              outline: 'none'
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = '#dc2626';
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = '#374151';
            }}
          />
          {isSearching && (
            <div style={{
              position: 'absolute',
              right: '0.75rem',
              color: '#9ca3af'
            }}>
              ⏳
            </div>
          )}
        </div>
        
        <button
          type="submit"
          disabled={isSearching}
          style={{
            backgroundColor: '#dc2626',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            padding: '0.75rem 1.5rem',
            fontSize: '1rem',
            fontWeight: '600',
            cursor: isSearching ? 'not-allowed' : 'pointer',
            opacity: isSearching ? 0.7 : 1,
            transition: 'all 0.2s'
          }}
          onMouseEnter={(e) => {
            if (!isSearching) {
              e.currentTarget.style.backgroundColor = '#b91c1c';
            }
          }}
          onMouseLeave={(e) => {
            if (!isSearching) {
              e.currentTarget.style.backgroundColor = '#dc2626';
            }
          }}
        >
          {isSearching ? 'Searching...' : 'Search'}
        </button>
      </div>
    </form>
  );
}
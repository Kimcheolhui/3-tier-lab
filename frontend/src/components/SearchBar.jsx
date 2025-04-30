import React from 'react';

function SearchBar({ searchTerm, setSearchTerm }) {
  return (
    <input
      type="text"
      placeholder="제목 검색"
      value={searchTerm}
      onChange={e => setSearchTerm(e.target.value)}
      style={{ padding: '0.5rem', width: '200px' }}
    />
  );
}

export default SearchBar
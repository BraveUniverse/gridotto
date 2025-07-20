'use client';

import { FunnelIcon } from '@heroicons/react/24/outline';

interface FilterState {
  status: 'all' | 'active' | 'completed';
  type: 'all' | 'lyx' | 'token' | 'nft';
  sortBy: 'endTime' | 'prizePool' | 'participants';
  sortOrder: 'asc' | 'desc';
}

interface DrawFiltersProps {
  filters: FilterState;
  onFilterChange: (filters: FilterState) => void;
}

export function DrawFilters({ filters, onFilterChange }: DrawFiltersProps) {
  const handleFilterChange = (key: keyof FilterState, value: any) => {
    onFilterChange({
      ...filters,
      [key]: value
    });
  };

  return (
    <div className="flex flex-wrap gap-4 mb-6">
      {/* Status Filter */}
      <div className="flex items-center gap-2">
        <span className="text-gray-400 text-sm">Status:</span>
        <select
          value={filters.status}
          onChange={(e) => handleFilterChange('status', e.target.value)}
          className="bg-white/10 border border-white/20 rounded-lg px-3 py-1 text-white text-sm focus:outline-none focus:border-pink-500"
        >
          <option value="all">All</option>
          <option value="active">Active</option>
          <option value="completed">Completed</option>
        </select>
      </div>

      {/* Type Filter */}
      <div className="flex items-center gap-2">
        <span className="text-gray-400 text-sm">Type:</span>
        <select
          value={filters.type}
          onChange={(e) => handleFilterChange('type', e.target.value)}
          className="bg-white/10 border border-white/20 rounded-lg px-3 py-1 text-white text-sm focus:outline-none focus:border-pink-500"
        >
          <option value="all">All</option>
          <option value="lyx">LYX</option>
          <option value="token">Token (LSP7)</option>
          <option value="nft">NFT (LSP8)</option>
        </select>
      </div>

      {/* Sort By */}
      <div className="flex items-center gap-2">
        <span className="text-gray-400 text-sm">Sort by:</span>
        <select
          value={filters.sortBy}
          onChange={(e) => handleFilterChange('sortBy', e.target.value)}
          className="bg-white/10 border border-white/20 rounded-lg px-3 py-1 text-white text-sm focus:outline-none focus:border-pink-500"
        >
          <option value="endTime">End Time</option>
          <option value="prizePool">Prize Pool</option>
          <option value="participants">Participants</option>
        </select>
      </div>

      {/* Sort Order */}
      <button
        onClick={() => handleFilterChange('sortOrder', filters.sortOrder === 'asc' ? 'desc' : 'asc')}
        className="bg-white/10 border border-white/20 rounded-lg px-3 py-1 text-white text-sm hover:bg-white/20 transition-all"
      >
        {filters.sortOrder === 'asc' ? '↑ Ascending' : '↓ Descending'}
      </button>
    </div>
  );
}
'use client';

import { useState } from 'react';

interface FilterProps {
  filters: {
    type: string;
    status: string;
    prizeRange: number[];
    drawType: string;
  };
  onFiltersChange: (filters: any) => void;
}

export const DrawFilters = ({ filters, onFiltersChange }: FilterProps) => {
  const [priceRange, setPriceRange] = useState(filters.prizeRange);

  const handleDrawTypeChange = (drawType: string) => {
    onFiltersChange({ ...filters, drawType });
  };

  const handleStatusChange = (status: string) => {
    onFiltersChange({ ...filters, status });
  };

  const handlePriceRangeChange = (index: number, value: string) => {
    const newRange = [...priceRange];
    newRange[index] = parseInt(value) || 0;
    setPriceRange(newRange);
    onFiltersChange({ ...filters, prizeRange: newRange });
  };

  return (
    <div className="space-y-6">
      {/* Draw Type */}
      <div>
        <h3 className="text-white font-semibold mb-3">Draw Type</h3>
        <div className="space-y-2">
          {[
            { value: 'all', label: 'All Types' },
            { value: 'LYX', label: 'LYX Draws' },
            { value: 'TOKEN', label: 'Token Draws' },
            { value: 'NFT', label: 'NFT Draws' }
          ].map((option) => (
            <label key={option.value} className="flex items-center space-x-3 cursor-pointer">
              <input
                type="radio"
                name="drawType"
                value={option.value}
                checked={filters.drawType === option.value}
                onChange={(e) => handleDrawTypeChange(e.target.value)}
                className="w-4 h-4 text-[#FF2975] bg-white/10 border-white/20 focus:ring-[#FF2975] focus:ring-2"
              />
              <span className="text-gray-300">{option.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Status */}
      <div>
        <h3 className="text-white font-semibold mb-3">Status</h3>
        <div className="space-y-2">
          {[
            { value: 'all', label: 'All' },
            { value: 'active', label: 'Active' },
            { value: 'completed', label: 'Completed' }
          ].map((option) => (
            <label key={option.value} className="flex items-center space-x-3 cursor-pointer">
              <input
                type="radio"
                name="status"
                value={option.value}
                checked={filters.status === option.value}
                onChange={(e) => handleStatusChange(e.target.value)}
                className="w-4 h-4 text-[#FF2975] bg-white/10 border-white/20 focus:ring-[#FF2975] focus:ring-2"
              />
              <span className="text-gray-300">{option.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Prize Range */}
      <div>
        <h3 className="text-white font-semibold mb-3">Prize Range (LYX)</h3>
        <div className="space-y-3">
          <div className="flex items-center space-x-3">
            <input
              type="number"
              value={priceRange[0]}
              onChange={(e) => handlePriceRangeChange(0, e.target.value)}
              className="flex-1 px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-[#FF2975]"
              placeholder="Min"
            />
            <span className="text-gray-400">to</span>
            <input
              type="number"
              value={priceRange[1]}
              onChange={(e) => handlePriceRangeChange(1, e.target.value)}
              className="flex-1 px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-[#FF2975]"
              placeholder="Max"
            />
          </div>
        </div>
      </div>

      {/* Reset Filters */}
      <button
        onClick={() => onFiltersChange({
          type: 'all',
          status: 'active',
          prizeRange: [0, 10000],
          drawType: 'all'
        })}
        className="w-full py-2 text-sm text-gray-400 hover:text-white transition-colors"
      >
        Reset Filters
      </button>
    </div>
  );
};
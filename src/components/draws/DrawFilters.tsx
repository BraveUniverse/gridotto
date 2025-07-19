'use client';

import { useState } from 'react';
import { Switch } from '@headlessui/react';

interface FilterProps {
  filters: {
    type: string;
    status: string;
    prizeRange: number[];
    vipRequired: boolean;
    followRequired: boolean;
  };
  onFiltersChange: (filters: any) => void;
}

export const DrawFilters = ({ filters, onFiltersChange }: FilterProps) => {
  const [priceRange, setPriceRange] = useState(filters.prizeRange);

  const handleTypeChange = (type: string) => {
    onFiltersChange({ ...filters, type });
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
            { value: 'platform', label: 'Official Platform' },
            { value: 'lyx', label: 'LYX Draws' },
            { value: 'token', label: 'Token Draws' },
            { value: 'nft', label: 'NFT Draws' }
          ].map((option) => (
            <label key={option.value} className="flex items-center space-x-3 cursor-pointer">
              <input
                type="radio"
                name="type"
                value={option.value}
                checked={filters.type === option.value}
                onChange={() => handleTypeChange(option.value)}
                className="w-4 h-4 text-[rgb(var(--primary))] bg-white/10 border-white/20 focus:ring-[rgb(var(--primary))]"
              />
              <span className="text-gray-300 text-sm">{option.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Status */}
      <div>
        <h3 className="text-white font-semibold mb-3">Status</h3>
        <div className="space-y-2">
          {[
            { value: 'active', label: 'Active' },
            { value: 'ended', label: 'Ended' },
            { value: 'participated', label: 'My Participated' }
          ].map((option) => (
            <label key={option.value} className="flex items-center space-x-3 cursor-pointer">
              <input
                type="radio"
                name="status"
                value={option.value}
                checked={filters.status === option.value}
                onChange={() => handleStatusChange(option.value)}
                className="w-4 h-4 text-[rgb(var(--primary))] bg-white/10 border-white/20 focus:ring-[rgb(var(--primary))]"
              />
              <span className="text-gray-300 text-sm">{option.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Prize Range */}
      <div>
        <h3 className="text-white font-semibold mb-3">Prize Range (LYX)</h3>
        <div className="space-y-3">
          <div>
            <label className="text-gray-400 text-xs">Min</label>
            <input
              type="number"
              value={priceRange[0]}
              onChange={(e) => handlePriceRangeChange(0, e.target.value)}
              className="input-glass w-full mt-1"
              placeholder="0"
            />
          </div>
          <div>
            <label className="text-gray-400 text-xs">Max</label>
            <input
              type="number"
              value={priceRange[1]}
              onChange={(e) => handlePriceRangeChange(1, e.target.value)}
              className="input-glass w-full mt-1"
              placeholder="10000"
            />
          </div>
        </div>
      </div>

      {/* Requirements */}
      <div>
        <h3 className="text-white font-semibold mb-3">Requirements</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-gray-300 text-sm">No VIP Required</span>
            <Switch
              checked={!filters.vipRequired}
              onChange={(checked) => onFiltersChange({ ...filters, vipRequired: !checked })}
              className={`${
                !filters.vipRequired ? 'bg-[rgb(var(--primary))]' : 'bg-white/20'
              } relative inline-flex h-6 w-11 items-center rounded-full transition-colors`}
            >
              <span className="sr-only">No VIP Required</span>
              <span
                className={`${
                  !filters.vipRequired ? 'translate-x-6' : 'translate-x-1'
                } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
              />
            </Switch>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-300 text-sm">No Following Required</span>
            <Switch
              checked={!filters.followRequired}
              onChange={(checked) => onFiltersChange({ ...filters, followRequired: !checked })}
              className={`${
                !filters.followRequired ? 'bg-[rgb(var(--primary))]' : 'bg-white/20'
              } relative inline-flex h-6 w-11 items-center rounded-full transition-colors`}
            >
              <span className="sr-only">No Following Required</span>
              <span
                className={`${
                  !filters.followRequired ? 'translate-x-6' : 'translate-x-1'
                } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
              />
            </Switch>
          </div>
        </div>
      </div>

      {/* Clear Filters */}
      <button
        onClick={() => onFiltersChange({
          type: 'all',
          status: 'active',
          prizeRange: [0, 10000],
          vipRequired: false,
          followRequired: false
        })}
        className="w-full py-2 text-center text-sm text-gray-400 hover:text-white transition-colors"
      >
        Clear All Filters
      </button>
    </div>
  );
};
import React from 'react';
import { CategoryFilter } from '../types';

interface FilterTabsProps {
  currentFilter: CategoryFilter;
  onFilterChange: (filter: CategoryFilter) => void;
  counts: {
    all: number;
    family: number;
    friends: number;
    mentors: number;
  };
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export const FilterTabs: React.FC<FilterTabsProps> = ({
  currentFilter,
  onFilterChange,
  counts,
  searchQuery,
  onSearchChange
}) => {
  const tabs: { key: CategoryFilter; label: string; count: number }[] = [
    { key: 'all', label: `All Blessings (${counts.all})`, count: counts.all },
    { key: 'family', label: 'Family (Waalid & Walal)', count: counts.family },
    { key: 'friends', label: 'Close Friends (Saaxib)', count: counts.friends },
    { key: 'mentors', label: 'Mentors & Neighbors (Macallin & Jaar)', count: counts.mentors },
  ];

  return (
    <div className="w-full flex flex-col items-center gap-3 pt-2 pb-8">
      {/* Scrollable Filter Pill Bar */}
      <div className="p-1 rounded-full bg-surface-container-high/80 backdrop-blur-md overflow-x-auto max-w-full flex items-center shadow-xs border border-[#EFE8DF]/60">
        {tabs.map((tab) => {
          const isActive = currentFilter === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => onFilterChange(tab.key)}
              type="button"
              className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all duration-200 whitespace-nowrap cursor-pointer ${
                isActive
                  ? 'bg-primary-container text-on-primary shadow-sm'
                  : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container/50'
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Optional Search / Keyword Filter Bar */}
      <div className="relative w-full max-w-md px-4">
        <div className="relative flex items-center">
          <span className="material-symbols-outlined absolute left-7 text-[18px] text-outline pointer-events-none">
            search
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search by name, dua, or message..."
            className="w-full pl-10 pr-8 py-1.5 rounded-full bg-surface-container-low/70 border border-[#EFE8DF] text-xs text-on-surface placeholder:text-outline focus:outline-none focus:bg-white focus:border-secondary/60 transition-all shadow-xs"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              type="button"
              className="absolute right-7 text-outline hover:text-on-surface text-xs"
            >
              <span className="material-symbols-outlined text-[16px]">close</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

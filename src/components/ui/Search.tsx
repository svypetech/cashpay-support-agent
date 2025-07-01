"use client";
import { useState, useEffect } from "react";

interface SearchProps {
  className?: string;
  onSearch: (value: string) => void;
  placeholder?: string;
  value?: string; // Controlled input support
}

export default function Search({
  className = "",
  onSearch,
  placeholder = "Search...",
  value
}: SearchProps) {
  const [searchValue, setSearchValue] = useState(value || "");

  // ✅ Handle input changes - call onSearch immediately
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setSearchValue(newValue);
    onSearch(newValue); // ✅ Call immediately without debouncing
  };

  // ✅ Handle controlled input updates
  useEffect(() => {
    if (value !== undefined && value !== searchValue) {
      setSearchValue(value);
    }
  }, [value, searchValue]);

  // ✅ Clear search function
  const clearSearch = () => {
    setSearchValue("");
    onSearch("");
  };

  return (
    <div className={`relative ${className}`}>
      <input
        type="text"
        placeholder={placeholder}
        value={searchValue}
        onChange={handleInputChange}
        className="w-full pl-4 pr-12 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200 hover:border-gray-400"
      />
      
      {/* Right side icons */}
      <div className="absolute inset-y-0 right-0 flex items-center pr-3">
        {/* Clear button when there's text */}
        {searchValue && (
          <button
            onClick={clearSearch}
            className="mr-2 p-1 hover:bg-gray-100 rounded-full transition-colors"
            title="Clear search"
            type="button"
          >
            <svg 
              className="w-4 h-4 text-gray-400 hover:text-gray-600" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M6 18L18 6M6 6l12 12" 
              />
            </svg>
          </button>
        )}
        
        {/* Search icon */}
        <div className="pointer-events-none">
          <img
            src="/icons/search.svg"
            alt="Search"
            className="min-[400px]:w-[20px] min-[400px]:h-[20px] w-[16px] h-[16px] opacity-50"
            onError={(e) => {
              // Fallback to SVG if image fails
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
              (target.nextElementSibling as HTMLElement)!.style.display = 'block';
            }}
          />
          <svg 
            className="min-[400px]:w-[20px] min-[400px]:h-[20px] w-[16px] h-[16px] text-gray-400 hidden" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
            style={{ display: 'none' }}
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" 
            />
          </svg>
        </div>
      </div>
    </div>
  );
}
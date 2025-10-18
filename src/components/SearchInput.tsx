'use client';

import React, { useState } from 'react';
import { SearchOutlined } from '@ant-design/icons';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { fetchWeatherData, addToSearchHistory } from '../store/slices/weatherSlice';
import type { RootState } from '../store/store';

interface SearchInputProps {
  onSearch?: (city: string) => void;
}

export const SearchInput: React.FC<SearchInputProps> = ({ onSearch }) => {
  const [city, setCity] = useState('');
  const dispatch = useAppDispatch();
  const { loading } = useAppSelector((state: RootState) => state.weather);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (city.trim()) {
      const trimmedCity = city.trim();
      dispatch(addToSearchHistory(trimmedCity));
      await dispatch(fetchWeatherData(trimmedCity));
      onSearch?.(trimmedCity);
      setCity('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-md mx-auto">
      <div className="relative flex items-center">
        <input
          type="text"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          placeholder="Enter city name (e.g., London, Tokyo, New York)"
          disabled={loading}
          className="w-full px-4 py-3 pr-12 text-gray-700 bg-white border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
        />
        <button
          type="submit"
          disabled={loading || !city.trim()}
          className="absolute right-2 p-2 text-gray-500 hover:text-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
        >
          <SearchOutlined className="text-xl" />
        </button>
      </div>
    </form>
  );
};
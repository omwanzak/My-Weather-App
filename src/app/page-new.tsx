'use client';

import React from 'react';
import { useAppSelector } from '../store/hooks';
import { SearchInput, WeatherDisplay, LoadingSpinner, ErrorDisplay } from '../components';
import { CloudOutlined } from '@ant-design/icons';
import type { RootState } from '../store/store';

export default function Home() {
  const { currentWeather, loading, error } = useAppSelector((state: RootState) => state.weather);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-400 via-blue-500 to-blue-600 p-4">
      <div className="container mx-auto max-w-4xl">
        {/* Header */}
        <header className="text-center py-8 mb-8">
          <div className="flex items-center justify-center mb-4">
            <CloudOutlined className="text-white text-4xl mr-3" />
            <h1 className="text-4xl md:text-5xl font-bold text-white">
              Weather App
            </h1>
          </div>
          <p className="text-blue-100 text-lg font-medium">
            Get real-time weather information for any city worldwide
          </p>
        </header>

        {/* Search Section */}
        <div className="mb-8">
          <SearchInput />
        </div>

        {/* Content Section */}
        <main className="flex justify-center">
          {loading && (
            <LoadingSpinner message="Fetching weather data..." />
          )}
          
          {error && !loading && (
            <ErrorDisplay 
              error={error}
              onRetry={() => window.location.reload()}
            />
          )}
          
          {currentWeather && !loading && !error && (
            <WeatherDisplay weatherData={currentWeather} />
          )}
          
          {!currentWeather && !loading && !error && (
            <div className="text-center text-white">
              <div className="bg-white/10 backdrop-blur-md rounded-lg p-8 border border-white/20">
                <CloudOutlined className="text-6xl mb-4 text-white/80" />
                <h2 className="text-2xl font-semibold mb-2">Welcome to Weather App</h2>
                <p className="text-blue-100">
                  Search for any city above to get started!
                </p>
              </div>
            </div>
          )}
        </main>

        {/* Footer */}
        <footer className="text-center mt-12 text-blue-100 text-sm">
          <p>Powered by OpenWeatherMap API</p>
        </footer>
      </div>
    </div>
  );
}
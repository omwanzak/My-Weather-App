'use client';

import React from 'react';
import { useAppSelector } from '../store/hooks';
import { SearchInput, WeatherDisplay, LoadingSpinner, ErrorDisplay } from '../components';
import { CloudOutlined } from '@ant-design/icons';
import type { RootState } from '../store/store';

export default function Home() {
  const { currentWeather, loading, error } = useAppSelector((state: RootState) => state.weather);

  // Function to get dynamic background based on weather and temperature
  const getWeatherBackground = () => {
    if (!currentWeather) {
      // Default background when no weather data - Lilac gradient
      return "bg-gradient-to-br from-purple-300 via-purple-400 to-purple-500";
    }

    const { temperature, weather } = currentWeather;
    const weatherMain = weather.main.toLowerCase();
    const weatherDesc = weather.description.toLowerCase();

    // Weather condition based backgrounds (priority over temperature)
    if (weatherMain === 'clear' || weatherDesc.includes('sunny')) {
      return "bg-gradient-to-br from-orange-300 via-yellow-400 to-orange-500";
    }
    
    if (weatherMain === 'rain' || weatherDesc.includes('drizzle')) {
      return "bg-gradient-to-br from-gray-400 via-gray-500 to-gray-600";
    }
    
    if (weatherMain === 'thunderstorm' || weatherDesc.includes('storm')) {
      return "bg-gradient-to-br from-gray-700 via-purple-800 to-gray-900";
    }
    
    if (weatherMain === 'snow' || weatherDesc.includes('blizzard')) {
      return "bg-gradient-to-br from-blue-200 via-blue-300 to-blue-400";
    }
    
    if (weatherMain === 'mist' || weatherMain === 'fog' || weatherMain === 'haze' || weatherDesc.includes('fog')) {
      return "bg-gradient-to-br from-gray-300 via-gray-400 to-gray-500";
    }
    
    if (weatherMain === 'clouds' || weatherDesc.includes('cloud')) {
      return "bg-gradient-to-br from-gray-300 via-blue-400 to-gray-500";
    }

    // Temperature based backgrounds (fallback)
    if (temperature <= 0) {
      return "bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800"; // Freezing
    } else if (temperature <= 10) {
      return "bg-gradient-to-br from-blue-400 via-blue-500 to-blue-600"; // Very Cold
    } else if (temperature <= 20) {
      return "bg-gradient-to-br from-blue-300 via-blue-400 to-blue-500"; // Cold
    } else if (temperature <= 25) {
      return "bg-gradient-to-br from-green-400 via-green-500 to-blue-500"; // Mild
    } else if (temperature <= 30) {
      return "bg-gradient-to-br from-yellow-400 via-orange-400 to-yellow-500"; // Warm
    } else if (temperature <= 35) {
      return "bg-gradient-to-br from-orange-400 via-red-400 to-orange-500"; // Hot
    } else {
      return "bg-gradient-to-br from-red-500 via-red-600 to-red-700"; // Very Hot
    }
  };

  // Function to get appropriate text colors based on background
  const getTextColors = () => {
    if (!currentWeather) {
      return {
        primary: "text-white",
        secondary: "text-blue-100",
        accent: "text-white/80"
      };
    }

    const { temperature, weather } = currentWeather;
    const weatherMain = weather.main.toLowerCase();
    const weatherDesc = weather.description.toLowerCase();

    // Light backgrounds need dark text
    if (weatherMain === 'clear' || weatherDesc.includes('sunny') || 
        weatherMain === 'snow' || weatherDesc.includes('fog') || 
        weatherDesc.includes('mist') || temperature > 25) {
      return {
        primary: "text-gray-800",
        secondary: "text-gray-700",
        accent: "text-gray-600"
      };
    }

    // Dark backgrounds need light text
    return {
      primary: "text-white",
      secondary: "text-gray-100",
      accent: "text-white/80"
    };
  };

  const textColors = getTextColors();

  return (
    <div className={`min-h-screen ${getWeatherBackground()} p-4 transition-all duration-1000 ease-in-out`}>
      <div className="container mx-auto max-w-4xl">
        {/* Header */}
        <header className="text-center py-8 mb-8">
          <div className="flex items-center justify-center mb-4">
            <CloudOutlined className={`${textColors.primary} text-4xl mr-3`} />
            <h1 className={`text-4xl md:text-5xl font-bold ${textColors.primary}`}>
              Weather App
            </h1>
          </div>
          <p className={`${textColors.secondary} text-lg font-medium`}>
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
            <div className={`text-center ${textColors.primary}`}>
              <div className="bg-white/10 backdrop-blur-md rounded-lg p-8 border border-white/20">
                <CloudOutlined className={`text-6xl mb-4 ${textColors.accent}`} />
                <h2 className={`text-2xl font-semibold mb-2 ${textColors.primary}`}>Welcome to Weather App</h2>
                <p className={textColors.secondary}>
                  Search for any city above to get started!
                </p>
              </div>
            </div>
          )}
        </main>

        {/* Footer */}
        <footer className={`text-center mt-12 ${textColors.secondary} text-sm`}>
          <p>Powered by OpenWeatherMap API</p>
        </footer>
      </div>
    </div>
  );
}
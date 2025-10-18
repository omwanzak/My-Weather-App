'use client';

import React from 'react';
import { 
  CloudOutlined, 
  EnvironmentOutlined, 
  ClockCircleOutlined,
  DashboardOutlined 
} from '@ant-design/icons';
import type { WeatherData } from '../store/slices/weatherSlice';

interface WeatherDisplayProps {
  weatherData: WeatherData;
}

export const WeatherDisplay: React.FC<WeatherDisplayProps> = ({ weatherData }) => {
  const formatLocalTime = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZoneName: 'short'
    });
  };

  const getTemperatureColor = (temp: number) => {
    if (temp <= 0) return 'text-blue-600';
    if (temp <= 15) return 'text-blue-400';
    if (temp <= 25) return 'text-green-500';
    if (temp <= 35) return 'text-yellow-500';
    return 'text-red-500';
  };

  return (
    <div className="w-full max-w-md mx-auto bg-white rounded-xl shadow-lg p-6 border border-gray-200">
      {/* Header with city name */}
      <div className="text-center mb-6">
        <div className="flex items-center justify-center mb-2">
          <EnvironmentOutlined className="text-red-500 mr-2" />
          <h2 className="text-2xl font-bold text-gray-800">
            {weatherData.city}, {weatherData.country}
          </h2>
        </div>
        <p className="text-gray-600 capitalize text-sm font-medium">
          {weatherData.description}
        </p>
      </div>

      {/* Temperature */}
      <div className="text-center mb-6">
        <div className={`text-5xl font-bold mb-2 ${getTemperatureColor(weatherData.temperature)}`}>
          {weatherData.temperature}°C
        </div>
        <div className="text-gray-500 text-sm">
          Feels like {weatherData.temperature}°C
        </div>
      </div>

      {/* Weather details grid */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        {/* Humidity */}
        <div className="bg-blue-50 rounded-lg p-4 text-center border border-blue-100">
          <DashboardOutlined className="text-blue-500 text-xl mb-2" />
          <div className="text-2xl font-bold text-blue-600 mb-1">
            {weatherData.humidity}%
          </div>
          <div className="text-xs text-gray-600 font-medium">Humidity</div>
        </div>

        {/* Cloud Cover */}
        <div className="bg-gray-50 rounded-lg p-4 text-center border border-gray-100">
          <CloudOutlined className="text-gray-500 text-xl mb-2" />
          <div className="text-2xl font-bold text-gray-600 mb-1">
            {weatherData.cloudCover}%
          </div>
          <div className="text-xs text-gray-600 font-medium">Cloud Cover</div>
        </div>
      </div>

      {/* Local time */}
      <div className="bg-indigo-50 rounded-lg p-4 border border-indigo-100">
        <div className="flex items-center justify-center mb-2">
          <ClockCircleOutlined className="text-indigo-500 mr-2" />
          <span className="text-sm font-medium text-gray-700">Local Time</span>
        </div>
        <div className="text-center text-sm text-gray-600 leading-relaxed">
          {formatLocalTime(weatherData.localTime)}
        </div>
      </div>

      {/* Coordinates */}
      <div className="mt-4 text-center text-xs text-gray-500">
        Coordinates: {weatherData.coordinates.lat.toFixed(4)}, {weatherData.coordinates.lon.toFixed(4)}
      </div>
    </div>
  );
};
'use client';

import React from 'react';
import { 
  CloudOutlined, 
  EnvironmentOutlined, 
  ClockCircleOutlined,
  DashboardOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
  EyeOutlined,
  CompassOutlined,
  RiseOutlined,
  FallOutlined,
  ThunderboltOutlined
} from '@ant-design/icons';
import type { WeatherData } from '../store/slices/weatherSlice';

interface WeatherDisplayProps {
  weatherData: WeatherData;
}

export const WeatherDisplay: React.FC<WeatherDisplayProps> = ({ weatherData }) => {
  const formatTime = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatLocalTime = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getTemperatureColor = (temp: number) => {
    if (temp <= 0) return 'text-blue-600';
    if (temp <= 15) return 'text-blue-400';
    if (temp <= 25) return 'text-green-500';
    if (temp <= 35) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getWindDirection = (degrees: number) => {
    const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
    const index = Math.round(degrees / 45) % 8;
    return directions[index];
  };

  const getWeatherIcon = () => {
    const iconCode = weatherData.weather.icon;
    return `https://openweathermap.org/img/wn/${iconCode}@4x.png`;
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Main Weather Card */}
      <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-2xl p-6 border border-white/20 mb-4">
        {/* Header with city name and weather icon */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <div className="flex items-center mb-2">
              <EnvironmentOutlined className="text-red-500 mr-2 text-xl" />
              <h2 className="text-3xl font-bold text-gray-800">
                {weatherData.city}, {weatherData.country}
              </h2>
            </div>
            <p className="text-gray-600 capitalize text-lg font-medium">
              {weatherData.weather.description}
            </p>
            <p className="text-gray-400 text-sm">
              {formatLocalTime(weatherData.localTime)}
            </p>
          </div>
          <img 
            src={getWeatherIcon()} 
            alt={weatherData.weather.description}
            className="w-32 h-32 md:w-40 md:h-40 drop-shadow-lg"
          />
        </div>

        {/* Temperature Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="text-center md:text-left">
            <div className={`text-6xl font-bold mb-2 ${getTemperatureColor(weatherData.temperature)}`}>
              {weatherData.temperature}{weatherData.units.temperature}
            </div>
            <div className="text-gray-500 text-base">
              Feels like {weatherData.feelsLike}{weatherData.units.temperature}
            </div>
          </div>
          
          <div className="flex items-center justify-center space-x-4">
            <div className="text-center">
              <ArrowUpOutlined className="text-red-500 text-lg" />
              <div className="font-semibold text-gray-700">{weatherData.tempMax}{weatherData.units.temperature}</div>
              <div className="text-xs text-gray-500">High</div>
            </div>
            <div className="text-center">
              <ArrowDownOutlined className="text-blue-500 text-lg" />
              <div className="font-semibold text-gray-700">{weatherData.tempMin}{weatherData.units.temperature}</div>
              <div className="text-xs text-gray-500">Low</div>
            </div>
          </div>

          <div className="flex items-center justify-center">
            <div className="bg-indigo-50 rounded-lg p-4 border border-indigo-100 w-full">
              <ClockCircleOutlined className="text-indigo-500 text-xl mb-2" />
              <div className="text-sm text-gray-600">
                <div className="flex items-center justify-between mb-1">
                  <span className="flex items-center"><RiseOutlined className="mr-1" /> Sunrise</span>
                  <span className="font-semibold">{formatTime(weatherData.sun.sunrise)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center"><FallOutlined className="mr-1" /> Sunset</span>
                  <span className="font-semibold">{formatTime(weatherData.sun.sunset)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Detailed Weather Info Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {/* Humidity */}
          <div className="bg-blue-50 rounded-lg p-4 text-center border border-blue-100">
            <DashboardOutlined className="text-blue-500 text-2xl mb-2" />
            <div className="text-2xl font-bold text-blue-600 mb-1">
              {weatherData.humidity}%
            </div>
            <div className="text-xs text-gray-600 font-medium">Humidity</div>
          </div>

          {/* Cloud Cover */}
          <div className="bg-gray-50 rounded-lg p-4 text-center border border-gray-100">
            <CloudOutlined className="text-gray-500 text-2xl mb-2" />
            <div className="text-2xl font-bold text-gray-600 mb-1">
              {weatherData.cloudCover}%
            </div>
            <div className="text-xs text-gray-600 font-medium">Cloud Cover</div>
          </div>

          {/* Wind Speed */}
          <div className="bg-green-50 rounded-lg p-4 text-center border border-green-100">
            <CompassOutlined 
              className="text-green-500 text-2xl mb-2" 
              style={{ transform: `rotate(${weatherData.wind.direction}deg)` }}
            />
            <div className="text-2xl font-bold text-green-600 mb-1">
              {weatherData.wind.speed}
            </div>
            <div className="text-xs text-gray-600 font-medium">
              {weatherData.units.windSpeed} {getWindDirection(weatherData.wind.direction)}
            </div>
            {weatherData.wind.gust && (
              <div className="text-xs text-gray-500 mt-1">
                Gusts: {weatherData.wind.gust} {weatherData.units.windSpeed}
              </div>
            )}
          </div>

          {/* Visibility */}
          <div className="bg-purple-50 rounded-lg p-4 text-center border border-purple-100">
            <EyeOutlined className="text-purple-500 text-2xl mb-2" />
            <div className="text-2xl font-bold text-purple-600 mb-1">
              {weatherData.visibility !== null ? weatherData.visibility : 'N/A'}
            </div>
            <div className="text-xs text-gray-600 font-medium">
              {weatherData.visibility !== null ? weatherData.units.visibility : 'Visibility'}
            </div>
          </div>

          {/* Pressure */}
          <div className="bg-orange-50 rounded-lg p-4 text-center border border-orange-100">
            <DashboardOutlined className="text-orange-500 text-2xl mb-2" />
            <div className="text-2xl font-bold text-orange-600 mb-1">
              {weatherData.pressure}
            </div>
            <div className="text-xs text-gray-600 font-medium">{weatherData.units.pressure}</div>
            {weatherData.seaLevel && (
              <div className="text-xs text-gray-500 mt-1">Sea: {weatherData.seaLevel}</div>
            )}
          </div>

          {/* Precipitation - Rain */}
          {weatherData.precipitation.rain && (
            <div className="bg-blue-50 rounded-lg p-4 text-center border border-blue-100">
              <ThunderboltOutlined className="text-blue-500 text-2xl mb-2" />
              <div className="text-2xl font-bold text-blue-600 mb-1">
                {weatherData.precipitation.rain['1h']}
              </div>
              <div className="text-xs text-gray-600 font-medium">
                Rain ({weatherData.units.precipitation}/h)
              </div>
            </div>
          )}

          {/* Precipitation - Snow */}
          {weatherData.precipitation.snow && (
            <div className="bg-cyan-50 rounded-lg p-4 text-center border border-cyan-100">
              <CloudOutlined className="text-cyan-500 text-2xl mb-2" />
              <div className="text-2xl font-bold text-cyan-600 mb-1">
                {weatherData.precipitation.snow['1h']}
              </div>
              <div className="text-xs text-gray-600 font-medium">
                Snow ({weatherData.units.precipitation}/h)
              </div>
            </div>
          )}
        </div>

        {/* Footer Info */}
        <div className="mt-6 pt-4 border-t border-gray-200">
          <div className="flex flex-wrap items-center justify-between text-xs text-gray-500 gap-2">
            <span>
              Coordinates: {weatherData.coordinates.lat.toFixed(4)}, {weatherData.coordinates.lon.toFixed(4)}
            </span>
            <span>
              Updated: {new Date(weatherData.dataTimestamp).toLocaleTimeString()}
            </span>
            <span className="bg-green-100 text-green-700 px-2 py-1 rounded">
              API Calls: {weatherData.meta.apiCallsUsed}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
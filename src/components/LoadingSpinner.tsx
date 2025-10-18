'use client';

import React from 'react';
import { LoadingOutlined } from '@ant-design/icons';

interface LoadingSpinnerProps {
  message?: string;
  size?: 'small' | 'medium' | 'large';
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  message = 'Loading weather data...', 
  size = 'medium' 
}) => {
  const sizeClasses = {
    small: 'text-lg',
    medium: 'text-2xl',
    large: 'text-4xl'
  };

  return (
    <div className="flex flex-col items-center justify-center py-8">
      <LoadingOutlined 
        className={`text-blue-500 animate-spin mb-3 ${sizeClasses[size]}`}
      />
      <p className="text-gray-600 text-sm font-medium">{message}</p>
    </div>
  );
};
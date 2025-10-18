'use client';

import React from 'react';
import { ExclamationCircleOutlined, ReloadOutlined } from '@ant-design/icons';

interface ErrorDisplayProps {
  error: string;
  onRetry?: () => void;
}

export const ErrorDisplay: React.FC<ErrorDisplayProps> = ({ error, onRetry }) => {
  return (
    <div className="w-full max-w-md mx-auto bg-red-50 border border-red-200 rounded-lg p-6">
      <div className="text-center">
        <ExclamationCircleOutlined className="text-red-500 text-3xl mb-3" />
        <h3 className="text-lg font-semibold text-red-800 mb-2">
          Oops! Something went wrong
        </h3>
        <p className="text-red-600 text-sm mb-4">
          {error}
        </p>
        {onRetry && (
          <button
            onClick={onRetry}
            className="inline-flex items-center px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors duration-200"
          >
            <ReloadOutlined className="mr-2" />
            Try Again
          </button>
        )}
      </div>
    </div>
  );
};
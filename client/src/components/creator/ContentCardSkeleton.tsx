import React from 'react';

const ContentCardSkeleton: React.FC = () => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden border border-gray-200 dark:border-gray-700">
      <div className="p-5">
        <div className="flex justify-between items-start mb-3">
          <div className="h-6 w-2/3 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
          <div className="h-5 w-5 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
        </div>

        <div className="space-y-2 mb-4">
          <div className="h-4 w-full bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
          <div className="h-4 w-3/4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
        </div>

        <div className="space-y-2 mb-4">
          <div className="flex items-center">
            <div className="h-4 w-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mr-2" />
            <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
          </div>
          <div className="flex items-center">
            <div className="h-4 w-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mr-2" />
            <div className="h-4 w-20 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
          </div>
        </div>

        <div className="flex gap-2">
          <div className="h-6 w-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
          <div className="h-6 w-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
        </div>
      </div>
    </div>
  );
};

export default ContentCardSkeleton;
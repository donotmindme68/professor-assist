import React from 'react';
import { motion } from 'framer-motion';
import { Search, BookOpen } from 'lucide-react';

interface EmptyStateProps {
  message: string;
  type: 'search' | 'content';
}

const EmptyState: React.FC<EmptyStateProps> = ({ message, type }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center p-8 text-center"
    >
      <div className="w-16 h-16 mb-4 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center text-primary-600 dark:text-primary-300">
        {type === 'search' ? (
          <Search size={28} />
        ) : (
          <BookOpen size={28} />
        )}
      </div>
      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
        {type === 'search' ? 'No results found' : 'No content available'}
      </h3>
      <p className="text-gray-500 dark:text-gray-400 max-w-md">
        {message}
      </p>
    </motion.div>
  );
};

export default EmptyState;
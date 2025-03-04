import React from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface ErrorStateProps {
  message: string;
  onRetry?: () => void;
}

const ErrorState: React.FC<ErrorStateProps> = ({ message, onRetry }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center p-8 text-center"
    >
      <div className="w-16 h-16 mb-4 rounded-full bg-red-100 dark:bg-red-900 flex items-center justify-center text-red-600 dark:text-red-300">
        <AlertTriangle size={28} />
      </div>
      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
        Something went wrong
      </h3>
      <p className="text-gray-500 dark:text-gray-400 max-w-md mb-6">
        {message}
      </p>
      {onRetry && (
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={onRetry}
          className="flex items-center px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg text-sm font-medium transition-colors"
        >
          <RefreshCw size={16} className="mr-2" />
          Try Again
        </motion.button>
      )}
    </motion.div>
  );
};

export default ErrorState;
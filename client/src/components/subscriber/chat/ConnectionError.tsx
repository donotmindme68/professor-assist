import React from 'react';
import { motion } from 'framer-motion';

interface ConnectionErrorProps {
  message: string;
  onRetry?: () => void;
}

const ConnectionError: React.FC<ConnectionErrorProps> = ({ message, onRetry }) => {
  return (
    <div className="bg-red-50 dark:bg-red-900/20 p-4 mb-4 rounded-lg border border-red-200 dark:border-red-800">
      <p className="text-red-700 dark:text-red-300 mb-2">{message}</p>
      {onRetry && (
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={onRetry}
          className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-sm"
        >
          Retry Connection
        </motion.button>
      )}
    </div>
  );
};

export default ConnectionError;
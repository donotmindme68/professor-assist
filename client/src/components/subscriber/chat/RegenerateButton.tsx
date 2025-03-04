import React from 'react';
import { motion } from 'framer-motion';

interface RegenerateButtonProps {
  onClick: () => void;
}

const RegenerateButton: React.FC<RegenerateButtonProps> = ({ onClick }) => {
  return (
    <div className="mt-2 flex justify-end">
      <motion.button
        whileTap={{ scale: 0.95 }}
        onClick={onClick}
        className="px-3 py-1 text-sm bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded"
      >
        Regenerate Response
      </motion.button>
    </div>
  );
};

export default RegenerateButton;
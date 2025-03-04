import React from 'react';
import { motion } from 'framer-motion';
import { Filter } from 'lucide-react';

interface FilterOptionsProps {
  showPublicOnly: boolean;
  setShowPublicOnly: (value: boolean) => void;
}

const FilterOptions: React.FC<FilterOptionsProps> = ({
  showPublicOnly,
  setShowPublicOnly,
}) => {
  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
      <div className="flex items-center mb-3">
        <Filter size={18} className="mr-2 text-primary-600 dark:text-primary-400" />
        <h3 className="font-medium text-gray-900 dark:text-white">Filters</h3>
      </div>
      
      <div className="space-y-3">
        <div className="flex items-center">
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowPublicOnly(!showPublicOnly)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 ${
              showPublicOnly ? 'bg-primary-600' : 'bg-gray-200 dark:bg-gray-700'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                showPublicOnly ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </motion.button>
          <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
            Public Only
          </span>
        </div>
      </div>
    </div>
  );
};

export default FilterOptions;
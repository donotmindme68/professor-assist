import React, { useState } from 'react';
import { motion } from 'framer-motion';

interface NewThreadFormProps {
  onSubmit: (name: string) => void;
  onCancel: () => void;
}

const NewThreadForm: React.FC<NewThreadFormProps> = ({ onSubmit, onCancel }) => {
  const [name, setName] = useState('');
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onSubmit(name.trim());
      setName('');
    }
  };
  
  return (
    <motion.form
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      onSubmit={handleSubmit}
      className="p-3 bg-white dark:bg-gray-800 rounded-lg shadow-md mb-4 border border-gray-200 dark:border-gray-700"
    >
      <h4 className="font-medium text-gray-800 dark:text-gray-200 mb-2">New Thread</h4>
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Thread name..."
        className="w-full p-2 mb-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-primary-500 dark:text-white"
        autoFocus
      />
      <div className="flex justify-end space-x-2">
        <motion.button
          whileTap={{ scale: 0.95 }}
          type="button"
          onClick={onCancel}
          className="px-3 py-1 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
        >
          Cancel
        </motion.button>
        <motion.button
          whileTap={{ scale: 0.95 }}
          type="submit"
          className="px-3 py-1 text-sm bg-primary-600 hover:bg-primary-700 text-white rounded"
        >
          Create
        </motion.button>
      </div>
    </motion.form>
  );
};

export default NewThreadForm;
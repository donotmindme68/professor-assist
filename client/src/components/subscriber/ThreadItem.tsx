import React from 'react';
import { motion } from 'framer-motion';
import { Clock } from 'lucide-react';
import { Thread } from '../../types';

interface ThreadItemProps {
  thread: Thread;
  isActive: boolean;
  onClick: () => void;
}

const ThreadItem: React.FC<ThreadItemProps> = ({ thread, isActive, onClick }) => {
  // Get the last message timestamp for display
  const lastMessageTime = thread.messages.length > 0 
    ? new Date(thread.messages[thread.messages.length - 1].createdAt || Date.now())
    : new Date();
  
  // Format the time
  const formattedTime = lastMessageTime.toLocaleString('en-US', {
    hour: 'numeric',
    minute: 'numeric',
    hour12: true,
    month: 'short',
    day: 'numeric'
  });

  return (
    <motion.div
      whileHover={{ x: 4 }}
      onClick={onClick}
      className={`p-3 rounded-lg cursor-pointer mb-1 ${
        isActive 
          ? 'bg-primary-100 dark:bg-primary-900/30 border-l-4 border-primary-600 dark:border-primary-400' 
          : 'hover:bg-gray-100 dark:hover:bg-gray-800'
      }`}
      layout
    >
      <div className="flex justify-between items-start">
        <h4 className={`font-medium truncate max-w-[180px] ${isActive ? 'text-primary-700 dark:text-primary-300' : 'text-gray-800 dark:text-gray-200'}`}>
          {thread.name}
        </h4>
        <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center flex-shrink-0 ml-1">
          <Clock size={12} className="mr-1" />
          {formattedTime}
        </span>
      </div>
      
      {thread.messages.length > 0 && (
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-1 overflow-hidden text-ellipsis">
          {thread.messages[thread.messages.length - 1].content}
        </p>
      )}
    </motion.div>
  );
};

export default ThreadItem;
import React from 'react';
import { motion } from 'framer-motion';
import { User, Plus } from 'lucide-react';
import { ContentPreview } from '../../types';

interface ContentPreviewCardProps {
  content: ContentPreview;
  onSubscribe: (contentId: number) => void;
  isSubscribing: boolean;
}

const ContentPreviewCard: React.FC<ContentPreviewCardProps> = ({ 
  content, 
  onSubscribe,
  isSubscribing
}) => {
  return (
    <motion.div
      whileHover={{ y: -5 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden border border-gray-200 dark:border-gray-700 h-full flex flex-col"
    >
      <div className="p-5 flex-grow">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 truncate">
          {content.name}
        </h3>
        
        <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-4">
          <User size={14} className="mr-1" />
          <span>Creator ID: {content.creatorId}</span>
        </div>
        
        {content.description && (
          <p className="text-sm text-gray-600 dark:text-gray-300 mb-4 line-clamp-3">
            {content.description}
          </p>
        )}
      </div>
      
      <div className="px-5 py-3 bg-gray-50 dark:bg-gray-700 border-t border-gray-200 dark:border-gray-600">
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => onSubscribe(content.id)}
          disabled={isSubscribing}
          className="w-full py-2 px-3 bg-primary-600 hover:bg-primary-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center justify-center"
        >
          {isSubscribing ? (
            <span className="flex items-center">
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Subscribing...
            </span>
          ) : (
            <span className="flex items-center">
              <Plus size={16} className="mr-1" />
              Subscribe
            </span>
          )}
        </motion.button>
      </div>
    </motion.div>
  );
};

export default ContentPreviewCard;
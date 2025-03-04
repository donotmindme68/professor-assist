import React from 'react';
import { motion } from 'framer-motion';
import { Calendar, Lock, Unlock, CheckCircle, XCircle } from 'lucide-react';
import { SubscriberContent } from '../../types';

interface ContentCardProps {
  content: SubscriberContent;
  isSubscribed?: boolean;
  onSubscribe?: (contentId: number) => void;
  onClick?: (content: SubscriberContent) => void;
}

const ContentCard: React.FC<ContentCardProps> = ({ 
  content, 
  isSubscribed = false,
  onSubscribe,
  onClick
}) => {
  const handleClick = () => {
    if (isSubscribed && onClick) {
      onClick(content);
    }
  };

  return (
    <motion.div
      whileHover={{ y: -5 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden border border-gray-200 dark:border-gray-700 h-full flex flex-col ${isSubscribed ? 'cursor-pointer' : ''}`}
      onClick={handleClick}
    >
      <div className="p-5 flex-grow">
        <div className="flex justify-between items-start mb-3">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
            {content.name}
          </h3>
          <div className="text-primary-600 dark:text-primary-400">
            {content.isPublic ? (
              <Unlock size={18} />
            ) : (
              <Lock size={18} />
            )}
          </div>
        </div>
        
        {content.description && (
          <p className="text-sm text-gray-600 dark:text-gray-300 mb-4 line-clamp-3">
            {content.description}
          </p>
        )}
      </div>
      
      <div className="px-5 py-3 bg-gray-50 dark:bg-gray-700 border-t border-gray-200 dark:border-gray-600">
        {isSubscribed ? (
          <div className="flex items-center text-green-600 dark:text-green-400">
            <CheckCircle size={16} className="mr-1" />
            <span className="text-sm font-medium">Subscribed</span>
          </div>
        ) : (
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={(e) => {
              e.stopPropagation();
              onSubscribe && onSubscribe(content.id);
            }}
            className="w-full py-2 px-3 bg-primary-600 hover:bg-primary-700 text-white rounded-lg text-sm font-medium transition-colors"
            disabled={!content.isPublic}
          >
            {content.isPublic ? 'Subscribe' : 'Not Available'}
          </motion.button>
        )}
      </div>
    </motion.div>
  );
};

export default ContentCard;
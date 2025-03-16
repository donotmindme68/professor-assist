import React from 'react';
import { motion } from 'framer-motion';
import { Calendar, Lock, Globe, Users, RefreshCw } from 'lucide-react';
import { format } from 'date-fns';
import { ContentCreatorContent } from 'types';

interface ContentCardProps {
  content: ContentCreatorContent;
  onClick: () => void;
}

const ContentCard: React.FC<ContentCardProps> = ({ content, onClick }) => {
  const getStatusConfig = () => {
    if (content.error) {
      return {
        className: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
        text: 'Failed',
        showSpinner: false,
        tooltip: content.error
      };
    }

    if (content.ready) {
      return {
        className: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
        text: 'Ready',
        showSpinner: false
      };
    }

    return {
      className: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
      text: 'Training',
      showSpinner: true
    };
  };

  const status = getStatusConfig();

  return (
    <motion.div
      layoutId={`content-${content.id}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      onClick={onClick}
      className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden border border-gray-200 dark:border-gray-700 cursor-pointer transition-shadow hover:shadow-xl"
    >
      <div className="p-5">
        <div className="flex justify-between items-start mb-3">
          <motion.h3
            layoutId={`title-${content.id}`}
            className="text-lg font-semibold text-gray-900 dark:text-white truncate"
          >
            {content.name}
          </motion.h3>
          {content.isPublic ? (
            <Globe size={18} className="text-primary-600 dark:text-primary-400" />
          ) : (
            <Lock size={18} className="text-gray-400 dark:text-gray-500" />
          )}
        </div>

        {content.description && (
          <motion.p
            layoutId={`description-${content.id}`}
            className="text-sm text-gray-600 dark:text-gray-300 mb-4 line-clamp-2"
          >
            {content.description}
          </motion.p>
        )}

        <div className="space-y-2">
          <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
            <Calendar size={14} className="mr-2" />
            <span>{format(new Date(content.createdAt), 'PP')}</span>
          </div>
          {/*<div className="flex items-center text-sm text-gray-500 dark:text-gray-400">*/}
          {/*  <Users size={14} className="mr-2" />*/}
          {/*  <span>156 Students</span>*/}
          {/*</div>*/}
        </div>

        <div className="mt-4 flex gap-2">
          <div
            className={`px-2 py-1 text-xs rounded-full flex items-center ${status.className}`}
            title={status.tooltip}
          >
            <span>{status.text}</span>
            {status.showSpinner && (
              <RefreshCw size={12} className="ml-1 animate-spin" />
            )}
          </div>
          {content.sharingId && (
            <span className="px-2 py-1 text-xs rounded-full bg-primary-100 text-primary-800 dark:bg-primary-900/30 dark:text-primary-300">
              Shared
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default ContentCard;
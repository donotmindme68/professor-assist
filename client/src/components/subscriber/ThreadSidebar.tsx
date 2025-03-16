import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, PlusCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import { Thread } from '../../types';
import ThreadItem from './ThreadItem';
import NewThreadForm from './NewThreadForm';
import ErrorState from '../common/ErrorState';
import AssistantAvatar from './AssistantAvatar';

interface ThreadSidebarProps {
  threads: Thread[];
  deleteThread: ( threadId: Thread['id']) => void
  activeThreadId: number | null;
  isLoading: boolean;
  error: string | null;
  sidebarCollapsed: boolean;
  voiceEnabled?: boolean;
  onThreadSelect: (threadId: number) => void;
  onCreateThread: (name: string) => void;
  onRetry: () => void;
  onToggleSidebar: (collapsed: boolean) => void;
  isSpeaking: boolean
}

const ThreadSidebar: React.FC<ThreadSidebarProps> = ({
  threads,
  activeThreadId,
  isLoading,
  error,
  sidebarCollapsed,
  voiceEnabled = false,
  onThreadSelect,
  onCreateThread,
  onRetry,
  onToggleSidebar,
  isSpeaking = false,
  deleteThread,
}) => {
  const [showNewThreadForm, setShowNewThreadForm] = useState(false);
  
  const handleCreateThread = (name: string) => {
    onCreateThread(name);
    setShowNewThreadForm(false);
  };
  
  // Sidebar animation variants
  const sidebarVariants = {
    open: { 
      width: 320, 
      opacity: 1,
      transition: { 
        type: "spring", 
        stiffness: 300, 
        damping: 30,
        duration: 0.3
      }
    },
    closed: { 
      width: 0, 
      opacity: 0,
      transition: { 
        type: "spring", 
        stiffness: 300, 
        damping: 30,
        duration: 0.3
      }
    }
  };
  
  // If voice is enabled, don't allow sidebar to be collapsed
  if (sidebarCollapsed && !voiceEnabled) {
    return (
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => onToggleSidebar(false)}
        className="p-2 m-2 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600"
        title="Expand Sidebar"
      >
        <ChevronRight size={18} />
      </motion.button>
    );
  }
  
  return (
    <AnimatePresence initial={false}>
      <motion.div
        initial="closed"
        animate="open"
        exit="closed"
        variants={sidebarVariants}
        className="border-r border-gray-200 dark:border-gray-700 h-full overflow-hidden"
      >
        <div className="p-4 h-full flex flex-col">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-medium text-gray-900 dark:text-white">Threads</h3>
            <div className="flex space-x-2">
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowNewThreadForm(!showNewThreadForm)}
                className="text-primary-600 dark:text-primary-400 hover:text-primary-800 dark:hover:text-primary-300"
                title="New Thread"
              >
                <PlusCircle size={18} />
              </motion.button>
              {!voiceEnabled && (
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => onToggleSidebar(true)}
                  className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                  title="Collapse Sidebar"
                >
                  <ChevronLeft size={18} />
                </motion.button>
              )}
            </div>
          </div>
          
          {/* Show Assistant Avatar when voice is enabled */}
          {voiceEnabled && (
            <div className="flex justify-center mb-6">
              <AssistantAvatar isAnimating={isSpeaking} />
            </div>
          )}
          
          <AnimatePresence>
            {showNewThreadForm && (
              <NewThreadForm 
                onSubmit={handleCreateThread}
                onCancel={() => setShowNewThreadForm(false)}
              />
            )}
          </AnimatePresence>
          
          {isLoading ? (
            <div className="flex-grow flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            </div>
          ) : error ? (
            <div className="flex-grow">
              <ErrorState 
                message={error}
                onRetry={onRetry}
              />
            </div>
          ) : threads.length > 0 ? (
            <div className="flex-grow overflow-y-auto pr-1 w-full">
              <div className="w-full">
                {threads.map(thread => (
                  <ThreadItem 
                    key={thread.id}
                    thread={thread}
                    isActive={thread.id === activeThreadId}
                    onClick={() => onThreadSelect(thread.id)}
                    onDeleteSuccessful={() => deleteThread(thread.id)}
                  />
                ))}
              </div>
            </div>
          ) : (
            <div className="flex-grow flex flex-col items-center justify-center text-center p-4">
              <MessageSquare size={40} className="text-gray-300 dark:text-gray-600 mb-2" />
              <p className="text-gray-500 dark:text-gray-400">No threads yet</p>
              <p className="text-sm text-gray-400 dark:text-gray-500 mb-4">
                Start a new conversation
              </p>
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowNewThreadForm(true)}
                className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg text-sm"
              >
                Create Thread
              </motion.button>
            </div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ThreadSidebar;
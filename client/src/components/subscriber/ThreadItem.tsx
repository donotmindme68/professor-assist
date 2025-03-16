import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, Trash2, AlertTriangle, X } from 'lucide-react';
import { Thread } from '../../types';
import { ThreadAPI } from '../../api';

interface ThreadItemProps {
  thread: Thread;
  isActive: boolean;
  onClick: () => void;
  onDeleteSuccessful?: () => void;
}

interface DeleteWarningDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  error?: string;
}

const DeleteWarningDialog: React.FC<DeleteWarningDialogProps> = ({
                                                                   isOpen,
                                                                   onClose,
                                                                   onConfirm,
                                                                   error
                                                                 }) => {
  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-sm w-full shadow-xl"
      >
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center">
            <AlertTriangle size={20} className="text-red-500 dark:text-red-400 mr-2" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Delete Thread
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
          >
            <X size={20} />
          </button>
        </div>

        {error ? (
          <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded text-red-600 dark:text-red-400 text-sm">
            {error}
          </div>
        ) : (
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            Are you sure you want to delete this thread? This action cannot be undone.
          </p>
        )}

        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-sm"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm"
          >
            Delete
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

const ThreadItem: React.FC<ThreadItemProps> = ({
                                                 thread,
                                                 isActive,
                                                 onClick,
                                                 onDeleteSuccessful
                                               }) => {
  const [showDeleteWarning, setShowDeleteWarning] = useState(false);
  const [deleteError, setDeleteError] = useState<string | undefined>();
  const [isDeleting, setIsDeleting] = useState(false);

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

  const handleDelete = async () => {
    if (isDeleting) return;

    setIsDeleting(true);
    setDeleteError(undefined);

    try {
      await ThreadAPI.delete(thread.id);
      setShowDeleteWarning(false);
      onDeleteSuccessful?.();
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : 'Failed to delete thread');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
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
        <div className="flex flex-col group">
          <div className="flex justify-between items-start w-full">
            <h4 className={`font-medium truncate flex-grow ${isActive ? 'text-primary-700 dark:text-primary-300' : 'text-gray-800 dark:text-gray-200'}`}>
              {thread.name}
            </h4>

            <div className="flex items-center gap-2 flex-shrink-0 ml-2">
              <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center">
                <Clock size={12} className="mr-1" />
                {formattedTime}
              </span>
              <motion.button
                initial={{ opacity: 0 }}
                whileHover={{ opacity: 1 }}
                onClick={(e) => {
                  e.stopPropagation();
                  setShowDeleteWarning(true);
                }}
                className="p-1 text-gray-400 hover:text-red-500 dark:text-gray-500 dark:hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Trash2 size={14} />
              </motion.button>
            </div>
          </div>

          {thread.messages.length > 0 && (
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-1 overflow-hidden text-ellipsis pr-8">
              {thread.messages[thread.messages.length - 1].content}
            </p>
          )}
        </div>
      </motion.div>

      <AnimatePresence>
        {showDeleteWarning && (
          <DeleteWarningDialog
            isOpen={showDeleteWarning}
            onClose={() => {
              setShowDeleteWarning(false);
              setDeleteError(undefined);
            }}
            onConfirm={handleDelete}
            error={deleteError}
          />
        )}
      </AnimatePresence>
    </>
  );
};

export default ThreadItem;
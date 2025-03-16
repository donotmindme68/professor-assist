import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, Globe, Lock, Calendar, Share2, BookOpen, Users, MessageSquare, BarChart,
  RefreshCw, UserMinus, Search, AlertCircle, Check
} from 'lucide-react';
import { format } from 'date-fns';
import { ContentCreatorContent } from '../../types';
import { ContentCreatorAPI, ContentAPI } from '../../api';

interface ContentDetailsProps {
  content: ContentCreatorContent;
  onClose: () => void;
}

interface Student {
  id: number;
  name?: string;
  email: string;
  joinedAt: string;
  lastActive: string;
}

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel: string;
  onConfirm: () => void;
  onCancel: () => void;
  isDestructive?: boolean;
}

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
                                                       isOpen,
                                                       title,
                                                       message,
                                                       confirmLabel,
                                                       onConfirm,
                                                       onCancel,
                                                       isDestructive = false,
                                                     }) => (
  <AnimatePresence>
    {isOpen && (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
        onClick={onCancel}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-md w-full mx-4 shadow-xl"
          onClick={e => e.stopPropagation()}
        >
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">{title}</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">{message}</p>
          <div className="flex justify-end gap-3">
            <button
              onClick={onCancel}
              className="px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className={`px-4 py-2 rounded-lg text-white ${
                isDestructive
                  ? 'bg-red-600 hover:bg-red-700'
                  : 'bg-primary-600 hover:bg-primary-700'
              }`}
            >
              {confirmLabel}
            </button>
          </div>
        </motion.div>
      </motion.div>
    )}
  </AnimatePresence>
);

const ContentDetails: React.FC<ContentDetailsProps> = ({ content: initialContent, onClose }) => {
  const [content, setContent] = useState(initialContent);
  const [students, setStudents] = useState<Student[]>([]);
  const [studentSearch, setStudentSearch] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Loading states for different actions
  const [isTogglingPublic, setIsTogglingPublic] = useState(false);
  const [isRegeneratingShare, setIsRegeneratingShare] = useState(false);
  const [isRemovingShare, setIsRemovingShare] = useState(false);
  const [isLoadingStudents, setIsLoadingStudents] = useState(true);
  const [removingStudentId, setRemovingStudentId] = useState<number | null>(null);

  // Confirmation dialogs
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showRegenerateConfirm, setShowRegenerateConfirm] = useState(false);
  const [showRemoveShareConfirm, setShowRemoveShareConfirm] = useState(false);
  const [showRemoveStudentConfirm, setShowRemoveStudentConfirm] = useState<number | null>(null);

  useEffect(() => {
    fetchStudents();
  }, [content.id]);

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

  const showSuccess = (message: string) => {
    setSuccessMessage(message);
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  const fetchStudents = async () => {
    try {
      setIsLoadingStudents(true);
      setError(null);
      const data = await ContentCreatorAPI.listSubscribers(content.id);
      setStudents(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load students');
      setStudents([]);
    } finally {
      setIsLoadingStudents(false);
    }
  };

  const handleTogglePublic = async () => {
    try {
      setIsTogglingPublic(true);
      setError(null);
      const updatedContent = await ContentAPI.setPublic(content.id, !content.isPublic)
      setContent(updatedContent);
      showSuccess('Content visibility updated successfully');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update visibility');
    } finally {
      setIsTogglingPublic(false);
    }
  };

  const handleRegenerateShare = async () => {
    try {
      setIsRegeneratingShare(true);
      setError(null);
      const updatedContent = await ContentAPI.rotateLink(content.id);
      setContent(updatedContent);
      setShowRegenerateConfirm(false);
      showSuccess('Share link regenerated successfully');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to regenerate share link');
    } finally {
      setIsRegeneratingShare(false);
    }
  };

  const handleRemoveShare = async () => {
    try {
      setIsRemovingShare(true);
      setError(null);
      const updatedContent = await ContentAPI.removeLink(content.id);
      setContent(updatedContent);
      setShowRemoveShareConfirm(false);
      showSuccess('Share link removed successfully');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to remove share link');
    } finally {
      setIsRemovingShare(false);
    }
  };

  const handleDeleteContent = async () => {
    try {
      setIsLoading(true);
      setError(null);
      await ContentAPI.delete(content.id);
      showSuccess('Content deleted successfully');
      setTimeout(onClose, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete content');
      setIsLoading(false);
    }
  };

  const handleRemoveStudent = async (studentId: number) => {
    try {
      setRemovingStudentId(studentId);
      setError(null);
      await ContentCreatorAPI.removeSubscriber(content.id, studentId);
      setStudents(prev => prev.filter(s => s.id !== studentId));
      setShowRemoveStudentConfirm(null);
      showSuccess('Student removed successfully');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to remove student');
    } finally {
      setRemovingStudentId(null);
    }
  };

  const filteredStudents = students.filter(student =>
    student.name?.toLowerCase()?.includes(studentSearch.toLowerCase()) ||
    student.email.toLowerCase().includes(studentSearch.toLowerCase())
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex justify-between items-start">
            <div>
              <motion.h2
                layoutId={`title-${content.id}`}
                className="text-2xl font-bold bg-clip-text text-gray-900 dark:text-white mb-2"
              >
                {content.name}
              </motion.h2>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="flex items-center gap-4"
              >
                <button
                  onClick={() => handleTogglePublic()}
                  disabled={isTogglingPublic}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-colors ${
                    content.isPublic
                      ? 'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-400'
                      : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400'
                  }`}
                >
                  {isTogglingPublic ? (
                    <RefreshCw size={16} className="animate-spin" />
                  ) : content.isPublic ? (
                    <Globe size={16} />
                  ) : (
                    <Lock size={16} />
                  )}
                  {content.isPublic ? 'Public' : 'Private'}
                </button>
                <div
                  className={`px-2 py-1 text-xs rounded-full flex items-center ${status.className}`}
                  title={status.tooltip}
                >
                  <span>{status.text}</span>
                  {status.showSpinner && (
                    <RefreshCw size={12} className="ml-1 animate-spin" />
                  )}
                </div>
              </motion.div>
            </div>
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <X size={20} className="text-gray-600 dark:text-gray-400" />
            </motion.button>
          </div>
        </div>

        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="m-6 p-4 bg-red-50 dark:bg-red-900/50 border border-red-200 dark:border-red-800 rounded-lg flex items-center gap-3 text-red-700 dark:text-red-300"
            >
              <AlertCircle size={20} />
              <p>{error}</p>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {successMessage && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="m-6 p-4 bg-green-50 dark:bg-green-900/50 border border-green-200 dark:border-green-800 rounded-lg flex items-center gap-3 text-green-700 dark:text-green-300"
            >
              <Check size={20} />
              <p>{successMessage}</p>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="col-span-2 space-y-6"
          >
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-2xl p-6">
              <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Content Overview</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-gray-700/50 dark:to-gray-800/50 rounded-xl">
                  <BookOpen className="text-indigo-600 dark:text-indigo-400 mb-2" size={24} />
                  <h4 className="font-medium text-gray-900 dark:text-white">Lessons</h4>
                  <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">-</p>
                </div>
                <div className="p-4 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-gray-700/50 dark:to-gray-800/50 rounded-xl">
                  <Users className="text-purple-600 dark:text-purple-400 mb-2" size={24} />
                  <h4 className="font-medium text-gray-900 dark:text-white">Students</h4>
                  <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">{students.length}</p>
                </div>
                <div className="p-4 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-gray-700/50 dark:to-gray-800/50 rounded-xl">
                  <MessageSquare className="text-blue-600 dark:text-blue-400 mb-2" size={24} />
                  <h4 className="font-medium text-gray-900 dark:text-white">Discussions</h4>
                  <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">0</p>
                </div>
                <div className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-gray-700/50 dark:to-gray-800/50 rounded-xl">
                  <BarChart className="text-green-600 dark:text-green-400 mb-2" size={24} />
                  <h4 className="font-medium text-gray-900 dark:text-white">Completion Rate</h4>
                  <p className="text-2xl font-bold text-green-600 dark:text-green-400">1%</p>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-2xl p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Enrolled Students</h3>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                  <input
                    type="text"
                    placeholder="Search students..."
                    value={studentSearch}
                    onChange={(e) => setStudentSearch(e.target.value)}
                    className="pl-9 pr-4 py-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:text-white"
                  />
                </div>
              </div>

              {isLoadingStudents ? (
                <div className="space-y-4">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="animate-pulse flex items-center justify-between p-4 rounded-lg bg-white dark:bg-gray-800">
                      <div className="space-y-2">
                        <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-32"></div>
                        <div className="h-3 bg-gray-200 dark:bg-gray-600 rounded w-48"></div>
                      </div>
                      <div className="h-8 w-8 bg-gray-200 dark:bg-gray-600 rounded"></div>
                    </div>
                  ))}
                </div>
              ) : filteredStudents.length === 0 ? (
                <p className="text-center text-gray-500 dark:text-gray-400 py-8">
                  No students found
                </p>
              ) : (
                <div className="space-y-2">
                  {filteredStudents.map(student => (
                    <div
                      key={student.id}
                      className="flex items-center justify-between p-4 rounded-lg bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                    >
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-white">{student.name}</h4>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{student.email}</p>
                        <p className="text-xs text-gray-400 dark:text-gray-500">
                          Joined {format(new Date(student.joinedAt), 'PP')}
                        </p>
                      </div>
                      <button
                        onClick={() => setShowRemoveStudentConfirm(student.id)}
                        disabled={removingStudentId === student.id}
                        className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/50 rounded-lg transition-colors"
                      >
                        {removingStudentId === student.id ? (
                          <RefreshCw size={20} className="animate-spin" />
                        ) : (
                          <UserMinus size={20} />
                        )}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="space-y-6"
          >
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-2xl p-6">
              <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Content Details</h3>
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                  <Calendar size={20} />
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Created</p>
                    <p className="font-medium">{format(new Date(content.createdAt), 'PPP')}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                  <Share2 size={20} />
                  <div className="flex-1">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Sharing</p>
                    {content.sharingId ? (
                      <div className="flex items-center gap-2">
                        <code className="font-medium bg-white dark:bg-gray-800 px-2 py-1 rounded text-sm">
                          {content.sharingId}
                        </code>
                        <button
                          onClick={() => setShowRegenerateConfirm(true)}
                          disabled={isRegeneratingShare}
                          className="p-1 text-gray-500 hover:text-primary-600 dark:text-gray-400 dark:hover:text-primary-400"
                        >
                          {isRegeneratingShare ? (
                            <RefreshCw size={16} className="animate-spin" />
                          ) : (
                            <RefreshCw size={16} />
                          )}
                        </button>
                        <button
                          onClick={() => setShowRemoveShareConfirm(true)}
                          disabled={isRemovingShare}
                          className="p-1 text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400"
                        >
                          {isRemovingShare ? (
                            <RefreshCw size={16} className="animate-spin" />
                          ) : (
                            <X size={16} />
                          )}
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleRegenerateShare()}
                        disabled={isRegeneratingShare}
                        className="text-primary-600 dark:text-primary-400 text-sm font-medium"
                      >
                        Generate share link
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-2xl p-6">
              <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Danger Zone</h3>
              <button
                onClick={() => setShowDeleteConfirm(true)}
                disabled={isLoading}
                className="w-full px-4 py-2 bg-red-100 hover:bg-red-200 dark:bg-red-900/50 dark:hover:bg-red-900 text-red-700 dark:text-red-300 rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <RefreshCw size={16} className="animate-spin" />
                ) : (
                  'Delete Content'
                )}
              </button>
            </div>
          </motion.div>
        </div>
      </div>

      <ConfirmDialog
        isOpen={showDeleteConfirm}
        title="Delete Content"
        message="Are you sure you want to delete this content? This action cannot be undone."
        confirmLabel="Delete"
        onConfirm={handleDeleteContent}
        onCancel={() => setShowDeleteConfirm(false)}
        isDestructive
      />

      <ConfirmDialog
        isOpen={showRegenerateConfirm}
        title="Regenerate Share Link"
        message="Are you sure you want to regenerate the share link? The old link will no longer work."
        confirmLabel="Regenerate"
        onConfirm={handleRegenerateShare}
        onCancel={() => setShowRegenerateConfirm(false)}
      />

      <ConfirmDialog
        isOpen={showRemoveShareConfirm}
        title="Remove Share Link"
        message="Are you sure you want to remove the share link? This will prevent access to the content through the current link."
        confirmLabel="Remove"
        onConfirm={handleRemoveShare}
        onCancel={() => setShowRemoveShareConfirm(false)}
      />

      <ConfirmDialog
        isOpen={!!showRemoveStudentConfirm}
        title="Remove Student"
        message="Are you sure you want to remove this student? They will lose access to the content."
        confirmLabel="Remove"
        onConfirm={() => showRemoveStudentConfirm && handleRemoveStudent(showRemoveStudentConfirm)}
        onCancel={() => setShowRemoveStudentConfirm(null)}
        isDestructive
      />
    </div>
  );
};

export default ContentDetails;
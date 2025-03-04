import React, { useState } from 'react';
import { Plus, Users, Share2, ChevronDown, ChevronUp, Trash2, Globe } from 'lucide-react';
import { Content, Subscriber } from 'types';
import { ContentAPI, ContentCreatorAPI } from '@/api';
import { motion, AnimatePresence } from 'framer-motion';

interface Props {
  contents: Content[];
  onContentUpdate: (content: Content) => void;
  onContentDelete: (contentId: number) => void;
}

export function ContentList({ contents, onContentUpdate, onContentDelete }: Props) {
  const [expandedContent, setExpandedContent] = useState<number | null>(null);
  const [showConfirmation, setShowConfirmation] = useState<{ type: string; id: number } | null>(null);
  const [subscribers, setSubscribers] = useState<{ [key: number]: Subscriber[] }>({});
  const [showStats, setShowStats] = useState<{ [key: number]: boolean }>({});

  const handleSubscribersFetch = async (contentId: number) => {
    const data = await ContentCreatorAPI.listSubscribers(contentId);
    setSubscribers({ ...subscribers, [contentId]: data });
  };

  const handleUnregisterSubscriber = async (contentId: number, subscriberId: number) => {
    await ContentCreatorAPI.removeSubscriber(contentId, subscriberId);
    setSubscribers({
      ...subscribers,
      [contentId]: subscribers[contentId].filter(s => s.id !== subscriberId)
    });
  };

  const handlePublicToggle = async (content: Content) => {
    const updated = await ContentAPI.update(content.id, !content.isPublic, content.sharingId, content.ready);
    onContentUpdate(updated);
    setShowConfirmation(null);
  };

  const handleShareLinkUpdate = async (content: Content, remove: boolean) => {
    const updated = await ContentAPI.update(
      content.id,
      content.isPublic,
      remove ? null : crypto.randomUUID(),
      content.ready
    );
    onContentUpdate(updated);
    setShowConfirmation(null);
  };

  return (
    <div className="space-y-4">
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="fixed bottom-6 right-6 bg-primary text-white rounded-full p-4 shadow-lg"
      >
        <Plus className="w-6 h-6" />
      </motion.button>

      {contents.map((content) => (
        <motion.div
          key={content.id}
          layout
          className="bg-background rounded-lg shadow-md overflow-hidden"
        >
          <div
            className="p-4 cursor-pointer flex items-center justify-between"
            onClick={() => setExpandedContent(expandedContent === content.id ? null : content.id)}
          >
            <h3 className="text-lg font-semibold">{content.name}</h3>
            {expandedContent === content.id ? (
              <ChevronUp className="w-5 h-5" />
            ) : (
              <ChevronDown className="w-5 h-5" />
            )}
          </div>

          <AnimatePresence>
            {expandedContent === content.id && (
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: "auto" }}
                exit={{ height: 0 }}
                className="overflow-hidden"
              >
                <div className="p-4 border-t space-y-4">
                  <div className="flex gap-4">
                    <button
                      onClick={() => setShowConfirmation({ type: 'delete', id: content.id })}
                      className="flex items-center gap-2 text-red-500 hover:text-red-600"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete
                    </button>
                    <button
                      onClick={() => {
                        if (!subscribers[content.id]) {
                          handleSubscribersFetch(content.id);
                        }
                      }}
                      className="flex items-center gap-2 text-blue-500 hover:text-blue-600"
                    >
                      <Users className="w-4 h-4" />
                      Subscribers
                    </button>
                    <button
                      onClick={() => setShowConfirmation({ type: 'public', id: content.id })}
                      className="flex items-center gap-2 text-green-500 hover:text-green-600"
                    >
                      <Globe className="w-4 h-4" />
                      {content.isPublic ? 'Make Private' : 'Make Public'}
                    </button>
                    <button
                      onClick={() => setShowConfirmation({ type: 'share', id: content.id })}
                      className="flex items-center gap-2 text-purple-500 hover:text-purple-600"
                    >
                      <Share2 className="w-4 h-4" />
                      {content.sharingId ? 'Regenerate Share Link' : 'Create Share Link'}
                    </button>
                  </div>

                  <button
                    onClick={() => setShowStats({ ...showStats, [content.id]: !showStats[content.id] })}
                    className="w-full text-left"
                  >
                    <h4 className="font-semibold flex items-center gap-2">
                      Statistics
                      {showStats[content.id] ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </h4>
                  </button>

                  <AnimatePresence>
                    {showStats[content.id] && (
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: "auto" }}
                        exit={{ height: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="space-y-2 text-sm text-gray-600">
                          <p>Created: {new Date(content.createdAt).toLocaleDateString()}</p>
                          <p>Last Updated: {new Date(content.updatedAt).toLocaleDateString()}</p>
                          <p>Subscriber Count: {subscribers[content.id]?.length || 0}</p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {showConfirmation?.id === content.id && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="fixed inset-0 bg-black/50 flex items-center justify-center"
                    >
                      <div className="bg-background p-6 rounded-lg max-w-md w-full">
                        <h3 className="text-lg font-semibold mb-4">
                          {showConfirmation.type === 'delete' && 'Delete Content'}
                          {showConfirmation.type === 'public' && (content.isPublic ? 'Make Private' : 'Make Public')}
                          {showConfirmation.type === 'share' && (content.sharingId ? 'Regenerate Share Link' : 'Create Share Link')}
                        </h3>
                        <p className="mb-4">Are you sure you want to continue?</p>
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => setShowConfirmation(null)}
                            className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={() => {
                              if (showConfirmation.type === 'delete') {
                                onContentDelete(content.id);
                              } else if (showConfirmation.type === 'public') {
                                handlePublicToggle(content);
                              } else if (showConfirmation.type === 'share') {
                                handleShareLinkUpdate(content, !!content.sharingId);
                              }
                            }}
                            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                          >
                            Confirm
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      ))}
    </div>
  );
}
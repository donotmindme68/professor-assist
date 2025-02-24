import React, { useState } from 'react';
import { Search, Filter, X } from 'lucide-react';
import { Content, ContentRegistration } from '@/types';
import { ContentAPI } from '@/api';
import { motion, AnimatePresence } from 'framer-motion';

interface Props {
  registrations: ContentRegistration[];
  onUnsubscribe: (contentId: number) => void;
  onContentSelect: (content: Content) => void;
}

export function SubscribedContent({ registrations, onUnsubscribe, onContentSelect }: Props) {
  const [search, setSearch] = useState('');
  const [showConfirmation, setShowConfirmation] = useState<number | null>(null);

  const filteredRegistrations = registrations.filter(reg =>
    reg.content.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleUnsubscribe = async (contentId: number) => {
    await ContentAPI.unregister(contentId);
    onUnsubscribe(contentId);
    setShowConfirmation(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search subscribed content..."
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        <button className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50">
          <Filter className="w-5 h-5 text-gray-500" />
        </button>
      </div>

      <div className="grid gap-4">
        <AnimatePresence>
          {filteredRegistrations.map((reg) => (
            <motion.div
              key={reg.contentId}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-white rounded-lg shadow p-4 relative"
            >
              <div className="flex justify-between items-center">
                <button
                  onClick={() => onContentSelect(reg.content)}
                  className="text-lg font-semibold hover:text-primary transition-colors"
                >
                  {reg.content.name}
                </button>
                <button
                  onClick={() => setShowConfirmation(reg.contentId)}
                  className="text-red-500 hover:text-red-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {showConfirmation === reg.contentId && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="absolute inset-0 bg-white/90 rounded-lg flex items-center justify-center"
                >
                  <div className="text-center space-y-2">
                    <p>Are you sure you want to unsubscribe?</p>
                    <div className="flex gap-2 justify-center">
                      <button
                        onClick={() => handleUnsubscribe(reg.contentId)}
                        className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                      >
                        Yes
                      </button>
                      <button
                        onClick={() => setShowConfirmation(null)}
                        className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
                      >
                        No
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
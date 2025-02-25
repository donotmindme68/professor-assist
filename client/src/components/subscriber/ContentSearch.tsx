import React, { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import { Content } from '@/types';
import { PublicContentAPI } from '@/api';
import { motion, AnimatePresence } from 'framer-motion';

export function ContentSearch({ onSelect }: { onSelect: (content: Content) => void }) {
  const [query, setQuery] = useState('');
  const [contents, setContents] = useState<Content[]>([]);
  const [filteredContents, setFilteredContents] = useState<Content[]>([]);

  useEffect(() => {
    const fetchContents = async () => {
      const data = await PublicContentAPI.list();
      setContents(data);
    };
    fetchContents();
  }, []);

  useEffect(() => {
    const filtered = contents.filter(content =>
      content.name.toLowerCase().includes(query.toLowerCase())
    );
    setFilteredContents(filtered);
  }, [query, contents]);

  return (
    <div className="relative">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search public content..."
          className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      <AnimatePresence>
        {query && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute z-10 w-full mt-2 bg-background rounded-lg shadow-lg max-h-60 overflow-auto"
          >
            {filteredContents.map((content) => (
              <motion.button
                key={content.id}
                onClick={() => onSelect(content)}
                className="w-full px-4 py-2 text-left hover:bg-gray-50 transition-colors"
                whileHover={{ scale: 1.01 }}
              >
                {content.name}
              </motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
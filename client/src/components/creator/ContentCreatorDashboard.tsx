import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, LayoutGroup } from 'framer-motion';
import { Search, Plus, Filter, Lock, Globe, RefreshCw, BookOpen, Users, Calendar, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import { Content } from 'types';
import ContentDetails from './ContentDetails';
import {ContentCreatorAPI} from "@/api";

type SortOption = 'newest' | 'oldest' | 'name';
type ReadyFilter = 'all' | 'ready' | 'draft';

export const ContentCreatorDashboard = () => {
  const [contents, setContents] = useState<Content[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedContent, setSelectedContent] = useState<Content | null>(null);
  const [filterPublic, setFilterPublic] = useState<boolean | null>(null);
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [readyFilter, setReadyFilter] = useState<ReadyFilter>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchContents = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await ContentCreatorAPI.listContents()
      setContents(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchContents();
    setIsRefreshing(false);
  };

  useEffect(() => {
    fetchContents();
  }, []);

  const filteredAndSortedContents = contents
    .filter(content => {
      const matchesSearch = content.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesPublic = filterPublic === null || content.isPublic === filterPublic;
      const matchesReady = readyFilter === 'all'
        ? true
        : readyFilter === 'ready'
          ? content.ready
          : !content.ready;
      return matchesSearch && matchesPublic && matchesReady;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'oldest':
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case 'name':
          return a.name.localeCompare(b.name);
        default:
          return 0;
      }
    });

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-gray-900 dark:to-indigo-950 p-6">
      <LayoutGroup>
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent">
                Content Dashboard
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                Manage and organize your educational content
              </p>
            </div>
            <div className="flex gap-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleRefresh}
                disabled={isLoading || isRefreshing}
                className={`p-2 rounded-lg border border-gray-200 dark:border-gray-700 
                  ${isRefreshing ? 'bg-indigo-50 dark:bg-indigo-900/50' : 'bg-white dark:bg-gray-800'}`}
              >
                <RefreshCw
                  size={20}
                  className={`text-gray-600 dark:text-gray-400 
                    ${isRefreshing ? 'animate-spin' : ''}`}
                />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-lg shadow-lg hover:shadow-xl transition-shadow"
              >
                <Plus size={20} />
                Create New Content
              </motion.button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="flex gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Search content..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                />
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setFilterPublic(filterPublic === null ? true : filterPublic === true ? false : null)}
                className={`flex items-center gap-2 px-4 py-3 rounded-lg border ${
                  filterPublic === null
                    ? 'border-gray-200 dark:border-gray-700'
                    : 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900'
                }`}
              >
                <Filter size={20} className={filterPublic === null ? 'text-gray-400' : 'text-indigo-500'} />
                {filterPublic === null ? 'All' : filterPublic ? 'Public' : 'Private'}
              </motion.button>
            </div>
            <div className="flex gap-4">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="px-4 py-3 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all dark:text-gray-200"
              >
                <option value="newest">Newest</option>
                <option value="oldest">Oldest</option>
                <option value="name">Name</option>
              </select>
              <select
                value={readyFilter}
                onChange={(e) => setReadyFilter(e.target.value as ReadyFilter)}
                className="px-4 py-3 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              >
                <option value="all">All Status</option>
                <option value="ready">Ready</option>
                <option value="draft">Draft</option>
              </select>
            </div>
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mb-6 p-4 bg-red-50 dark:bg-red-900/50 border border-red-200 dark:border-red-800 rounded-lg flex items-center gap-3 text-red-700 dark:text-red-300"
            >
              <AlertCircle size={20} />
              <p>{error}</p>
            </motion.div>
          )}

          <motion.div
            layout
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            <>
              {isLoading ? (
                Array.from({ length: 6 }).map((_, index) => (
                  <motion.div
                    key={`skeleton-${index}`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-100 dark:border-gray-700"
                  >
                    <div className="animate-pulse space-y-4">
                      <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
                    </div>
                  </motion.div>
                ))
              ) : filteredAndSortedContents.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="col-span-full p-8 text-center"
                >
                  <p className="text-gray-500 dark:text-gray-400">No content matches your filters</p>
                </motion.div>
              ) : (
                filteredAndSortedContents.map((content) => (
                  <motion.div
                    key={content.id}
                    layoutId={`content-${content.id}`}
                    initial={{ opacity: 0, y: 0 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 0 }}
                    whileHover={{ y: -5 }}
                    onClick={() => setSelectedContent(content)}
                    className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all cursor-pointer border border-gray-100 dark:border-gray-700"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <motion.h3
                        layoutId={`title-${content.id}`}
                        className="text-xl font-semibold text-gray-900 dark:text-white"
                      >
                        {content.name}
                      </motion.h3>
                      {content.isPublic ? (
                        <Globe size={20} className="text-green-500" />
                      ) : (
                        <Lock size={20} className="text-gray-400" />
                      )}
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                        <Calendar size={16} />
                        <span>Created: {format(new Date(content.createdAt), 'PP')}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                        <BookOpen size={16} />
                        <span>12 Lessons</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                        <Users size={16} />
                        <span>156 Students</span>
                      </div>
                      <div className="flex items-center gap-2 mt-3">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          content.ready
                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                            : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                        }`}>
                          {content.ready ? 'Ready' : 'Draft'}
                        </span>
                        {content.sharingId && (
                          <span className="px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                            Shared
                          </span>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </>
          </motion.div>

          <AnimatePresence>
            {selectedContent && (
              <ContentDetails
                content={selectedContent}
                onClose={() => setSelectedContent(null)}
              />
            )}
          </AnimatePresence>
        </div>
      </LayoutGroup>
    </div>
  );
};

export default ContentCreatorDashboard;
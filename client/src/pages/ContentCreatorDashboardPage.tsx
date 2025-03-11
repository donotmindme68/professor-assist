import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Plus, Filter, Lock, Globe, RefreshCw, BookOpen, Users, Calendar, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import { ContentCreatorContent } from '../types';
import { ContentCreatorAPI } from '../api';
import { NavBar } from '../components/NavBar';
import CreateContentDialog from '../components/creator/CreateContentDialog';
import ContentCardSkeleton from "@/components/creator/ContentCardSkeleton.tsx";
import ContentCard from "@/components/creator/ContentCard.tsx";

type SortOption = 'newest' | 'oldest' | 'name';
type ReadyFilter = 'all' | 'ready' | 'draft';

export const ContentCreatorDashboardPage = () => {
  const navigate = useNavigate();
  const [contents, setContents] = useState<ContentCreatorContent[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPublic, setFilterPublic] = useState<boolean | null>(null);
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [readyFilter, setReadyFilter] = useState<ReadyFilter>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  const fetchContents = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await ContentCreatorAPI.listContents();
      setContents(data);
      // await new Promise((resolve)=> setTimeout(resolve, 1000))
      // // Mock data for development
      // setContents([
      //   {
      //     id: 1,
      //     name: "React Fundamentals",
      //     description: "Learn the basics of React",
      //     creatorId: 1,
      //     modelInfo: {},
      //     isPublic: true,
      //     sharingId: "abc123",
      //     ready: true,
      //     createdAt: new Date().toISOString()
      //   },
      //   {
      //     id: 2,
      //     name: "Advanced TypeScript",
      //     description: "Deep dive into TypeScript",
      //     creatorId: 1,
      //     modelInfo: {},
      //     isPublic: false,
      //     sharingId: null,
      //     ready: false,
      //     createdAt: new Date(Date.now() - 86400000).toISOString()
      //   }
      // ]);
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

  const handleCreateSuccess = (newContent: ContentCreatorContent) => {
    setContents(prev => [newContent, ...prev]);
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

  const handleContentClick = (content: ContentCreatorContent) => {
    navigate(`/contents/${content.id}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      <NavBar />
      <div className="h-16" />
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <motion.h1
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white flex items-center"
          >
            <BookOpen className="mr-2 text-primary-600 dark:text-primary-400" />
            Content Dashboard
          </motion.h1>
          <div className="flex items-center gap-4">
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={handleRefresh}
              disabled={isLoading || isRefreshing}
              className="p-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <RefreshCw className={isRefreshing ? 'animate-spin' : ''} size={20} />
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowCreateDialog(true)}
              className="flex items-center px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors"
            >
              <Plus size={18} className="mr-2" />
              Create Content
            </motion.button>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="flex-grow">
            <div className="relative">
              <Search
                size={18}
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500"
              />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search content..."
                className="w-full pl-10 pr-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:text-white"
              />
            </div>
          </div>
          <div className="flex gap-4">
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => setFilterPublic(filterPublic === null ? true : filterPublic === true ? false : null)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg border ${
                filterPublic === null
                  ? 'border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300'
                  : 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300'
              }`}
            >
              <Filter size={18} />
              {filterPublic === null ? 'All' : filterPublic ? 'Public' : 'Private'}
            </motion.button>
            <select
              value={readyFilter}
              onChange={(e) => setReadyFilter(e.target.value as ReadyFilter)}
              className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:text-white"
            >
              <option value="all">All Status</option>
              <option value="ready">Ready</option>
              <option value="training">Training</option>
              <option value="failed">Failed</option>
            </select>
          </div>
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-center gap-3 text-red-700 dark:text-red-300"
          >
            <AlertCircle size={20} />
            <p>{error}</p>
          </motion.div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {isLoading ? (
            Array.from({ length: 6 }).map((_, index) => (
              <ContentCardSkeleton key={`skeleton-${index}`} />
            ))
          ) : filteredAndSortedContents.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="col-span-full text-center py-12"
            >
              <p className="text-gray-500 dark:text-gray-400">No content matches your filters</p>
            </motion.div>
          ) : (
            filteredAndSortedContents.map((content) => (
              <ContentCard
                key={content.id}
                content={content}
                onClick={() => handleContentClick(content)}
              />
            ))
          )}
        </div>

        <AnimatePresence>
          {showCreateDialog && (
            <CreateContentDialog
              isOpen={showCreateDialog}
              onClose={() => setShowCreateDialog(false)}
              onSuccess={handleCreateSuccess}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default ContentCreatorDashboardPage;
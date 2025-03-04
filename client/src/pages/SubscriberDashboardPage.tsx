import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Filter, Sparkles, BookOpen, Compass } from 'lucide-react';
import { SubscriberContent, ContentRegistration } from '../types';
import ContentCard from '../components/common/ContentCard';
import SearchBar from '../components/common/SearchBar';
import FilterOptions from '../components/common/FilterOptions';
import ThemeToggle from '../components/common/ThemeToggle';
import EmptyState from '../components/common/EmptyState';
import ErrorState from '../components/common/ErrorState';
import ContentDiscovery from '../subscriber/ContentDiscovery';
import {NavBar} from "@/components/NavBar.tsx";
// import { SubscriberAPI, ContentAPI } from '../api/client';

// Mock data for demonstration
const MOCK_CONTENTS: SubscriberContent[] = [
  {
    id: 1,
    name: "Advanced Machine Learning Course",
    description: "Learn advanced machine learning techniques and algorithms",
    isPublic: true
  },
  {
    id: 2,
    name: "Introduction to Data Science",
    description: "A beginner-friendly introduction to data science concepts",
    isPublic: true
  },
  {
    id: 3,
    name: "Web Development Masterclass",
    description: "Comprehensive web development course covering frontend and backend",
    isPublic: false
  },
  {
    id: 4,
    name: "AI for Business Applications",
    description: "Practical applications of AI in business contexts",
    isPublic: true
  },
  {
    id: 5,
    name: "Python Programming Fundamentals",
    description: "Core Python programming concepts for intermediate developers",
    isPublic: true
  }
];

const MOCK_SUBSCRIPTIONS: ContentRegistration[] = [
  {
    id: 101,
    subscriberId: 1001,
    contentId: 1,
    createdAt: "2023-05-16T08:30:00Z",
    updatedAt: "2023-05-16T08:30:00Z"
  },
  {
    id: 102,
    subscriberId: 1001,
    contentId: 3,
    createdAt: "2023-07-06T10:15:00Z",
    updatedAt: "2023-07-06T10:15:00Z"
  }
];

const SubscriberDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [contents, setContents] = useState<SubscriberContent[]>([]);
  const [subscriptions, setSubscriptions] = useState<ContentRegistration[]>([]);
  const [filteredContents, setFilteredContents] = useState<SubscriberContent[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showPublicOnly, setShowPublicOnly] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'subscribed' | 'discover'>('subscribed');

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Simulate random error (1 in 4 chance)
      if (Math.random() < 0.25) {
        throw new Error("Failed to load content. Please check your connection and try again.");
      }
      
      setContents(MOCK_CONTENTS);
      setSubscriptions(MOCK_SUBSCRIPTIONS);

      // Actual API implementation (commented out)
      // const subscribedContents = await SubscriberAPI.getSubscribedContents();
      // const subscriptions = await SubscriberAPI.listSubscriptions();
      // setContents(subscribedContents);
      // setSubscriptions(subscriptions);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  // Simulate API fetch
  useEffect(() => {
    fetchData();
  }, []);

  // Apply filters and search
  useEffect(() => {
    if (error) return;
    
    // Get subscribed content only
    const subscribedContentIds = subscriptions.map(sub => sub.contentId);
    let filtered = contents.filter(content => subscribedContentIds.includes(content.id));

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(content => 
        content.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (content.description && content.description.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    // Apply public only filter
    if (showPublicOnly) {
      filtered = filtered.filter(content => content.isPublic);
    }

    setFilteredContents(filtered);
  }, [contents, subscriptions, searchQuery, showPublicOnly, error]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleSubscribe = (contentId: number) => {
    // In a real app, this would make an API call
    const newSubscription: ContentRegistration = {
      id: Math.floor(Math.random() * 1000) + 200,
      subscriberId: 1001, // Assuming current user id
      contentId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    setSubscriptions([...subscriptions, newSubscription]);

    // Actual API implementation (commented out)
    // const subscribeToContent = async () => {
    //   try {
    //     await ContentAPI.register(contentId);
    //     // Refresh subscriptions
    //     const updatedSubscriptions = await SubscriberAPI.listSubscriptions();
    //     setSubscriptions(updatedSubscriptions);
    //   } catch (err) {
    //     console.error("Failed to subscribe:", err);
    //   }
    // };
    // subscribeToContent();
  };

  const getSubscribedContentIds = () => {
    return subscriptions.map(sub => sub.contentId);
  };

  const handleContentClick = (content: SubscriberContent) => {
    navigate(`/contents/${content.id}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      <NavBar/>
      <div className='h-16'/>
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <motion.h1 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white flex items-center"
          >
            <BookOpen className="mr-2 text-primary-600 dark:text-primary-400" />
            Content Library
          </motion.h1>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 dark:border-gray-700 mb-6">
          <button
            onClick={() => setActiveTab('subscribed')}
            className={`py-3 px-4 font-medium text-sm flex items-center ${
              activeTab === 'subscribed'
                ? 'text-primary-600 dark:text-primary-400 border-b-2 border-primary-600 dark:border-primary-400'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            <BookOpen size={18} className="mr-2" />
            My Content
          </button>
          <button
            onClick={() => setActiveTab('discover')}
            className={`py-3 px-4 font-medium text-sm flex items-center ${
              activeTab === 'discover'
                ? 'text-primary-600 dark:text-primary-400 border-b-2 border-primary-600 dark:border-primary-400'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            <Compass size={18} className="mr-2" />
            Discover New Content
          </button>
        </div>

        {activeTab === 'subscribed' ? (
          <>
            <div className="flex flex-col md:flex-row gap-4 mb-8">
              <div className="flex-grow">
                <SearchBar onSearch={handleSearch} />
              </div>
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center justify-center px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <Filter size={18} className="mr-2" />
                Filters
              </motion.button>
            </div>

            <AnimatePresence>
              {showFilters && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mb-6 overflow-hidden"
                >
                  <FilterOptions
                    showPublicOnly={showPublicOnly}
                    setShowPublicOnly={setShowPublicOnly}
                  />
                </motion.div>
              )}
            </AnimatePresence>

            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map(i => (
                  <div 
                    key={i} 
                    className="bg-white dark:bg-gray-800 rounded-xl shadow-lg h-48 animate-pulse-slow"
                  />
                ))}
              </div>
            ) : error ? (
              <ErrorState 
                message={error}
                onRetry={fetchData}
              />
            ) : filteredContents.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredContents.map(content => (
                  <ContentCard
                    key={content.id}
                    content={content}
                    isSubscribed={true}
                    onSubscribe={handleSubscribe}
                    onClick={handleContentClick}
                  />
                ))}
              </div>
            ) : (
              <EmptyState 
                type={searchQuery ? 'search' : 'content'}
                message={
                  searchQuery 
                    ? "We couldn't find any content matching your search. Try different keywords or adjust your filters."
                    : "You haven't subscribed to any content yet. Discover and subscribe to content in the 'Discover New Content' tab."
                }
              />
            )}

            {!isLoading && !error && filteredContents.length === 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="mt-8 p-4 bg-primary-50 dark:bg-primary-900/20 rounded-lg border border-primary-100 dark:border-primary-800"
              >
                <div className="flex items-start">
                  <Sparkles className="text-primary-600 dark:text-primary-400 mr-3 mt-1" size={20} />
                  <div>
                    <h3 className="font-medium text-primary-800 dark:text-primary-300">Discover New Content</h3>
                    <p className="text-sm text-primary-700 dark:text-primary-400 mt-1">
                      Browse our public content library and subscribe to topics that interest you. New content is added regularly!
                    </p>
                  </div>
                </div>
              </motion.div>
            )}
          </>
        ) : (
          <ContentDiscovery 
            subscribedContentIds={getSubscribedContentIds()} 
            onSubscribe={handleSubscribe} 
          />
        )}
      </div>
    </div>
  );
};

export default SubscriberDashboardPage;
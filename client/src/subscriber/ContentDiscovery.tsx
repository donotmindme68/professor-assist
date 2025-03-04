import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Compass, Link } from 'lucide-react';
import { ContentPreview } from '../types';
import ContentPreviewCard from '../components/subscriber/ContentPreviewCard';
import EmptyState from '../components/common/EmptyState';
import ErrorState from '../components/common/ErrorState';
import InviteLinkDialog from './InviteLinkDialog';
// import { ContentAPI } from '../api/client';

// Mock data for demonstration
const MOCK_CONTENT_PREVIEWS: ContentPreview[] = [
  {
    id: 6,
    name: "JavaScript for Beginners",
    creatorId: 105,
    description: "Learn the fundamentals of JavaScript programming from scratch. Perfect for beginners with no prior experience."
  },
  {
    id: 7,
    name: "Advanced React Patterns",
    creatorId: 102,
    description: "Dive deep into advanced React patterns including render props, compound components, and state machines."
  },
  {
    id: 8,
    name: "Data Visualization with D3.js",
    creatorId: 103,
    description: "Create beautiful, interactive data visualizations using the powerful D3.js library."
  },
  {
    id: 9,
    name: "Mobile App Development with React Native",
    creatorId: 104,
    description: "Build cross-platform mobile applications using React Native. One codebase for iOS and Android."
  },
  {
    id: 10,
    name: "Introduction to Cloud Computing",
    creatorId: 101,
    description: "Learn the basics of cloud computing and how to leverage cloud services for your applications."
  }
];

interface ContentDiscoveryProps {
  subscribedContentIds: number[];
  onSubscribe: (contentId: number) => void;
}

const ContentDiscovery: React.FC<ContentDiscoveryProps> = ({ 
  subscribedContentIds,
  onSubscribe 
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [availableContent, setAvailableContent] = useState<ContentPreview[]>([]);
  const [filteredContent, setFilteredContent] = useState<ContentPreview[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [subscribingId, setSubscribingId] = useState<number | null>(null);
  const [subscribeError, setSubscribeError] = useState<number | null>(null);
  
  // Invite link dialog state
  const [showInviteDialog, setShowInviteDialog] = useState(false);

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Simulate random error (1 in 4 chance)
      if (Math.random() < 0.25) {
        throw new Error("Failed to fetch available content. Network error.");
      }
      
      // Filter out already subscribed content
      const notSubscribedContent = MOCK_CONTENT_PREVIEWS.filter(
        content => !subscribedContentIds.includes(content.id)
      );
      
      setAvailableContent(notSubscribedContent);
      setFilteredContent(notSubscribedContent);

      // Actual API implementation (commented out)
      // const publicContents = await ContentAPI.getPublicContents();
      // const notSubscribedContent = publicContents.filter(
      //   content => !subscribedContentIds.includes(content.id)
      // );
      // setAvailableContent(notSubscribedContent);
      // setFilteredContent(notSubscribedContent);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  // Simulate API fetch
  useEffect(() => {
    fetchData();
  }, [subscribedContentIds]);

  // Apply search filter
  useEffect(() => {
    if (!searchQuery) {
      setFilteredContent(availableContent);
      return;
    }

    const filtered = availableContent.filter(content => 
      content.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (content.description && content.description.toLowerCase().includes(searchQuery.toLowerCase()))
    );
    
    setFilteredContent(filtered);
  }, [searchQuery, availableContent]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleSubscribe = async (contentId: number) => {
    setSubscribingId(contentId);
    setSubscribeError(null);
    
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Simulate random error (1 in 4 chance)
      if (Math.random() < 0.25) {
        throw new Error("Subscription failed. Please try again.");
      }
      
      onSubscribe(contentId);
      
      // Remove the subscribed content from the available list
      setAvailableContent(prev => prev.filter(content => content.id !== contentId));

      // Actual API implementation (commented out)
      // await ContentAPI.register(contentId);
      // onSubscribe(contentId);
      // setAvailableContent(prev => prev.filter(content => content.id !== contentId));
    } catch (err) {
      setSubscribeError(contentId);
      console.error("Subscription error:", err);
    } finally {
      setSubscribingId(null);
    }
  };

  const retrySubscribe = (contentId: number) => {
    setSubscribeError(null);
    handleSubscribe(contentId);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
      <div className="flex items-center mb-6">
        <Compass className="text-primary-600 dark:text-primary-400 mr-2" size={24} />
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Discover New Content</h2>
      </div>
      
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-grow relative">
          <Search 
            size={18} 
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500" 
          />
          <input
            type="text"
            value={searchQuery}
            onChange={handleSearch}
            placeholder="Search for new content..."
            className="w-full pl-10 pr-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:text-white"
          />
        </div>
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowInviteDialog(true)}
          className="flex items-center justify-center px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg"
        >
          <Link size={18} className="mr-2" />
          Use Invite Link
        </motion.button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map(i => (
            <div 
              key={i} 
              className="bg-gray-100 dark:bg-gray-700 rounded-xl h-40 animate-pulse-slow"
            />
          ))}
        </div>
      ) : error ? (
        <ErrorState 
          message={error}
          onRetry={fetchData}
        />
      ) : filteredContent.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredContent.map(content => (
            <div key={content.id}>
              {subscribeError === content.id ? (
                <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg mb-4 border border-red-100 dark:border-red-800">
                  <p className="text-sm text-red-600 dark:text-red-400 mb-2">Failed to subscribe. Please try again.</p>
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={() => retrySubscribe(content.id)}
                    className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-xs font-medium"
                  >
                    Retry
                  </motion.button>
                </div>
              ) : null}
              <ContentPreviewCard
                content={content}
                onSubscribe={handleSubscribe}
                isSubscribing={subscribingId === content.id}
              />
            </div>
          ))}
        </div>
      ) : (
        <EmptyState 
          type="search"
          message={
            searchQuery 
              ? "We couldn't find any new content matching your search. Try different keywords."
              : "You've discovered all available content! Check back later for new additions."
          }
        />
      )}

      {/* Invite Link Dialog */}
      <AnimatePresence>
        {showInviteDialog && (
          <InviteLinkDialog 
            isOpen={showInviteDialog}
            onClose={() => setShowInviteDialog(false)}
            onSubscribe={onSubscribe}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default ContentDiscovery;
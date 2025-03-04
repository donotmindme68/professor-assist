import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Compass, Link, X, Clipboard, ExternalLink, Check, AlertTriangle } from 'lucide-react';
import { ContentPreview } from '../../types';
import ContentPreviewCard from './ContentPreviewCard';
import EmptyState from '../common/EmptyState';
import ErrorState from '../common/ErrorState';

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
  const [inviteLink, setInviteLink] = useState('');
  const [inviteLinkError, setInviteLinkError] = useState<string | null>(null);
  const [isLoadingInvite, setIsLoadingInvite] = useState(false);
  const [inviteContent, setInviteContent] = useState<ContentPreview | null>(null);
  const [inviteSuccess, setInviteSuccess] = useState(false);

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

  // Invite link handlers
  const handleOpenInviteDialog = () => {
    setShowInviteDialog(true);
    setInviteLink('');
    setInviteLinkError(null);
    setInviteContent(null);
    setInviteSuccess(false);
  };

  const handleCloseInviteDialog = () => {
    setShowInviteDialog(false);
  };

  const handlePasteFromClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setInviteLink(text);
      validateAndFetchInviteContent(text);
    } catch (err) {
      setInviteLinkError("Unable to access clipboard. Please paste the link manually.");
    }
  };

  const validateAndFetchInviteContent = async (link: string) => {
    if (!link.trim()) {
      setInviteLinkError("Please enter an invite link");
      setInviteContent(null);
      return;
    }

    // Simple validation - in a real app, you'd validate the format more thoroughly
    if (!link.includes('invite') && !link.includes('share')) {
      setInviteLinkError("Invalid invite link format");
      setInviteContent(null);
      return;
    }

    setIsLoadingInvite(true);
    setInviteLinkError(null);

    try {
      // Simulate API call to fetch content details from invite link
      await new Promise(resolve => setTimeout(resolve, 1200));
      
      // Extract a mock ID from the link - in a real app, you'd parse the actual link
      const mockId = Math.floor(Math.random() * 1000) + 200;
      
      // Simulate random error (1 in 5 chance)
      if (Math.random() < 0.2) {
        throw new Error("Invalid or expired invite link");
      }
      
      // Create mock content from the invite
      const mockInviteContent: ContentPreview = {
        id: mockId,
        name: `Invited Content #${mockId}`,
        creatorId: 100 + (mockId % 10),
        description: "This is content shared with you via an invite link. It could be private or public content that you've been specifically invited to access."
      };
      
      setInviteContent(mockInviteContent);
    } catch (err) {
      setInviteLinkError(err instanceof Error ? err.message : "Failed to fetch content details");
      setInviteContent(null);
    } finally {
      setIsLoadingInvite(false);
    }
  };

  const handleInviteLinkChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInviteLink(e.target.value);
    if (inviteLinkError) {
      setInviteLinkError(null);
    }
  };

  const handleInviteLinkSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    validateAndFetchInviteContent(inviteLink);
  };

  const handleSubscribeToInvite = async () => {
    if (!inviteContent) return;
    
    setIsLoadingInvite(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Simulate random error (1 in 5 chance)
      if (Math.random() < 0.2) {
        throw new Error("Failed to subscribe to invited content");
      }
      
      // Add to subscriptions
      onSubscribe(inviteContent.id);
      setInviteSuccess(true);
      
      // Close dialog after a delay
      setTimeout(() => {
        setShowInviteDialog(false);
      }, 2000);
    } catch (err) {
      setInviteLinkError(err instanceof Error ? err.message : "Subscription failed");
    } finally {
      setIsLoadingInvite(false);
    }
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
          onClick={handleOpenInviteDialog}
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
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            onClick={handleCloseInviteDialog}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-md w-full shadow-xl"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                  <Link size={20} className="mr-2 text-primary-600 dark:text-primary-400" />
                  Register via Invite Link
                </h3>
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={handleCloseInviteDialog}
                  className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                >
                  <X size={20} />
                </motion.button>
              </div>

              {!inviteSuccess ? (
                <>
                  {!inviteContent ? (
                    <form onSubmit={handleInviteLinkSubmit}>
                      <div className="mb-4">
                        <label htmlFor="inviteLink" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Paste your invite link below
                        </label>
                        <div className="relative">
                          <input
                            id="inviteLink"
                            type="text"
                            value={inviteLink}
                            onChange={handleInviteLinkChange}
                            placeholder="https://example.com/invite/abc123"
                            className="w-full pl-3 pr-10 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:text-white"
                          />
                          <motion.button
                            whileTap={{ scale: 0.9 }}
                            type="button"
                            onClick={handlePasteFromClipboard}
                            className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                            title="Paste from clipboard"
                          >
                            <Clipboard size={18} />
                          </motion.button>
                        </div>
                        {inviteLinkError && (
                          <p className="mt-2 text-sm text-red-600 dark:text-red-400 flex items-center">
                            <AlertTriangle size={14} className="mr-1" />
                            {inviteLinkError}
                          </p>
                        )}
                      </div>
                      
                      <div className="flex justify-end space-x-3">
                        <motion.button
                          whileTap={{ scale: 0.95 }}
                          type="button"
                          onClick={handleCloseInviteDialog}
                          className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-sm"
                        >
                          Cancel
                        </motion.button>
                        <motion.button
                          whileTap={{ scale: 0.95 }}
                          type="submit"
                          disabled={isLoadingInvite}
                          className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg text-sm flex items-center"
                        >
                          {isLoadingInvite ? (
                            <>
                              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                              Verifying...
                            </>
                          ) : (
                            <>
                              <ExternalLink size={16} className="mr-1" />
                              Verify Link
                            </>
                          )}
                        </motion.button>
                      </div>
                    </form>
                  ) : (
                    <div>
                      <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg mb-4 border border-gray-200 dark:border-gray-600">
                        <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                          {inviteContent.name}
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                          {inviteContent.description}
                        </p>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          Creator ID: {inviteContent.creatorId}
                        </div>
                      </div>
                      
                      <div className="flex justify-end space-x-3">
                        <motion.button
                          whileTap={{ scale: 0.95 }}
                          type="button"
                          onClick={handleCloseInviteDialog}
                          className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-sm"
                        >
                          Cancel
                        </motion.button>
                        <motion.button
                          whileTap={{ scale: 0.95 }}
                          onClick={handleSubscribeToInvite}
                          disabled={isLoadingInvite}
                          className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg text-sm flex items-center"
                        >
                          {isLoadingInvite ? (
                            <>
                              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                              Subscribing...
                            </>
                          ) : (
                            'Subscribe to Content'
                          )}
                        </motion.button>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-6">
                  <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Check size={32} className="text-green-600 dark:text-green-400" />
                  </div>
                  <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    Successfully Subscribed!
                  </h4>
                  <p className="text-gray-600 dark:text-gray-300">
                    You now have access to this content in your library.
                  </p>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ContentDiscovery;
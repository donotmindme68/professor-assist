import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, X, Clipboard, ExternalLink, Check, AlertTriangle } from 'lucide-react';
import { ContentPreview } from '../types';

interface InviteLinkDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubscribe: (contentId: number) => void;
}

const InviteLinkDialog: React.FC<InviteLinkDialogProps> = ({
  isOpen,
  onClose,
  onSubscribe
}) => {
  const [inviteLink, setInviteLink] = useState('');
  const [inviteLinkError, setInviteLinkError] = useState<string | null>(null);
  const [isLoadingInvite, setIsLoadingInvite] = useState(false);
  const [inviteContent, setInviteContent] = useState<ContentPreview | null>(null);
  const [inviteSuccess, setInviteSuccess] = useState(false);

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
        resetAndClose();
      }, 2000);
    } catch (err) {
      setInviteLinkError(err instanceof Error ? err.message : "Subscription failed");
    } finally {
      setIsLoadingInvite(false);
    }
  };

  const resetAndClose = () => {
    // Reset state
    setInviteLink('');
    setInviteLinkError(null);
    setInviteContent(null);
    setInviteSuccess(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
      onClick={resetAndClose}
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
            onClick={resetAndClose}
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
                      className="w-full pl-3 pr-12 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:text-white"
                    />
                    <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                      <motion.button
                        whileTap={{ scale: 0.9 }}
                        type="button"
                        onClick={handlePasteFromClipboard}
                        className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                        title="Paste from clipboard"
                      >
                        <Clipboard size={18} />
                      </motion.button>
                    </div>
                  </div>
                  {inviteLinkError && (
                    <p className="mt-2 text-sm text-red-600 dark:text-red-400 flex items-center">
                      <AlertTriangle size={14} className="mr-1 flex-shrink-0" />
                      <span>{inviteLinkError}</span>
                    </p>
                  )}
                </div>
                
                <div className="flex justify-end space-x-3">
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    type="button"
                    onClick={resetAndClose}
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
                    onClick={resetAndClose}
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
  );
};

export default InviteLinkDialog;
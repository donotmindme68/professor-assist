import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Navigate } from 'react-router-dom';
import { ChatBox } from '@/components/chat-box';
import { getUser } from '@/utils';
import { ContentSearch } from '@/components/subscriber/ContentSearch';
import { SubscribedContent } from '@/components/subscriber/SubscribedContent';
import { ContentList } from '@/components/creator/ContentList';
import { CreateContentDialog } from '@/components/creator/CreateContentDialog';
import { Content, ContentRegistration } from 'types';
import { ContentAPI, ContentCreatorAPI, SubscriberAPI } from '@/api';

export default function DashboardPage() {
  const user = getUser();
  const [selectedContent, setSelectedContent] = useState<Content | null>(null);
  const [registrations, setRegistrations] = useState<ContentRegistration[]>([]);
  const [contents, setContents] = useState<Content[]>([]);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      if (user.role === 'subscriber') {
        const data = await SubscriberAPI.listSubscriptions();
        setRegistrations(data);
      } else if (user.role === 'content-creator') {
        const data = await ContentCreatorAPI.listContents();
        setContents(data);
      }
    };

    fetchData().catch(); //todo: fix
  }, [user]);

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  const handleContentSelect = (content: Content) => {
    setSelectedContent(content);
  };

  const handleUnsubscribe = (contentId: number) => {
    setRegistrations(registrations.filter(reg => reg.contentId !== contentId));
  };

  const handleContentUpdate = (updated: Content) => {
    setContents(contents.map(c => c.id === updated.id ? updated : c));
  };

  const handleContentDelete = async (contentId: number) => {
    await ContentAPI.delete(contentId);
    setContents(contents.filter(c => c.id !== contentId));
  };

  return (
    <div className='w-full min-h-screen'>
      <div className='container mx-auto px-4 py-8'>
        <motion.header
          className="text-center mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
            {user.role === 'subscriber' ? 'Your Learning Dashboard' : 'Content Management'}
          </h1>
        </motion.header>

        {selectedContent ? (
          <div className="flex gap-4">
            <div className="w-64 bg-background rounded-lg shadow p-4">
              {/* Thread selector sidebar - placeholder */}
              <h2 className="font-semibold mb-4">Threads</h2>
            </div>
            <div className="flex-1">
              <ChatBox thread={null} /> {/* Replace null with actual thread when implemented */}
            </div>
          </div>
        ) : (
          <div className="max-w-4xl mx-auto">
            {user.role === 'subscriber' ? (
              <>
                <ContentSearch onSelect={handleContentSelect} />
                <div className="mt-8">
                  <h2 className="text-2xl font-semibold mb-4">Your Subscriptions</h2>
                  <SubscribedContent
                    registrations={registrations}
                    onUnsubscribe={handleUnsubscribe}
                    onContentSelect={handleContentSelect}
                  />
                </div>
              </>
            ) : (
              <>
                <ContentList
                  contents={contents}
                  onContentUpdate={handleContentUpdate}
                  onContentDelete={handleContentDelete}
                />
                <CreateContentDialog
                  isOpen={isCreateDialogOpen}
                  onClose={() => setIsCreateDialogOpen(false)}
                  onSubmit={async (data) => {
                    const newContent = await ContentAPI.create(data.isPublic, []);
                    setContents([...contents, newContent]);
                  }}
                />
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ContentCreatorContent } from '../types';
import ContentDetails from '../components/creator/ContentDetails';
import ErrorState from '../components/common/ErrorState';
import { NavBar } from '../components/NavBar';
import { ContentCreatorAPI } from '../api';

const ContentDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [content, setContent] = useState<ContentCreatorContent | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchContent = async () => {
      if (!id) return;

      setIsLoading(true);
      setError(null);

      try {
        // For now, we'll use mock data since the API endpoint isn't implemented
        // In production, this would be:
        // const content = await ContentCreatorAPI.getContent(parseInt(id)); //todo: fix
        const content = (await ContentCreatorAPI.listContents()).find(c => c.id === Number.parseInt(id))! //todo: fix
        setContent(content)

        // const mockContent: ContentCreatorContent = {
        //   id: parseInt(id),
        //   name: "Sample Content",
        //   description: "This is a sample content item",
        //   creatorId: 1,
        //   modelInfo: {},
        //   isPublic: true,
        //   sharingId: "abc123",
        //   ready: true,
        //   createdAt: new Date().toISOString()
        // };
        //
        // setContent(mockContent);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load content");
      } finally {
        setIsLoading(false);
      }
    };

    fetchContent();
  }, [id]);

  const handleClose = () => {
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      <NavBar />
      <div className="h-16" /> {/* Spacer for fixed navbar */}

      {isLoading ? (
        <div className="container mx-auto px-4 py-8 flex items-center justify-center">
          <div className="w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : error ? (
        <div className="container mx-auto px-4 py-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
            <ErrorState
              message={error}
              onRetry={() => navigate('/dashboard')}
            />
          </div>
        </div>
      ) : content ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <ContentDetails content={content} onClose={handleClose} />
        </motion.div>
      ) : (
        <div className="container mx-auto px-4 py-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
            <ErrorState
              message="Content not found"
              onRetry={() => navigate('/dashboard')}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ContentDetailsPage;
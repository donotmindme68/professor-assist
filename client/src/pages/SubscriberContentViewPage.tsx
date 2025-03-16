import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { SubscriberContent } from '../types';
import SubscriberContentView from '../components/subscriber/SubscriberContentView';
import ErrorState from '../components/common/ErrorState';
import {NavBar} from "@/components/NavBar.tsx";
import {SubscriberAPI} from "@/api";
// import { ContentAPI } from '../api/client';

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

const SubscriberContentViewPage: React.FC = () => {
  const { id: contentId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [content, setContent] = useState<SubscriberContent | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchContent = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
      //   // Simulate API call
      //   await new Promise(resolve => setTimeout(resolve, 500));
      //
      //   const id = parseInt(contentId || '0', 10);
      //   const foundContent = MOCK_CONTENTS.find(c => c.id === id);
      //
      //   if (!foundContent) {
      //     throw new Error("Content not found");
      //   }
      //
      //   setContent(foundContent);

        // Actual API implementation (commented out)
        const subscribedContents = await SubscriberAPI.listSubscribedContents();
        const foundContent = subscribedContents.find(c => `${c.id}` === contentId);

        if (!foundContent) {
          throw new Error("Content not found or you don't have access to it");
        }

        setContent(foundContent);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An unknown error occurred");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchContent();
  }, [contentId]);

  const handleBack = () => {
    navigate('/dashboard');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
        <NavBar/>
        <div className='h-16'/>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error || !content) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
        <NavBar/>
        <div className='h-16'/>
        <div className="w-full max-w-md">
          <ErrorState 
            message={error || "Content not found"}
            onRetry={() => navigate('/dashboard')}
          />
        </div>
      </div>
    );
  }

  return <SubscriberContentView content={content} onBack={handleBack} />;
};

export default SubscriberContentViewPage;
import React from 'react';
import { motion } from 'framer-motion';

interface AssistantAvatarProps {
  isAnimating?: boolean;
}

const AssistantAvatar: React.FC<AssistantAvatarProps> = ({ isAnimating = false }) => {
  return (
    <motion.div
      className="relative"
      animate={isAnimating ? { scale: [1, 1.05, 1] } : {}}
      transition={{ repeat: Infinity, duration: 2 }}
    >
      <div className="w-24 h-24 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center shadow-md overflow-hidden">
        <img 
          src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=200&q=80" 
          alt="AI Assistant"
          className="w-full h-full object-cover"
        />
      </div>
      
      {isAnimating && (
        <motion.div
          className="absolute -inset-1 rounded-full border-2 border-primary-400 dark:border-primary-500"
          initial={{ opacity: 0.5, scale: 0.85 }}
          animate={{ opacity: 0, scale: 1.2 }}
          transition={{ repeat: Infinity, duration: 1.5 }}
        />
      )}
    </motion.div>
  );
};

export default AssistantAvatar;
import React from 'react';
import { motion } from 'framer-motion';
import sadtaker from '../../assets/sadtalker.mp4';
import VideoPlayer from "@/components/common/VideoPlayer.tsx";

interface AssistantAvatarProps {
  isAnimating?: boolean;
}

const AssistantAvatar: React.FC<AssistantAvatarProps> = ({ isAnimating = false }) => {
  return (
    <div className="relative">
      <div className="w-48 h-48 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center shadow-md overflow-hidden">
        <VideoPlayer
          isPlaying={isAnimating}
          loop={true}
          muted={true}
          playsInline={true}
          src={sadtaker}
          className="w-full h-full object-cover"
        />
      </div>

      {isAnimating && (
        <>
          <motion.div
            className="absolute inset-0 rounded-full border-2 border-primary-400 dark:border-primary-500"
            initial={{ opacity: 0.6 }}
            animate={{ opacity: 0, scale: 1.2 }}
            transition={{
              repeat: Infinity,
              duration: 2,
              ease: "linear"
            }}
          />
          <motion.div
            className="absolute inset-0 rounded-full border-2 border-primary-400 dark:border-primary-500"
            initial={{ opacity: 0.6 }}
            animate={{ opacity: 0, scale: 1.2 }}
            transition={{
              repeat: Infinity,
              duration: 2,
              ease: "linear",
              delay: 0.67
            }}
          />
          <motion.div
            className="absolute inset-0 rounded-full border-2 border-primary-400 dark:border-primary-500"
            initial={{ opacity: 0.6 }}
            animate={{ opacity: 0, scale: 1.2 }}
            transition={{
              repeat: Infinity,
              duration: 2,
              ease: "linear",
              delay: 1.33
            }}
          />
        </>
      )}
    </div>
  );
};

export default AssistantAvatar;
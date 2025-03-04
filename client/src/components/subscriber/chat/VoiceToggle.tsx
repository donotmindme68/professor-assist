import React from 'react';
import { motion } from 'framer-motion';
import { Volume2, VolumeX } from 'lucide-react';

interface VoiceToggleProps {
  enabled: boolean;
  onToggle: () => void;
}

const VoiceToggle: React.FC<VoiceToggleProps> = ({ enabled, onToggle }) => {
  return (
    <div className="flex justify-end mb-2">
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={onToggle}
        className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        aria-label={enabled ? "Disable voice" : "Enable voice"}
      >
        {enabled ? (
          <Volume2 className="w-5 h-5 text-primary-600 dark:text-primary-400" />
        ) : (
          <VolumeX className="w-5 h-5 text-gray-400 dark:text-gray-500" />
        )}
      </motion.button>
    </div>
  );
};

export default VoiceToggle;
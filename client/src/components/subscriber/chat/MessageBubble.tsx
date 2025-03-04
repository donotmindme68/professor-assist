import React from 'react';
import { motion } from 'framer-motion';
import { Loader, RefreshCw } from 'lucide-react';
import { Message } from '../../../types';
import AnimatedText from './AnimatedText';
import CodeBlock from './CodeBlock';
import StreamingIndicator from './StreamingIndicator';
import { parseMessage } from '../../../utils/messageParser';

interface MessageBubbleProps {
  message: Message;
  index: number;
  isStreaming: boolean;
  isLastMessage: boolean;
  onAnimationComplete: (index: number) => void;
  onRetry?: () => void;
}

// Helper function to combine class names conditionally
const cn = (...classes: (string | boolean | undefined)[]) => {
  return classes.filter(Boolean).join(' ');
};

const MessageBubble: React.FC<MessageBubbleProps> = ({
  message,
  index,
  isStreaming,
  isLastMessage,
  onAnimationComplete,
  onRetry
}) => {
  // Check if this is the last assistant message and we're still streaming
  const isAnimating = isStreaming && 
                     message.role === 'assistant' && 
                     isLastMessage;

  const renderMessageContent = () => {
    if (isAnimating) {
      return message.content ? (
        <AnimatedText
          text={message.content}
          onComplete={() => onAnimationComplete(index)}
        />
      ) : (
        <StreamingIndicator />
      );
    }

    const parts = parseMessage(message.content);

    return parts.map((part, partIndex) => {
      if (part.type === 'code') {
        const codeContent = part.content as { language?: string; code: string };
        return (
          <CodeBlock
            key={partIndex}
            code={codeContent.code}
            language={codeContent.language}
          />
        );
      }
      return <p key={partIndex} className="leading-relaxed">{part.content}</p>;
    });
  };

  // Determine border radius classes based on message role
  const borderRadiusClasses = message.role === 'user'
    ? 'rounded-tl-lg rounded-tr-lg rounded-bl-lg rounded-br-none' // User message: sharp bottom right
    : 'rounded-tl-lg rounded-tr-lg rounded-bl-none rounded-br-lg'; // Assistant message: sharp bottom left

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className={cn(
        'flex flex-col gap-2 p-4 mb-4 shadow-sm',
        borderRadiusClasses,
        message.role === 'user'
          ? 'bg-primary-600 dark:bg-primary-700 text-white ml-12 mr-2 float-right clear-both'
          : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 ml-2 mr-12 float-left clear-both',
        isStreaming && isLastMessage && message.role === 'assistant'
          ? 'border-l-4 border-primary-500 dark:border-primary-400'
          : ''
      )}
    >
      {renderMessageContent()}
      
      {/* Show streaming indicator for the last assistant message */}
      {isStreaming && isLastMessage && message.role === 'assistant' && (
        <div className="mt-2 text-xs text-gray-500 dark:text-gray-400 flex items-center">
          <Loader size={12} className="animate-spin mr-1" />
          Generating...
        </div>
      )}

      {/* Show error message and retry button if there's an error */}
      {message.error && (
        <div className="mt-2 bg-red-100 dark:bg-red-900/30 p-2 rounded border border-red-200 dark:border-red-800">
          <p className="text-xs text-red-600 dark:text-red-400 mb-1">{message.error}</p>
          {onRetry && (
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={onRetry}
              className="flex items-center text-xs px-2 py-1 bg-red-600 hover:bg-red-700 text-white rounded"
            >
              <RefreshCw size={12} className="mr-1" />
              Regenerate
            </motion.button>
          )}
        </div>
      )}
    </motion.div>
  );
};

export default MessageBubble;
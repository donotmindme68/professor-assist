import React, { useRef, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import { Message } from '../../../types';
import MessageBubble from './MessageBubble';

interface MessageListProps {
  messages: Message[];
  isStreaming: boolean;
  onAnimationComplete: (index: number) => void;
  onRetry: () => void;
}

const MessageList: React.FC<MessageListProps> = ({
  messages,
  isStreaming,
  onAnimationComplete,
  onRetry
}) => {
  const bottomRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isStreaming]);

  return (
    <div 
      ref={containerRef}
      className="flex-grow overflow-y-auto mb-4 pr-2"
      style={{ 
        height: 'calc(100% - 140px)',
        maxHeight: 'calc(100% - 140px)'
      }}
    >
      <AnimatePresence mode="popLayout">
        {messages.map((msg, i) => (
          <MessageBubble
            key={i}
            message={msg}
            index={i}
            isStreaming={isStreaming}
            isLastMessage={i === messages.length - 1}
            onAnimationComplete={onAnimationComplete}
            onRetry={i === messages.length - 1 && msg.error ? onRetry : undefined}
          />
        ))}
      </AnimatePresence>
      <div ref={bottomRef} className="clear-both" />
    </div>
  );
};

export default MessageList;
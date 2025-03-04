import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronDown, ChevronUp, Send, Square, Loader } from 'lucide-react';

interface MessageInputProps {
  onSendMessage: (message: string) => void;
  onInterrupt: () => void;
  isStreaming: boolean;
  isConnecting: boolean;
}

// Helper function to combine class names conditionally
const cn = (...classes: (string | boolean | undefined)[]) => {
  return classes.filter(Boolean).join(' ');
};

const MessageInput: React.FC<MessageInputProps> = ({
  onSendMessage,
  onInterrupt,
  isStreaming,
  isConnecting
}) => {
  const [input, setInput] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim() || isStreaming || isConnecting) return;

    onSendMessage(input.trim());
    setInput('');
  };

  return (
    <div className="mt-auto">
      <form onSubmit={handleSubmit} className="relative">
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your message..."
              className={cn(
                'w-full p-3 pr-24 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100',
                'placeholder-gray-500 dark:placeholder-gray-400',
                'resize-none focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400',
                'transition-all duration-200',
                isExpanded ? 'min-h-[150px]' : 'min-h-[50px]'
              )}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit();
                }
              }}
              disabled={isStreaming || isConnecting}
            />
            <div className="absolute right-2 top-2 flex items-center gap-1">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                type="button"
                onClick={() => setIsExpanded(!isExpanded)}
                className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                {isExpanded ? (
                  <ChevronDown className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                ) : (
                  <ChevronUp className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                )}
              </motion.button>
              
              {isStreaming ? (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  type="button"
                  onClick={onInterrupt}
                  className="p-2 rounded-full bg-red-600 hover:bg-red-700 text-white transition-colors"
                >
                  <Square className="w-4 h-4" />
                </motion.button>
              ) : (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  type="submit"
                  disabled={isConnecting || !input.trim()}
                  className={cn(
                    'p-2 rounded-full bg-primary-600 dark:bg-primary-500 text-white',
                    'disabled:opacity-50 disabled:cursor-not-allowed',
                    'transition-colors hover:bg-primary-700 dark:hover:bg-primary-600'
                  )}
                >
                  {isConnecting ? (
                    <Loader className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                </motion.button>
              )}
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default MessageInput;
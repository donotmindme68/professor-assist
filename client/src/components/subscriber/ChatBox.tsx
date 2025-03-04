import React, { useEffect } from 'react';
import { Message } from '../../types';
import VoiceToggle from './chat/VoiceToggle';
import MessageList from './chat/MessageList';
import MessageInput from './chat/MessageInput';
import ConnectionError from './chat/ConnectionError';

interface ChatBoxProps {
  messages: Message[];
  onUserMessage: (message: string) => void;
  onUserInterrupt: () => void;
  onUserRetry: () => void;
  isStreaming: boolean;
  isConnecting: boolean;
  connectionError?: string;
  retryConnect?: () => void;
  voiceEnabled?: boolean;
  onVoiceToggle?: () => void;
}

const ChatBox: React.FC<ChatBoxProps> = ({
  messages,
  onUserMessage,
  onUserInterrupt,
  onUserRetry,
  isStreaming = false,
  isConnecting = false,
  connectionError,
  retryConnect,
  voiceEnabled = false,
  onVoiceToggle
}) => {
  const synth = window.speechSynthesis;

  // Stop speech synthesis when voice is disabled
  useEffect(() => {
    if (!voiceEnabled) {
      synth.cancel();
    }
  }, [voiceEnabled]);

  // Speak message using browser's speech synthesis
  const speakMessage = (text: string) => {
    if (voiceEnabled) {
      const utterance = new SpeechSynthesisUtterance(text);
      synth.speak(utterance);
    }
  };

  // Handle animation completion
  const handleAnimationComplete = (index: number) => {
    if (voiceEnabled && messages[index].role === 'assistant') {
      speakMessage(messages[index].content);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Connection error message */}
      {connectionError && (
        <ConnectionError 
          message={connectionError} 
          onRetry={retryConnect} 
        />
      )}

      {/* Voice toggle button */}
      <VoiceToggle 
        enabled={voiceEnabled} 
        onToggle={onVoiceToggle || (() => {})} 
      />

      {/* Messages container */}
      <MessageList 
        messages={messages}
        isStreaming={isStreaming}
        onAnimationComplete={handleAnimationComplete}
        onRetry={onUserRetry}
      />

      {/* Input area */}
      <MessageInput 
        onSendMessage={onUserMessage}
        onInterrupt={onUserInterrupt}
        isStreaming={isStreaming}
        isConnecting={isConnecting}
      />
    </div>
  );
};

export default ChatBox;
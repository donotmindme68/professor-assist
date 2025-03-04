import {useEffect, useRef, useState} from 'react';
import {AnimatePresence, motion} from 'framer-motion';
import {ChevronDown, ChevronUp, Paperclip, Send, Volume2, VolumeX} from 'lucide-react';
import {FileUpload} from './file-upload';
import {ProfessorAvatar} from './professor-avatar';
import {AnimatedText} from './animated-text';
import {cn} from '@/utils';
import {CodeBlock} from './code-block';
import {Poll} from './poll';
import {parseMessage} from '../utils/message-parser.ts';
import {ThreadAPI} from "@/api";
import {Message} from "types";

interface Props {
  messages: Message[];
  onUserMessage: (message: string) => void;
  onUserInterrupt: () => void;
  onUserRetry: () => void;
  isStreaming: boolean;
  isConnecting: boolean;
  connectionError?: string;
  retryConnect?: () => void;
  onOpen?: () => void;
}

export function ChatBox({
                          messages,
                          onUserMessage,
                          onUserInterrupt,
                          onUserRetry,
                          isStreaming = false,
                          isConnecting = false,
                          connectionError,
                          retryConnect,
                          onOpen,
                        }: Props) {
  const [input, setInput] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isThreadSwitcherOpen, setIsThreadSwitcherOpen] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const synth = window.speechSynthesis;
  //
  // const createThread = async () => {
  //   return {id: 1} //todo:fix
  //   try {
  //     const response = await fetch('/api/threads', {
  //       method: 'POST',
  //       headers: {
  //         'Content-Type': 'application/json',
  //       },
  //       body: JSON.stringify({
  //         userId: 1,
  //         subjectType: 'General',
  //         professorId: Math.floor(Math.random() * 3),
  //       }),
  //     });
  //     return await response.json();
  //   } catch (error) {
  //     console.error('Failed to create thread:', error);
  //     throw error;
  //   }
  // };

  useEffect(() => {
    bottomRef.current?.scrollIntoView({behavior: 'smooth'});
  }, [messages]);

  useEffect(() => {
    if (!voiceEnabled) {
      synth.cancel();
    }
  }, [voiceEnabled]);

  const speakMessage = (text: string) => {
    if (voiceEnabled) {
      const utterance = new SpeechSynthesisUtterance(text);
      synth.speak(utterance);
    }
  };

  const handleThreadSelect = async (newThreadId: number) => {
    return //todo: fix
    if (newThreadId === threadId) return;

    try {
      const response = await fetch(`/api/threads/${newThreadId}/messages`);
      const data = await response.json();
      setThreadId(newThreadId);
      setMessages(data.messages || []);
    } catch (error) {
      console.error('Failed to fetch thread messages:', error);
    }
  };

  const handleSubmit = async () => {
    if (!input.trim() || !threadId) return;

    try {
      setIsLoading(true);

      const userMessage = {role: 'user', content: input} as Message;
      setMessages(prev => [...prev, userMessage]);
      setInput('');

      const chatHistory = [...messages, userMessage];

      const response = await ThreadAPI.create(
        123,
        [...chatHistory, {role: 'user', content: input}],
        {},
        true
      );

      const {assistantResponse} = response;

      if (assistantResponse) {
        setMessages(prev => [
          ...prev,
          {
            role: 'assistant',
            content: assistantResponse,
            isAnimating: true,
          },
        ]);
        speakMessage(assistantResponse);

        setThreads(prev =>
          prev.map(thread =>
            thread.id === threadId
              ? {...thread, lastMessage: assistantResponse}
              : thread
          )
        );
      }
    } catch (error) {
      console.error('Failed to append to thread:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFilesSelected = (newFiles: File[]) => {
    setFiles(prev => [...prev, ...newFiles]);
  };

  const handleAnimationComplete = (index: number) => {
    setMessages(prev =>
      prev.map((msg, i) => (i === index ? {...msg, isAnimating: false} : msg))
    );
  };

  const renderMessageContent = (message: Message) => {
    if (message.isAnimating) {
      return (
        <AnimatedText
          text={message.content}
          onComplete={() => handleAnimationComplete(messages.indexOf(message))}
        />
      );
    }

    const parts = parseMessage(message.content);

    return parts.map((part, index) => {
      switch (part.type) {
        case 'code':
          const codeContent = part.content as { language?: string; code: string };
          return (
            <CodeBlock
              key={index}
              code={codeContent.code}
              language={codeContent.language}
            />
          );
        case 'poll':
          const pollContent = part.content as {
            question: string;
            options: { text: string; votes: number }[];
          };
          return (
            <Poll key={index} question={pollContent.question} options={pollContent.options}/>
          );
        default:
          return <p key={index} className="leading-relaxed">{part.content}</p>;
      }
    });
  };

  const currentThread = threads.find(t => t.id === threadId);

  return (
    <motion.div
      initial={{opacity: 0, y: 20}}
      animate={{opacity: 1, y: 0}}
      transition={{duration: 0.5}}
      className="flex flex-col gap-6 max-w-4xl w-full"
    >
      <div className="flex justify-center">
        <ProfessorAvatar
          isAnimating={isLoading || messages.some(m => m.isAnimating)}
          onClick={() => false && setIsThreadSwitcherOpen(true)} //todo: fix
          professorId={currentThread?.professorId}
        />
      </div>

      <ThreadSwitcher
        open={isThreadSwitcherOpen}
        onOpenChange={() => false && setIsThreadSwitcherOpen} //todo: fix
        threads={threads}
        currentThreadId={threadId}
        onThreadSelect={handleThreadSelect}
      />

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4">
        <div className="flex justify-end mb-2">
          <motion.button
            whileHover={{scale: 1.05}}
            whileTap={{scale: 0.95}}
            onClick={() => setVoiceEnabled(!voiceEnabled)}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            {voiceEnabled ? (
              <Volume2 className="w-5 h-5 text-blue-600 dark:text-blue-400"/>
            ) : (
              <VolumeX className="w-5 h-5 text-gray-400 dark:text-gray-500"/>
            )}
          </motion.button>
        </div>

        <div className="h-[400px] overflow-y-auto mb-4 scroll-smooth">
          <AnimatePresence mode="popLayout">
            {messages.map((msg, i) => (
              <motion.div
                key={i}
                initial={{opacity: 0, y: 20}}
                animate={{opacity: 1, y: 0}}
                exit={{opacity: 0, y: -20}}
                className={cn(
                  'flex flex-col gap-2 p-4 rounded-2xl mb-4 shadow-sm relative',
                  msg.role === 'user'
                    ? 'bg-blue-600 dark:bg-blue-700 text-white self-end ml-12 mr-2 rounded-br-sm'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 self-start ml-2 mr-12 rounded-bl-sm'
                )}
              >
                <div
                  className={cn(
                    'absolute bottom-0 w-4 h-4',
                    msg.role === 'user'
                      ? 'right-0 transform translate-y-1/2 bg-blue-600 dark:bg-blue-700 clip-triangle-right'
                      : 'left-0 transform translate-y-1/2 bg-gray-100 dark:bg-gray-700 clip-triangle-left'
                  )}
                />

                {renderMessageContent(msg)}

                {msg.citations && (
                  <div className="mt-2 text-sm opacity-80">
                    <p className="font-semibold">Sources:</p>
                    <ul className="list-disc list-inside">
                      {msg.citations.map((citation, i) => (
                        <li key={i}>
                          <a
                            href={citation}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:underline"
                          >
                            {citation}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
          <div ref={bottomRef}/>
        </div>

        <div className="relative">
          <div className="flex gap-2">
            <div className="flex-1 relative">
                            <textarea
                              value={input}
                              onChange={e => setInput(e.target.value)}
                              placeholder="Ask your question..."
                              className={cn(
                                'w-full p-3 pr-24 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100',
                                'placeholder-gray-500 dark:placeholder-gray-400',
                                'resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400',
                                'transition-all duration-200',
                                isExpanded ? 'min-h-[150px]' : 'min-h-[50px]'
                              )}
                            />
              <div className="absolute right-2 top-2 flex items-center gap-1">
                <FileUpload onFilesSelected={handleFilesSelected}>
                  <motion.button
                    whileHover={{scale: 1.05}}
                    whileTap={{scale: 0.95}}
                    className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                  >
                    <Paperclip className="w-4 h-4 text-gray-500 dark:text-gray-400"/>
                  </motion.button>
                </FileUpload>
                <motion.button
                  whileHover={{scale: 1.05}}
                  whileTap={{scale: 0.95}}
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  {isExpanded ? (
                    <ChevronDown className="w-4 h-4 text-gray-500 dark:text-gray-400"/>
                  ) : (
                    <ChevronUp className="w-4 h-4 text-gray-500 dark:text-gray-400"/>
                  )}
                </motion.button>
                <motion.button
                  whileHover={{scale: 1.05}}
                  whileTap={{scale: 0.95}}
                  onClick={handleSubmit}
                  disabled={isLoading || !input.trim()}
                  className={cn(
                    'p-2 rounded-full bg-blue-600 dark:bg-blue-500 text-white',
                    'disabled:opacity-50 disabled:cursor-not-allowed',
                    'transition-colors hover:bg-blue-700 dark:hover:bg-blue-600'
                  )}
                >
                  <Send className="w-4 h-4"/>
                </motion.button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

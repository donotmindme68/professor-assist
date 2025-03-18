import React, {useState, useEffect, useMemo, useRef, useCallback} from 'react';
import {motion} from 'framer-motion';
import {ArrowLeft, MessageSquare} from 'lucide-react';
import {SubscriberContent, Thread, Message} from '../../types';
import ThreadSidebar from './ThreadSidebar';
import ChatBox from './ChatBox';
import ErrorState from '../common/ErrorState';
import {NavBar} from "@/components/NavBar.tsx";
import {ThreadAPI} from "@/api";
import AudioPlayer from "@/AudioPlayer.ts";

// import { ThreadAPI } from '../../api/client';

interface SubscriberContentViewProps {
  content: SubscriberContent;
  onBack: () => void;
}

const SubscriberContentView: React.FC<SubscriberContentViewProps> = ({content, onBack}) => {
  const [threads, setThreads] = useState<Thread[]>([]);
  const [activeThreadId, setActiveThreadId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [isStreaming, setIsStreaming] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionError, setConnectionError] = useState<string | undefined>(undefined);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [showNewThreadForm, setShowNewThreadForm] = useState(false);

  const onAudioStart = useCallback(() => {
    console.log('Audio start')
    setIsSpeaking(true)
  }, [])
  const onAudioEnd = useCallback((interrupted: boolean) => {
    console.log('Audio end')
    setIsSpeaking(false)
    setIsStreaming(false)
  }, [])
  const audioPlayer = useMemo(() => new AudioPlayer(onAudioStart, onAudioEnd), [onAudioStart, onAudioEnd])
  const playAudio = useCallback((data: string) => {
    if (voiceEnabled) audioPlayer.play(data, 'audio/wav');
    else setIsStreaming(false)
  }, [voiceEnabled])


  // Chat state
  const messages = useMemo(() => {
      const thread = threads.find(t => t.id === activeThreadId)
      return thread?.messages ?? []
    },
    [threads, activeThreadId])

  const setMessages = (messages: Message[]) => {
    setThreads(threads.map(t => t.id === activeThreadId ? {...t, messages} : t))
  }

  // Mock data for threads
  const mockThreads: Thread[] = [
    {
      id: 1,
      name: "Getting Started",
      subscriberId: 1001,
      contentId: content.id,
      messages: [
        {role: 'user', content: 'How do I get started with this content?'},
        {
          role: 'assistant',
          content: 'Welcome! This content covers the basics of machine learning. You can start by exploring the first module on data preprocessing.'
        }
      ],
      metaInfo: {},
      createdAt: "2023-05-16T08:35:00Z"
    },
    {
      id: 2,
      name: "Advanced Topics",
      subscriberId: 1001,
      contentId: content.id,
      messages: [
        {role: 'user', content: 'Can you explain neural networks in detail?'},
        {
          role: 'assistant',
          content: 'Neural networks are computational models inspired by the human brain. They consist of layers of interconnected nodes or "neurons" that process information.'
        }
      ],
      metaInfo: {},
      createdAt: "2023-05-18T14:22:00Z"
    }
  ];

  // Fetch threads
  useEffect(() => {
    const fetchThreads = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // Simulate API call
        // await new Promise(resolve => setTimeout(resolve, 800));
        //
        // // Simulate random error (1 in 5 chance)
        // if (Math.random() < 0.2) {
        //   throw new Error("Failed to load threads. Network error.");
        // }
        //
        // setThreads(mockThreads);
        //
        // // Set the first thread as active if there are any threads
        // if (mockThreads.length > 0 && !activeThreadId) {
        //   setActiveThreadId(mockThreads[0].id);
        // }

        // Actual API implementation (commented out)
        const fetchedThreads = await ThreadAPI.getByContent(content.id);
        setThreads(fetchedThreads);
        if (fetchedThreads.length > 0 && !activeThreadId) {
          setActiveThreadId(fetchedThreads[0].id);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "An unknown error occurred");
      } finally {
        setIsLoading(false);
      }
    };

    fetchThreads();
  }, [content.id]);

  // Handle thread selection
  const handleThreadSelect = (threadId: number) => {
    setActiveThreadId(threadId);
  };

  // Create new thread
  const handleCreateThread = (name: string) => {
    // const newThread: Thread = {
    //   id: Math.floor(Math.random() * 1000) + 100,
    //   name,
    //   subscriberId: 1001, // Assuming current user id
    //   contentId: content.id,
    //   messages: [],
    //   metaInfo: {},
    //   createdAt: new Date().toISOString()
    // };
    //
    // setThreads([newThread, ...threads]);
    // setActiveThreadId(newThread.id);

    // Actual API implementation (commented out)
    const createThread = async () => {
      try {
        const newThread = await ThreadAPI.create({
          contentId: content.id,
          name: name,
          messages: [],
          metaInfo: {}
        });
        setThreads(prev => [newThread, ...prev]);
        setActiveThreadId(newThread.id);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to create thread");
      }
    };
    createThread();
  };

  // Chat handlers
  const handleUserMessage = (message: string) => {
    const newMessage: Message = {role: 'user', content: message};
    setMessages([...messages, newMessage]);
    setIsStreaming(true);

    // Simulate response after delay
    // setTimeout(() => {
    //   const responseMessage: Message = {
    //     role: 'assistant',
    //     content: `This is a simulated response to: "${message}"`
    //   };
    //   setMessages(prev => [...prev, responseMessage]);
    //   setIsStreaming(false);
    // }, 2000);

    // Actual API implementation (commented out)
    if (!activeThreadId) return;

    const sendMessage = async () => {
      try {
        setIsStreaming(true);
        const updatedMessages = [...messages, newMessage].map(m => ({role: m.role, content: m.content}));

        const response = await ThreadAPI.update({
          threadId: activeThreadId,
          messages: updatedMessages,
          append: false,
          generateCompletion: true,
          includeSpeech: voiceEnabled
        });

        setMessages(response.messages)
        const data = response.messages[response.messages.length - 1].audio?.data
        if (data) playAudio(data)
        else setIsStreaming(false)

        // if (response.assistantResponse) {
        //   const assistantMessage: Message = {
        //     role: 'assistant',
        //     content: response.assistantResponse
        //   };
        //   setMessages([...updatedMessages, assistantMessage]);
        // } else {
        //   setMessages(updatedMessages);
        // }
      } catch (err) {
        const errorMessage: Message = {
          role: 'assistant',
          content: '',
          error: err instanceof Error ? err.message : "Failed to get response"
        };
        setMessages([...messages, newMessage, errorMessage]);
        setIsStreaming(false); //todo: check well ...
      } finally {
        // setIsStreaming(false); //todo: check well
      }
    };
    sendMessage();
  };

  const handleUserInterrupt = () => {
    audioPlayer.interrupt()
    // In a real implementation, you would need to cancel the API request
  };

  const handleUserRetry = () => {
    if (messages.length > 0) {
      // Remove the last assistant message if it exists
      const lastMessage = messages[messages.length - 1];
      if (lastMessage.role === 'assistant') {
        setMessages(messages.slice(0, -1));
      }

      // Simulate new response
      // setIsStreaming(true);
      // setTimeout(() => {
      //   const responseMessage: Message = {
      //     role: 'assistant',
      //     content: 'This is a new response after retry.'
      //   };
      //   setMessages(prev => [...prev, responseMessage]);
      //   setIsStreaming(false);
      // }, 1500);

      // Actual API implementation (commented out)
      if (!activeThreadId) return;

      const regenerateResponse = async () => {
        try {
          setIsStreaming(true);
          // Get the last user message
          const userMessages = messages.filter(m => m.role === 'user');
          if (userMessages.length === 0) return;

          const lastUserMessage = userMessages[userMessages.length - 1];
          const messagesWithoutLastAssistant = messages.filter(
            (_, index) => index !== messages.length - 1
          );


          const response = await ThreadAPI.update({
            threadId: activeThreadId,
            messages: messagesWithoutLastAssistant.map(m => ({role: m.role, content: m.content, audio: m.audio? {id: m.audio.id}: undefined})),
            append: false,
            generateCompletion: true,
            includeSpeech: voiceEnabled
          });
          const data = response.messages[response.messages.length - 1].audio?.data
          if (data) playAudio(data)
          else setIsStreaming(false)

          // if (response.assistantResponse) {
          //   const assistantMessage: Message = {
          //     role: 'assistant',
          //     content: response.assistantResponse
          //   };
          //   setMessages([...messagesWithoutLastAssistant, assistantMessage]);
          // }
          setMessages(response.messages)
        } catch (err) {
          const errorMessage: Message = {
            role: 'assistant',
            content: '',
            error: err instanceof Error ? err.message : "Failed to regenerate response"
          };
          setMessages([...messages.slice(0, -1), errorMessage]);
          setIsStreaming(false)
        } finally {
          // setIsStreaming(false);
        }
      };
      regenerateResponse();
    }
  };

  const retryConnect = () => {
    setIsConnecting(true);
    setConnectionError(undefined);

    // Simulate connection retry
    setTimeout(() => {
      setIsConnecting(false);
      // 50% chance of success
      if (Math.random() < 0.5) {
        setConnectionError("Connection failed. Please check your network and try again.");
      }
    }, 1500);
  };

  const handleRetryLoadThreads = () => {
    setIsLoading(true);
    setError(null);
    // Simulate retry
    // setTimeout(() => {
    //   setThreads(mockThreads);
    //   if (mockThreads.length > 0) {
    //     setActiveThreadId(mockThreads[0].id);
    //   }
    //   setIsLoading(false);
    // }, 1000);

    // Actual API implementation (commented out)
    const fetchThreads = async () => {
      try {
        const fetchedThreads = await ThreadAPI.getByContent(content.id);
        setThreads(fetchedThreads);
        if (fetchedThreads.length > 0) {
          setActiveThreadId(fetchedThreads[0].id);
        }
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load threads");
      } finally {
        setIsLoading(false);
      }
    };
    fetchThreads();
  };

  // When voice is enabled, ensure sidebar is not collapsed
  useEffect(() => {
    if (voiceEnabled && sidebarCollapsed) {
      setSidebarCollapsed(false);
    }
  }, [voiceEnabled]);

  const activeThread = threads.find(thread => thread.id === activeThreadId);

  // Sidebar animation variants
  const sidebarContainerVariants = {
    expanded: {
      width: 320,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 30
      }
    },
    collapsed: {
      width: 48,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 30
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      {/* Header */}
      <NavBar/>
      <div className='h-16'/>
      <header
        className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 transition-colors duration-200">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <motion.button
                whileTap={{scale: 0.95}}
                onClick={onBack}
                className="mr-3 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors duration-200"
              >
                <ArrowLeft size={20}/>
              </motion.button>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white transition-colors duration-200">
                {content.name}
              </h1>
            </div>
          </div>
          {content.description && (
            <p className="mt-1 ml-8 text-gray-600 dark:text-gray-300 text-sm transition-colors duration-200">
              {content.description}
            </p>
          )}
        </div>
      </header>

      {/* Main content */}
      <main className="container mx-auto px-4 py-4">
        <div className="flex h-[calc(100vh-140px)]">
          <motion.div
            variants={sidebarContainerVariants}
            initial={false}
            animate={sidebarCollapsed && !voiceEnabled ? "collapsed" : "expanded"}
            className="flex-shrink-0 overflow-hidden"
          >
            <ThreadSidebar
              showNewThreadForm={showNewThreadForm}
              setShowNewThreadForm={setShowNewThreadForm}
              threads={threads}
              deleteThread={(threadId) => {
                const filtered = threads.filter(t => t.id !== threadId)
                setThreads(filtered);
                if (filtered.length > 0 && activeThreadId === threadId) {
                  setActiveThreadId(filtered[0].id);
                }
              }}
              activeThreadId={activeThreadId}
              isLoading={isLoading}
              error={error}
              sidebarCollapsed={sidebarCollapsed}
              voiceEnabled={voiceEnabled}
              onThreadSelect={handleThreadSelect}
              onCreateThread={handleCreateThread}
              onRetry={handleRetryLoadThreads}
              onToggleSidebar={(collapsed) => setSidebarCollapsed(collapsed)}
              isSpeaking={isSpeaking}
            />
          </motion.div>

          {/* Chat area */}
          <div
            className="flex-grow bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 transition-colors duration-200">
            {activeThread ? (
              <div className="h-full flex flex-col">
                <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 transition-colors duration-200">
                  <h3 className="font-medium text-lg text-gray-900 dark:text-white transition-colors duration-200">
                    {activeThread.name}
                  </h3>
                </div>

                <div className="flex-grow p-4 h-[calc(100%-56px)] overflow-hidden">
                  <ChatBox
                    messages={messages}
                    onUserMessage={handleUserMessage}
                    onUserInterrupt={handleUserInterrupt}
                    onUserRetry={handleUserRetry}
                    isStreaming={isStreaming}
                    isConnecting={isConnecting}
                    connectionError={connectionError}
                    retryConnect={retryConnect}
                    voiceEnabled={voiceEnabled}
                    onVoiceToggle={() => setVoiceEnabled(!voiceEnabled)}
                  />
                </div>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center p-6">
                <MessageSquare size={48}
                               className="text-gray-300 dark:text-gray-600 transition-colors duration-200 mb-3"/>
                <h3
                  className="text-xl font-medium text-gray-700 dark:text-gray-300 transition-colors duration-200 mb-2">
                  No Active Thread
                </h3>
                <p className="text-gray-500 dark:text-gray-400 transition-colors duration-200 max-w-md mb-6">
                  Select an existing thread from the sidebar or create a new one to start a conversation.
                </p>
                <motion.button
                  whileTap={{scale: 0.95}}
                  onClick={() => {
                    setSidebarCollapsed(false);
                    setShowNewThreadForm(true)
                  }}
                  className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors duration-200"
                >
                  Create New Thread
                </motion.button>
              </div>
            )}
          </div>
        </div>
        <audio ref={(el) => el && audioPlayer.setAudioElement(el)} className={'hidden'}></audio>
      </main>
    </div>
  );
};

export default SubscriberContentView;
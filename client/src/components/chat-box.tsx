import {useEffect, useRef, useState} from 'react';
import {motion, AnimatePresence} from 'framer-motion';
import {Send, Paperclip, Volume2, VolumeX, ChevronDown, ChevronUp} from 'lucide-react';
import {FileUpload} from './file-upload';
import {ProfessorAvatar} from './professor-avatar';
import {AnimatedText} from './animated-text';
import {cn} from '../lib/utils';

interface Message {
    role: 'user' | 'assistant';
    content: string;
    citations?: string[];
    isAnimating?: boolean;
}

export function ChatBox() {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [files, setFiles] = useState<File[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [voiceEnabled, setVoiceEnabled] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);
    const [threadId, setThreadId] = useState<number | null>(null);
    const bottomRef = useRef<HTMLDivElement>(null);
    const synth = window.speechSynthesis;

    useEffect(() => {
        // Create a new thread when the component mounts
        const createThread = async () => {
            try {
                const response = await fetch('/api/threads', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        userId: 1, // Replace with actual user ID
                        subjectType: 'General', // Replace with actual subject type
                    }),
                });
                const data = await response.json();
                setThreadId(data.id);
            } catch (error) {
                console.error('Failed to create thread:', error);
            }
        };

        createThread();
    }, []);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({behavior: 'smooth'});
    }, [messages]);

    useEffect(() => {
        // Cancel any ongoing speech when voice is disabled
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

    const handleSubmit = async () => {
        if (!input.trim() || !threadId) return;

        try {
            setIsLoading(true);
            setMessages(prev => [...prev, {role: 'user', content: input}]);
            setInput('');

            // Append user message to the thread and optionally get AI response
            const response = await fetch(`/api/threads/${threadId}/messages`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    content: input,
                    role: 'user',
                    useOpenAI: true, // Toggle OpenAI integration
                }),
            });
            const {message, assistantResponse} = await response.json();

            if (assistantResponse) {
                setMessages(prev => [...prev, {
                    role: 'assistant',
                    content: assistantResponse,
                    isAnimating: true
                }]);
                speakMessage(assistantResponse);
            }

            setIsLoading(false);
        } catch (error) {
            console.error('Failed to append to thread:', error);
            setIsLoading(false);
        }
    };

    const handleFilesSelected = (newFiles: File[]) => {
        setFiles(prev => [...prev, ...newFiles]);
    };

    const handleAnimationComplete = (index: number) => {
        setMessages(prev => prev.map((msg, i) =>
            i === index ? {...msg, isAnimating: false} : msg
        ));
    };

    return (
        <motion.div
            initial={{opacity: 0, y: 20}}
            animate={{opacity: 1, y: 0}}
            transition={{duration: 0.5}}
            className="flex flex-col gap-6 max-w-4xl mx-auto"
        >
            <div className="flex justify-center">
                <ProfessorAvatar isAnimating={isLoading || messages.some(m => m.isAnimating)}/>
            </div>

            <div className="bg-card rounded-lg shadow-lg p-4">
                <div className="flex justify-end mb-2">
                    <motion.button
                        whileHover={{scale: 1.05}}
                        whileTap={{scale: 0.95}}
                        onClick={() => setVoiceEnabled(!voiceEnabled)}
                        className="p-2 rounded-full hover:bg-muted transition-colors"
                    >
                        {voiceEnabled ? (
                            <Volume2 className="w-5 h-5 text-primary"/>
                        ) : (
                            <VolumeX className="w-5 h-5 text-muted-foreground"/>
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
                                        ? 'bg-primary text-primary-foreground self-end ml-12 mr-2 rounded-br-sm'
                                        : 'bg-gradient-to-br from-card-foreground/5 to-card-foreground/10 backdrop-blur-sm self-start ml-2 mr-12 rounded-bl-sm'
                                )}
                            >
                                {/* Triangle for chat bubble */}
                                <div className={cn(
                                    'absolute bottom-0 w-4 h-4',
                                    msg.role === 'user'
                                        ? 'right-0 transform translate-y-1/2 bg-primary clip-triangle-right'
                                        : 'left-0 transform translate-y-1/2 bg-gradient-to-br from-card-foreground/5 to-card-foreground/10 clip-triangle-left'
                                )}
                                />

                                {msg.role === 'assistant' && msg.isAnimating ? (
                                    <AnimatedText
                                        text={msg.content}
                                        onComplete={() => handleAnimationComplete(i)}
                                    />
                                ) : (
                                    <p className="leading-relaxed">{msg.content}</p>
                                )}
                                {msg.citations && (
                                    <div className="mt-2 text-sm text-muted-foreground">
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
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask your question..."
                  className={cn(
                      "w-full p-3 pr-24 rounded-lg bg-muted resize-none focus:outline-none focus:ring-2 focus:ring-primary transition-all duration-200",
                      isExpanded ? "min-h-[150px]" : "min-h-[50px]"
                  )}
              />
                            <div className="absolute right-2 top-2 flex items-center gap-1">
                                <FileUpload onFilesSelected={handleFilesSelected}>
                                    <motion.button
                                        whileHover={{scale: 1.05}}
                                        whileTap={{scale: 0.95}}
                                        className="p-2 rounded-full hover:bg-background/50 transition-colors"
                                    >
                                        <Paperclip className="w-4 h-4 text-muted-foreground"/>
                                    </motion.button>
                                </FileUpload>
                                <motion.button
                                    whileHover={{scale: 1.05}}
                                    whileTap={{scale: 0.95}}
                                    onClick={() => setIsExpanded(!isExpanded)}
                                    className="p-2 rounded-full hover:bg-background/50 transition-colors"
                                >
                                    {isExpanded ? (
                                        <ChevronDown className="w-4 h-4 text-muted-foreground"/>
                                    ) : (
                                        <ChevronUp className="w-4 h-4 text-muted-foreground"/>
                                    )}
                                </motion.button>
                                <motion.button
                                    whileHover={{scale: 1.05}}
                                    whileTap={{scale: 0.95}}
                                    onClick={handleSubmit}
                                    disabled={isLoading || !input.trim()}
                                    className={cn(
                                        'p-2 rounded-full bg-primary text-primary-foreground',
                                        'disabled:opacity-50 disabled:cursor-not-allowed',
                                        'transition-colors hover:bg-primary/90'
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
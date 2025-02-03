import {useEffect, useRef, useState} from "react";
import {Card} from "./ui/card";
import {Textarea} from "./ui/textarea";
import {Button} from "./ui/button";
import {Send} from "lucide-react";
import {FileUpload} from "./file-upload";
import {ProfessorAvatar} from "./professor-avatar";
import {ScrollArea} from "./ui/scroll-area";
import {useToast} from "@/hooks/use-toast";
import {getAIResponse} from "@/lib/perplexity";
import {AnimatedText} from "./animated-text";


interface Message {
    role: "user" | "assistant";
    content: string;
    citations?: string[];
    isAnimating?: boolean;
}

export function ChatBox() {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState("");
    const [files, setFiles] = useState<File[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const {toast} = useToast();
    const bottomRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        bottomRef.current!.scrollIntoView({behavior: "smooth"});
    },[messages])
    const handleSubmit = async () => {
        if (!input.trim()) return;

        try {
            setIsLoading(true);
            setMessages(prev => [...prev, {role: "user", content: input}]);
            setInput("");

            const response = await getAIResponse(input);
            const aiMessage = response.choices[0].message;

            setMessages(prev => [...prev, {
                role: "assistant",
                content: aiMessage.content,
                citations: response.citations,
                isAnimating: true
            }]);
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to get AI response. Please try again.",
                variant: "destructive"
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleFilesSelected = (newFiles: File[]) => {
        setFiles(prev => [...prev, ...newFiles]);
        toast({
            title: "Files uploaded",
            description: `${newFiles.length} files have been attached`
        });
    };

    const handleAnimationComplete = (index: number) => {
        setMessages(prev => prev.map((msg, i) =>
            i === index ? {...msg, isAnimating: false} : msg
        ));
    };

    return (
        <div className="flex flex-col gap-6 max-w-4xl mx-auto p-4">
            <div className="flex justify-center">
                <ProfessorAvatar isAnimating={isLoading || messages.some(m => m.isAnimating)}/>
            </div>

            <Card className="p-4">
                <ScrollArea className="h-[400px] mb-4">
                    <div className="flex flex-col gap-4 p-2">
                        {messages.map((msg, i) => (
                            <div
                                key={i}
                                className={`
                  flex flex-col gap-2 p-4 rounded-lg
                  ${msg.role === "user"
                                    ? "bg-muted self-end max-w-[80%]"
                                    : "bg-primary/10 self-start max-w-[80%]"
                                }
                `}
                            >
                                {msg.role === "assistant" && msg.isAnimating ? (
                                    <AnimatedText
                                        text={msg.content}
                                        onComplete={() => {
                                            handleAnimationComplete(i)
                                        }}
                                        speed={30}
                                    />
                                ) : (
                                    <p>{msg.content}</p>
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
                            </div>
                        ))}
                    </div>
                    <span ref={bottomRef}/>
                </ScrollArea>

                <FileUpload onFilesSelected={handleFilesSelected}/>

                <div className="flex gap-2 mt-4">
                    <Textarea
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Ask your question..."
                        className="min-h-[100px]"
                    />
                    <Button
                        onClick={handleSubmit}
                        disabled={isLoading || !input.trim()}
                        className="self-end"
                    >
                        <Send className="w-4 h-4"/>
                    </Button>
                </div>
            </Card>
        </div>
    );
}
import { useState } from "react";
import { Card } from "./ui/card";
import { Textarea } from "./ui/textarea";
import { Button } from "./ui/button";
import { Send } from "lucide-react";
import { FileUpload } from "./file-upload";
import { ProfessorAvatar } from "./professor-avatar";
import { ScrollArea } from "./ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { getAIResponse } from "@/lib/perplexity";
import { AnimatedText } from "./animated-text";
import { motion } from "framer-motion";

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
  const { toast } = useToast();

  const handleSubmit = async () => {
    if (!input.trim()) return;

    try {
      setIsLoading(true);
      setMessages(prev => [...prev, { role: "user", content: input }]);
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
      description: `${newFiles.length} files have been attached`,
      className: "bg-primary text-primary-foreground"
    });
  };

  const handleAnimationComplete = (index: number) => {
    setMessages(prev => prev.map((msg, i) => 
      i === index ? { ...msg, isAnimating: false } : msg
    ));
  };

  return (
    <div className="flex flex-col gap-8 max-w-4xl mx-auto p-4 md:p-8">
      <motion.div 
        className="flex justify-center"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <ProfessorAvatar isAnimating={isLoading || messages.some(m => m.isAnimating)} />
      </motion.div>

      <Card className="p-6 shadow-lg border-2">
        <ScrollArea className="h-[500px] pr-4 mb-6">
          <div className="flex flex-col gap-6">
            {messages.map((msg, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className={`
                  flex flex-col gap-3 p-4 rounded-xl max-w-[85%]
                  ${msg.role === "user" 
                    ? "bg-primary/10 self-end" 
                    : "bg-secondary/10 self-start"
                  }
                `}
              >
                {msg.role === "assistant" && msg.isAnimating ? (
                  <AnimatedText 
                    text={msg.content} 
                    onComplete={() => handleAnimationComplete(i)}
                    speed={30}
                  />
                ) : (
                  <p className="leading-relaxed">{msg.content}</p>
                )}
                {msg.citations && (
                  <div className="mt-2 text-sm text-muted-foreground border-t pt-2">
                    <p className="font-medium mb-1">Sources:</p>
                    <ul className="list-disc list-inside space-y-1">
                      {msg.citations.map((citation, i) => (
                        <li key={i}>
                          <a 
                            href={citation} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="hover:text-primary transition-colors"
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
          </div>
        </ScrollArea>

        <div className="space-y-4">
          <FileUpload onFilesSelected={handleFilesSelected} />

          <div className="flex gap-3">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask your question..."
              className="min-h-[100px] resize-none focus-visible:ring-primary"
            />
            <Button 
              onClick={handleSubmit} 
              disabled={isLoading || !input.trim()}
              className="self-end px-6 h-12 bg-primary hover:bg-primary/90 transition-colors"
            >
              <Send className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
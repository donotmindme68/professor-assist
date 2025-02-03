import { ChatBox } from "@/components/chat-box";

export default function Home() {
  return (
    <div className="min-h-screen bg-background py-8 flex flex-col items-center justify-center">
      <div className="container">
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
            AI Professor Assistant
          </h1>
          <p className="text-lg text-muted-foreground mt-2">
            Ask questions and get expert responses from your AI professor
          </p>
        </header>

        <ChatBox />
      </div>
    </div>
  );
}

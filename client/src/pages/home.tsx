import {motion} from "framer-motion";
import {ChatBox} from "@/components/chat-box.tsx";

export default function Home() {
  return (
    <div className='w-full h-full flex items-center justify-center'>
    <div className='container px-4 py-8'>
      <motion.header
        className="text-center mb-8"
        initial={{opacity: 0, y: -20}}
        animate={{opacity: 1, y: 0}}
        transition={{duration: 0.5}}
      >
        <h1
          className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent animate-gradient">
          AI Professor Assistant
        </h1>
        <p className="text-lg text-muted-foreground mt-2">
          Ask questions and get expert responses from your AI professor
        </p>
      </motion.header>
      <ChatBox/>
    </div>
    </div>
  );
}
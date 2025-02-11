import { ChatBox } from './components/chat-box';
import { ThemeToggle } from './components/theme-toggle';
import { motion } from 'framer-motion';

function App() {
  return (
    <div className="min-h-screen bg-background transition-colors duration-300">
      <ThemeToggle />
      
      <div className="container mx-auto px-4 py-8">
        <motion.header 
          className="text-center mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent animate-gradient">
            AI Professor Assistant
          </h1>
          <p className="text-lg text-muted-foreground mt-2">
            Ask questions and get expert responses from your AI professor
          </p>
        </motion.header>

        <ChatBox />
      </div>
    </div>
  );
}

export default App;
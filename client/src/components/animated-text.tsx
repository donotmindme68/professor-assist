import { motion, useAnimation } from 'framer-motion';
import { useEffect } from 'react';

interface AnimatedTextProps {
  text: string;
  onComplete?: () => void;
  speed?: number;
}

export function AnimatedText({ text, onComplete, speed = 30 }: AnimatedTextProps) {
  const controls = useAnimation();

  useEffect(() => {
    let timeout: NodeJS.Timeout;
    
    const animate = async () => {
      await controls.start({
        opacity: 1,
        transition: { duration: 0.5 }
      });
      
      if (onComplete) {
        timeout = setTimeout(onComplete, text.length * speed);
      }
    };

    animate();

    return () => {
      if (timeout) clearTimeout(timeout);
    };
  }, [text, controls, onComplete, speed]);

  return (
    <motion.p
      initial={{ opacity: 0 }}
      animate={controls}
      className="leading-relaxed"
    >
      {text}
    </motion.p>
  );
}
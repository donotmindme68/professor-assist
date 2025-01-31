import { useEffect, useState } from "react";

interface AnimatedTextProps {
  text: string;
  onComplete?: () => void;
  speed?: number;
}

export function AnimatedText({ text, onComplete, speed = 30 }: AnimatedTextProps) {
  const [displayedText, setDisplayedText] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (currentIndex < text.length) {
      const timer = setTimeout(() => {
        setDisplayedText(prev => prev + text[currentIndex]);
        setCurrentIndex(prev => prev + 1);
      }, speed);

      return () => clearTimeout(timer);
    } else {
      onComplete?.();
    }
  }, [currentIndex, text, speed, onComplete]);

  useEffect(() => {
    setDisplayedText("");
    setCurrentIndex(0);
  }, [text]);

  return <span>{displayedText}</span>;
}

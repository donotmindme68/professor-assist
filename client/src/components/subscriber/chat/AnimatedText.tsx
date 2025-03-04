import React, { useEffect, useState } from 'react';

interface AnimatedTextProps {
  text: string;
  onComplete: () => void;
  speed?: number;
}

const AnimatedText: React.FC<AnimatedTextProps> = ({ 
  text, 
  onComplete,
  speed = 15 // Speed of typing animation in milliseconds
}) => {
  const [displayedText, setDisplayedText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  
  useEffect(() => {
    if (currentIndex < text.length) {
      const timer = setTimeout(() => {
        setDisplayedText(prev => prev + text[currentIndex]);
        setCurrentIndex(currentIndex + 1);
      }, speed);
      
      return () => clearTimeout(timer);
    } else {
      onComplete();
    }
  }, [currentIndex, text, onComplete, speed]);
  
  return <p className="leading-relaxed">{displayedText}</p>;
};

export default AnimatedText;
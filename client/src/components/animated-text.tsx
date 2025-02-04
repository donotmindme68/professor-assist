import { useEffect, useState } from "react";
// @ts-ignore
import Speech from 'speak-tts';


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
    const speech = new Speech();
    speech.init().then(() => {
      try {
        speech.setVoice('Google UK English Male')
      } catch (e) {
        console.error(e);
        console.log("If u are using this error, ur browser does not have the required Male voice installed. This will be fixed once OpenAI APIs are fixed")
      }
      speech.speak({text});
    })
    return speech.cancel()
  }, [text]);

  useEffect(() => {
    setDisplayedText("");
    setCurrentIndex(0);
  }, [text]);

  return <span>{displayedText}</span>;
}

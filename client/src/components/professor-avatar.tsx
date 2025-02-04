import { motion, useAnimationControls } from "framer-motion";
import { useEffect } from "react";

interface ProfessorAvatarProps {
  isAnimating: boolean;
}

export function ProfessorAvatar({ isAnimating }: ProfessorAvatarProps) {
  const controls = useAnimationControls();
  
  useEffect(() => {
    if (isAnimating) {
      controls.start({
        y: [-2, 2, -2],
        transition: {
          duration: 1.5,
          repeat: Infinity,
          ease: "easeInOut"
        }
      });
    } else {
      controls.stop();
      controls.set({ y: 0 });
    }
  }, [isAnimating]);

  return (
    <motion.div
      animate={controls}
      className="relative w-32 h-32 md:w-48 md:h-48 rounded-full overflow-hidden shadow-lg border-4 border-primary"
    >
      <img
        src="/professor.jpeg"
        alt="AI Professor"
        className="w-full h-full object-cover"
      />
      {isAnimating && (
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-primary animate-pulse" />
      )}
    </motion.div>
  );
}

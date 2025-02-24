import { motion } from 'framer-motion';
import { GraduationCap } from 'lucide-react';

interface ProfessorAvatarProps {
  isAnimating?: boolean;
  onClick?: () => void;
  size?: 'sm' | 'md' | 'lg';
  professorId?: number;
}

const PROFESSOR_IMAGES = [
  'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=400&h=400&q=80',
  'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=400&h=400&q=80',
  'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=400&h=400&q=80'
];

export function ProfessorAvatar({ isAnimating, onClick, size = 'lg', professorId = 0 }: ProfessorAvatarProps) {
  const sizeClasses = {
    sm: 'w-16 h-16',
    md: 'w-24 h-24',
    lg: 'w-40 h-40',
  };

  const imageUrl = PROFESSOR_IMAGES[professorId % PROFESSOR_IMAGES.length];

  return (
    <motion.button
      type="button"
      onClick={onClick}
      className={`relative ${sizeClasses[size]} rounded-full bg-gradient-to-r from-primary to-primary/70 flex items-center justify-center overflow-hidden ${onClick ? 'cursor-pointer' : 'cursor-default'}`}
      animate={
        isAnimating
          ? {
            scale: [1, 1.1, 1],
            transition: { repeat: Infinity, duration: 2 },
          }
          : {}
      }
      whileHover={onClick ? { scale: 1.05 } : {}}
      whileTap={onClick ? { scale: 0.95 } : {}}
    >
      <img
        alt="professor avatar"
        className={`${sizeClasses[size]} object-cover`}
        src={imageUrl}
      />
    </motion.button>
  );
}
import {motion} from 'framer-motion';
import {GraduationCap} from 'lucide-react';
import professorImage from '../assets/woman-professor.jpg'

interface ProfessorAvatarProps {
    isAnimating?: boolean;
}

export function ProfessorAvatar({isAnimating}: ProfessorAvatarProps) {
    return (
        <motion.div
            className="relative w-40 h-40 rounded-full bg-gradient-to-r from-primary to-primary/70 flex items-center justify-center overflow-hidden"
            animate={isAnimating ? {
                scale: [1, 1.1, 1],
                transition: {repeat: Infinity, duration: 2}
            } : {}}
        >
            {/*<GraduationCap className="w-8 h-8 text-primary-foreground" />*/}
            <img alt={'professor image'} className="w-40 h-40" src={professorImage}/>
        </motion.div>
    );
}
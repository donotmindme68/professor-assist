import { useCallback, ReactNode } from 'react';
import { motion } from 'framer-motion';
import { cn } from '../utils';

interface FileUploadProps {
  onFilesSelected: (files: File[]) => void;
  children?: ReactNode;
}

export function FileUpload({ onFilesSelected, children }: FileUploadProps) {
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);
    onFilesSelected(files);
  }, [onFilesSelected]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    onFilesSelected(files);
  }, [onFilesSelected]);

  return (
    <div
      onDragOver={(e) => e.preventDefault()}
      onDrop={handleDrop}
      className="relative"
    >
      <motion.label className="cursor-pointer">
        {children || (
          <div className={cn(
            "flex items-center gap-2 p-2 rounded-lg",
            "hover:bg-muted transition-colors"
          )}>
            <span className="text-sm">Attach files</span>
          </div>
        )}
        <input
          type="file"
          multiple
          onChange={handleChange}
          className="hidden"
        />
      </motion.label>
    </div>
  );
}
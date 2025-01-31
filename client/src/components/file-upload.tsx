import { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Card } from "./ui/card";
import { LucideUpload } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface FileUploadProps {
  onFilesSelected: (files: File[]) => void;
  maxFiles?: number;
}

export function FileUpload({ onFilesSelected, maxFiles = 5 }: FileUploadProps) {
  const onDrop = useCallback((acceptedFiles: File[]) => {
    onFilesSelected(acceptedFiles);
  }, [onFilesSelected]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    maxFiles,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif'],
      'application/pdf': ['.pdf'],
      'text/*': ['.txt', '.md']
    }
  });

  return (
    <Card
      {...getRootProps()}
      className={`
        relative overflow-hidden
        p-8 border-2 border-dashed cursor-pointer
        transition-all duration-200
        hover:border-primary/50 hover:bg-primary/5
        ${isDragActive ? 'border-primary bg-primary/10' : 'border-muted'}
      `}
    >
      <input {...getInputProps()} />
      <AnimatePresence>
        <motion.div 
          className="flex flex-col items-center gap-4 text-muted-foreground"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
        >
          <motion.div
            animate={{
              scale: isDragActive ? 1.1 : 1,
              rotate: isDragActive ? [0, -10, 10, 0] : 0,
            }}
            transition={{ duration: 0.2 }}
          >
            <LucideUpload className="w-10 h-10 text-primary" />
          </motion.div>
          {isDragActive ? (
            <p className="text-primary font-medium">Drop files here...</p>
          ) : (
            <>
              <p className="font-medium">Drag & drop files here, or click to select</p>
              <p className="text-sm">
                Supports images, PDFs, and text files (max {maxFiles} files)
              </p>
            </>
          )}
        </motion.div>
      </AnimatePresence>
    </Card>
  );
}
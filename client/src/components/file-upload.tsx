import { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Card } from "./ui/card";
import { LucideUpload } from "lucide-react";

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
        p-8 border-2 border-dashed cursor-pointer
        transition-colors duration-200
        ${isDragActive ? 'border-primary bg-primary/5' : 'border-muted'}
      `}
    >
      <input {...getInputProps()} />
      <div className="flex flex-col items-center gap-4 text-muted-foreground">
        <LucideUpload className="w-8 h-8" />
        {isDragActive ? (
          <p>Drop the files here...</p>
        ) : (
          <p>Drag & drop files here, or click to select files</p>
        )}
        <p className="text-sm">
          Supports images, PDFs, and text files (max {maxFiles} files)
        </p>
      </div>
    </Card>
  );
}

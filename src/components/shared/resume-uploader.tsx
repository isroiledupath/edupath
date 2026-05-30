'use client';

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileText, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn, validateFileSize, validateFileType } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

interface ResumeUploaderProps {
  onUpload: (url: string) => void;
  currentUrl?: string;
  className?: string;
}

export function ResumeUploader({ onUpload, currentUrl, className }: ResumeUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [uploadedUrl, setUploadedUrl] = useState(currentUrl);
  const { toast } = useToast();

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      if (!file) return;

      if (!validateFileType(file, ['application/pdf'])) {
        toast({
          title: 'Invalid file type',
          description: 'Please upload a PDF file.',
          variant: 'destructive',
        });
        return;
      }

      if (!validateFileSize(file, 5)) {
        toast({
          title: 'File too large',
          description: 'Please upload a file smaller than 5MB.',
          variant: 'destructive',
        });
        return;
      }

      setUploading(true);
      try {
        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });

        const json = await response.json();

        if (!response.ok) {
          throw new Error(json.error ?? 'Upload failed');
        }

        const { url } = json;
        setUploadedUrl(url);
        onUpload(url);

        toast({
          title: 'Resume uploaded',
          description: 'Your resume has been uploaded successfully.',
        });
      } catch (err) {
        toast({
          title: 'Upload failed',
          description: err instanceof Error ? err.message : 'Something went wrong. Please try again.',
          variant: 'destructive',
        });
      } finally {
        setUploading(false);
      }
    },
    [onUpload, toast]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'] },
    maxFiles: 1,
    disabled: uploading,
  });

  const removeFile = () => {
    setUploadedUrl(undefined);
    onUpload('');
  };

  if (uploadedUrl) {
    return (
      <div className={cn('flex items-center gap-3 p-3 border rounded-lg bg-muted/50', className)}>
        <FileText className="h-8 w-8 text-red-500 shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate">Resume.pdf</p>
          <a
            href={uploadedUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-primary hover:underline"
          >
            View file
          </a>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="shrink-0 h-8 w-8"
          onClick={removeFile}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  return (
    <div
      {...getRootProps()}
      className={cn(
        'border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors',
        isDragActive
          ? 'border-primary bg-primary/5'
          : 'border-border hover:border-primary/50 hover:bg-muted/50',
        uploading && 'cursor-not-allowed opacity-60',
        className
      )}
    >
      <input {...getInputProps()} />
      <div className="flex flex-col items-center gap-2">
        {uploading ? (
          <>
            <Loader2 className="h-8 w-8 text-primary animate-spin" />
            <p className="text-sm text-muted-foreground">Uploading...</p>
          </>
        ) : (
          <>
            <Upload className="h-8 w-8 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">
                {isDragActive ? 'Drop your resume here' : 'Upload your resume'}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                PDF only, max 5MB. Drag & drop or click to browse.
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

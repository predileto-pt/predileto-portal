"use client";

import { useCallback, useRef, useState } from "react";

interface FileDropzoneProps {
  label: string;
  description: string;
  files: File[];
  onFilesChange: (files: File[]) => void;
  maxFiles?: number;
  dropzoneText: string;
  dropzoneActiveText: string;
}

export function FileDropzone({
  label,
  description,
  files,
  onFilesChange,
  maxFiles = 1,
  dropzoneText,
  dropzoneActiveText,
}: FileDropzoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFiles = useCallback(
    (incoming: FileList | null) => {
      if (!incoming) return;
      const newFiles = Array.from(incoming).slice(0, maxFiles - files.length);
      if (newFiles.length > 0) {
        onFilesChange([...files, ...newFiles].slice(0, maxFiles));
      }
    },
    [files, maxFiles, onFilesChange],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      handleFiles(e.dataTransfer.files);
    },
    [handleFiles],
  );

  const removeFile = useCallback(
    (index: number) => {
      onFilesChange(files.filter((_, i) => i !== index));
    },
    [files, onFilesChange],
  );

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">{label}</label>
      <p className="text-xs text-gray-500">{description}</p>

      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
          isDragging
            ? "border-blue-500 bg-blue-50"
            : "border-gray-300 hover:border-gray-400"
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          className="hidden"
          multiple={maxFiles > 1}
          onChange={(e) => handleFiles(e.target.files)}
        />
        <p className="text-sm text-gray-500">
          {isDragging ? dropzoneActiveText : dropzoneText}
        </p>
      </div>

      {files.length > 0 && (
        <ul className="space-y-1">
          {files.map((file, i) => (
            <li key={`${file.name}-${i}`} className="flex items-center justify-between text-sm text-gray-700 bg-gray-50 px-3 py-1.5 rounded">
              <span className="truncate">{file.name}</span>
              <button
                type="button"
                onClick={() => removeFile(i)}
                className="text-gray-400 hover:text-red-500 ml-2"
              >
                &#x2715;
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

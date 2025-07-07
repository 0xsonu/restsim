"use client";

import React, { useState, useRef } from "react";
import { Upload, File, X, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface FileUploadProps {
  onFileSelect: (file: File | null) => void;
  acceptedTypes?: string;
  maxSize?: number;
}

const FileUpload: React.FC<FileUploadProps> = ({
  onFileSelect,
  acceptedTypes = ".zip",
  maxSize = 50 * 1024 * 1024, // 50MB
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (file: File) => {
    setError(null);

    // Check file size
    if (file.size > maxSize) {
      setError(
        `File size exceeds ${(maxSize / 1024 / 1024).toFixed(0)}MB limit`
      );
      return;
    }

    // Check file type
    if (
      acceptedTypes &&
      !acceptedTypes
        .split(",")
        .some((type) =>
          file.name.toLowerCase().endsWith(type.trim().toLowerCase())
        )
    ) {
      setError(`Only ${acceptedTypes} files are allowed`);
      return;
    }

    setUploadedFile(file);
    onFileSelect(file);
  };

  const removeFile = () => {
    setUploadedFile(null);
    setError(null);
    onFileSelect(null);
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };

  const onButtonClick = () => {
    inputRef.current?.click();
  };

  return (
    <div className="space-y-4">
      <div
        className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          dragActive
            ? "border-blue-400 bg-blue-50 dark:bg-blue-900"
            : "border-gray-300 dark:border-gray-600 hover:border-gray-400"
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          ref={inputRef}
          type="file"
          className="hidden"
          accept={acceptedTypes}
          onChange={handleChange}
        />

        {!uploadedFile ? (
          <div className="space-y-4">
            <Upload className="mx-auto h-12 w-12 text-gray-400" />
            <div>
              <p className="text-lg font-medium text-gray-900 dark:text-white">
                Drop your file here
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                or click to browse files
              </p>
            </div>
            <Button onClick={onButtonClick} variant="outline">
              Choose File
            </Button>
            <div className="text-xs text-gray-500">
              <p>Supported formats: {acceptedTypes}</p>
              <p>Maximum size: {(maxSize / 1024 / 1024).toFixed(0)}MB</p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <CheckCircle className="mx-auto h-12 w-12 text-green-500" />
            <div className="flex items-center justify-center space-x-2">
              <File className="h-5 w-5 text-gray-500" />
              <span className="font-medium text-gray-900 dark:text-white">
                {uploadedFile.name}
              </span>
            </div>
            <p className="text-sm text-gray-500">
              {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
            </p>
            <Button
              onClick={removeFile}
              variant="outline"
              size="sm"
              className="text-red-600 hover:text-red-700"
            >
              <X className="h-4 w-4 mr-2" />
              Remove File
            </Button>
          </div>
        )}
      </div>

      {error && (
        <div className="p-3 text-sm text-red-600 bg-red-50 dark:bg-red-900 dark:text-red-400 rounded-md">
          {error}
        </div>
      )}
    </div>
  );
};

export default FileUpload;

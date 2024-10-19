import { FileIcon, X } from "lucide-react";
import React from "react";
import { UploadDropzone } from "@/lib/uploadthing";
import { Button } from "../button";

type Props = {
  apiEndpoint: "resumeUploader";
  onChange: (url?: string, extractedText?: string) => void;
  value?: string;
  onRemove: () => void;
};

const FileUpload = ({ apiEndpoint, onChange, value, onRemove }: Props) => {
  // Check if the uploaded file is a PDF
  const isPdf = value?.split(".").pop()?.toLowerCase() === "pdf";

  const handleRemoveFile = async () => {
    onChange("");
    onRemove();
    try {
      if (value) {
        await fetch("/api/delete-uploadthing-file", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ fileUrl: value }),
        });
      }
      console.log("File removed successfully.");
    } catch (error) {
      console.error("Error removing file:", error);
    }
  };

  const handleBeforeUploadBegin = async (files: File[]) => {
    const file = files[0];
    const uploadedFileType = file.name.split(".").pop()?.toLowerCase();

    console.log("file: " + file);
    if (uploadedFileType === "pdf") {
      try {
        const formData = new FormData();
        formData.append("file", file);
        console.log("------ , " + formData);
        const response = await fetch("/api/parse-pdf", {
          method: "POST",
          body: formData,
        });

        const { text } = await response.json();
        onChange(undefined, text);
      } catch (error) {
        console.error("Error extracting PDF text:", error);
      }
    }

    return files;
  };

  if (value) {
    return (
      <div className="flex flex-col justify-center items-center">
        {isPdf ? (
          <div className="relative flex items-center p-2 mt-2 rounded-md bg-background/10">
            <FileIcon />
            <a
              href={value}
              target="_blank"
              rel="noopener noreferrer"
              className="ml-2 text-sm text-indigo-500 dark:text-indigo-400 hover:underline"
            >
              View PDF
            </a>
          </div>
        ) : (
          // If it's not a PDF, display an error message
          <div className="text-red-500">Error: Uploaded file is not a PDF.</div>
        )}
        <Button onClick={handleRemoveFile} variant="ghost" type="button">
          <X className="h-4 w-4" />
          Remove File
        </Button>
      </div>
    );
  }

  return (
    <div className="w-full bg-muted/30">
      <UploadDropzone
        endpoint={apiEndpoint}
        onBeforeUploadBegin={handleBeforeUploadBegin} // Extract text before uploading
        onClientUploadComplete={(res) => {
          const uploadedFile = res?.[0];
          const uploadedFileType = uploadedFile?.url
            .split(".")
            .pop()
            ?.toLowerCase();

          if (uploadedFileType === "pdf") {
            onChange(uploadedFile.url);
          } else {
            console.error("Error: Only PDF files are allowed.");
          }
        }}
        onUploadError={(error: Error) => {
          console.log("Upload error:", error);
        }}
      />
    </div>
  );
};

export default FileUpload;

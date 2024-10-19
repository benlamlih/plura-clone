"use client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import FileUpload from "@/components/ui/global/file-upload";
import { useToast } from "@/components/ui/use-toast";
import { useState } from "react";
import { useForm } from "react-hook-form";

type FormValues = {
  resumeFile: string; // Field to store the uploaded resume URL
};

export default function ResumeUploadPage() {
  const form = useForm<FormValues>({
    defaultValues: {
      resumeFile: "", // Set default empty value for resume file
    },
  });

  const [pdfText, setPdfText] = useState<string | null>(null);
  const [isFileUploaded, setIsFileUploaded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (data: FormValues) => {
    if (!data.resumeFile) {
      toast({
        title: "Error",
        description: "Please upload a resume file before submitting.",
      });
      return;
    }

    setIsLoading(true);

    try {
      await fetch("/api/save-resume", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ resumeFile: data.resumeFile }),
      });

      toast({
        title: "Success",
        description: "Your resume has been uploaded successfully.",
      });
      console.log("before going to next: ", pdfText);
      // router.push({
      //   pathname: `/resume/${data.resumeFile.split("/").pop()}`,
      //   query: { pdfText: pdfText ?? "" },
      // });
    } catch (error) {
      toast({
        title: "Error",
        description: "There was an error uploading your resume.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUploadComplete = (
    url?: string,
    extractedPdfText?: string,
  ) => {
    if (!url || !extractedPdfText) {
      toast({
        title: "Error",
        description: "File upload failed. Please try again.",
      });
      return;
    }
    console.log("Extracted PDF Text: in page.tsx", extractedPdfText);
    form.setValue("resumeFile", url);
    setPdfText(extractedPdfText); // Set the extracted PDF text
    setIsFileUploaded(true);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Upload Your Resume</CardTitle>
        <CardDescription>
          Upload your resume to apply for jobs. Ensure the file is in PDF
          format.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-4"
          >
            <FormField
              disabled={isLoading}
              control={form.control}
              name="resumeFile"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Resume (PDF Only)</FormLabel>
                  <FormControl>
                    <FileUpload
                      apiEndpoint="resumeUploader"
                      onChange={(url, extractedText) => {
                        field.onChange(url);
                        handleFileUploadComplete(url, extractedText);
                      }}
                      onRemove={() => {
                        field.onChange("");
                        setIsFileUploaded(false);
                      }}
                      value={field.value}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {isFileUploaded && (
              <div className="flex justify-center">
                <Button
                  type="submit"
                  disabled={isLoading}
                  variant={"secondary"}
                >
                  {isLoading ? "Uploading..." : "Upload Resume"}
                </Button>
              </div>
            )}
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}

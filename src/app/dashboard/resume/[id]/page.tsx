"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/esm/Page/TextLayer.css";

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

async function requestOpenAI(pdfText: string) {
  try {
    const response = await fetch("/api/open-ai", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ pdfText }),
    });

    const extractedData = await response.json();
    const parsedData = JSON.parse(
      extractedData.data.replace(/```json|```/g, "").trim(),
    );
    return parsedData;
  } catch (error) {
    console.error("Error during OpenAI request:", error);
    return null;
  }
}

export default function ResumePage() {
  const [numPages, setNumPages] = useState<number | null>(null);
  const [resumeData, setResumeData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const router = useRouter();
  const { pdfText } = router.query; // Get the extracted PDF text from the query

  // Trigger the OpenAI API request when the page loads with the PDF text
  useEffect(() => {
    if (pdfText) {
      setLoading(true);
      (async () => {
        const data = await requestOpenAI(pdfText as string);
        setResumeData(data);
        setLoading(false);
      })();
    }
  }, [pdfText]);

  // Handle when the PDF document is successfully loaded
  function onDocumentLoadSuccess({ numPages }: { numPages: number }): void {
    setNumPages(numPages);
  }

  const pdfUrl = `https://utfs.io/f/${router.query.id}.pdf`; // Use the uploaded PDF URL

  return (
    <div className="flex flex-col lg:flex-row w-full h-full">
      {/* ATS analysis */}
      <div className="w-full lg:w-1/3 p-4 flex flex-col items-center">
        <Card className="w-full">
          <CardHeader>
            <CardTitle>ATS Score</CardTitle>
            <CardDescription>Based on your resume analysis</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center">
            {loading ? (
              <Progress className="w-[60%]" value={50} />
            ) : resumeData ? (
              <>
                <p>
                  <strong>Name:</strong> {resumeData.personal_info?.name}
                </p>
                <p>
                  <strong>Email:</strong> {resumeData.personal_info?.email}
                </p>
                <p>
                  <strong>Phone:</strong> {resumeData.personal_info?.phone}
                </p>
                <p>
                  <strong>Summary:</strong> {resumeData.summary}
                </p>
                <p>
                  <strong>Skills:</strong>{" "}
                  {resumeData.skills?.technical_skills?.join(", ")}
                </p>
              </>
            ) : (
              <p>No resume data analyzed yet.</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* PDF viewer */}
      <div className="w-full lg:w-2/3 p-4">
        <Card className="w-full">
          <CardHeader>
            <CardTitle>Your Resume</CardTitle>
            <CardDescription>Preview of the uploaded resume</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <div className="w-full max-w-[600px] h-auto">
              <Document file={pdfUrl} onLoadSuccess={onDocumentLoadSuccess}>
                <Page
                  pageNumber={1} // Display the first page only for now
                  renderTextLayer={false}
                  renderAnnotationLayer={false}
                />
              </Document>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

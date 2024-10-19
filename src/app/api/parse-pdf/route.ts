import { NextResponse } from "next/server";
import { readPdfText } from "pdf-text-reader";
import * as pdfjs from "pdfjs-dist/build/pdf";
import pdfWorker from "pdfjs-dist/build/pdf.worker.entry";

pdfjs.GlobalWorkerOptions.workerSrc = pdfWorker;

export async function POST(req: Request) {
  const formData = await req.formData();

  const file = formData.get("file") as File;
  if (!file) {
    return NextResponse.json({ error: "No files received." }, { status: 400 });
  }

  const arrayBuffer = Buffer.from(await file.arrayBuffer());
  console.log("arrayBuffer", arrayBuffer);
  const buffer = new Uint8Array(arrayBuffer);
  const pdfText = await readPdfText({ data: buffer });
  console.log("pdftext", pdfText);
  return NextResponse.json({ text: pdfText }, { status: 200 });
}

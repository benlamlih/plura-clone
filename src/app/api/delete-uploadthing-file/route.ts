import { NextRequest, NextResponse } from "next/server";
import { UTApi } from "uploadthing/server";

export async function POST(req: NextRequest) {
  const utapi = new UTApi();
  try {
    const { fileUrl } = await req.json();

    const fileId = fileUrl.split("/").pop();

    if (!fileId) {
      return NextResponse.json({ error: "Invalid file URL" }, { status: 400 });
    }

    await utapi.deleteFiles([fileId]);

    return NextResponse.json(
      { message: "File deleted successfully." },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error deleting file:", error);
    return NextResponse.json(
      { error: "Failed to delete file." },
      { status: 500 },
    );
  }
}

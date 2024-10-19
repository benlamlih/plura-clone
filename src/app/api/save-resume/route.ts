import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { currentUser } from "@clerk/nextjs/server";

export async function POST(req: Request) {
  try {
    const user = await currentUser();
    const { resumeFile } = await req.json();
    if (user) {
      await db.resume.create({
        data: {
          url: resumeFile,
          userId: user.id,
        },
      });
      return NextResponse.json({ message: "Resume saved successfully." });
    } else {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to save resume." },
      { status: 500 },
    );
  }
}

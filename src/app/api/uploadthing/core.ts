import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UploadThingError } from "uploadthing/server";
import { db } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";

const f = createUploadthing();

const authenticateUser = async (req: Request) => {
  const userId = "test-user-id";
  // const { userId } = auth();
  // if (!userId) throw new UploadThingError("Unauthorized");
  return { userId };
};

export const ourFileRouter = {
  // Resume uploader that allows only PDF files
  resumeUploader: f({ pdf: { maxFileSize: "2MB", maxFileCount: 1 } })
    .middleware(async ({ req }) => {
      const { userId } = await authenticateUser(req);
      return { userId };
    })
    .onUploadComplete(
      //   async ({ metadata, file }) => {
      //   await db.resume.create({
      //     data: {
      //       url: file.url,
      //       userId: metadata.userId,
      //     },
      //   });
      //   console.log("Upload complete for userId:", metadata.userId);
      //   console.log("File URL:", file.url);

      //   return { uploadedBy: metadata.userId };
      // }
      () => {
        console.log("Upload complete");
      },
    ),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;

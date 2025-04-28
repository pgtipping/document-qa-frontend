import { NextRequest, NextResponse } from "next/server";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import prisma from "@/lib/prisma"; // Import Prisma client instance
import { getDocumentTextContent } from "@/lib/document-processing"; // Import main processing function
import { getAuthSession } from "@/lib/auth"; // Import session helper
import { randomUUID } from "crypto"; // Import for generating unique IDs

// Configure S3 Client
// Ensure these environment variables are set in your .env.local or environment
const s3Client = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

const S3_BUCKET_NAME = process.env.S3_BUCKET_NAME!;
const S3_PREFIX = "Doc-Chat"; // Consistent with Python backend

export async function POST(request: NextRequest) {
  try {
    // --- Authentication Check ---
    const session = await getAuthSession();
    if (!session?.user?.id) {
      console.log("Upload API: Unauthorized access attempt.");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = session.user.id;
    // --- End Authentication Check ---

    const formData = await request.formData();
    const files = formData.getAll("file") as File[]; // Handle multiple files

    if (!files || files.length === 0 || files.some((f) => !f || f.size === 0)) {
      return NextResponse.json(
        { error: "No valid files provided" },
        { status: 400 }
      );
    }

    const uploadResults = [];

    for (const file of files) {
      if (!file || file.size === 0) {
        console.warn("Skipping empty or invalid file entry");
        continue; // Skip if a file entry is somehow invalid
      }

      // Generate S3 key using userId and a unique ID for the file
      const filename = file.name;
      const uniqueFileId = randomUUID(); // Generate a unique ID for this file upload
      // Structure: prefix/user_id/unique_id/filename
      const s3Key = `${S3_PREFIX}/documents/${userId}/${uniqueFileId}/${filename}`;

      console.log(
        `Uploading ${filename} for user ${userId} to s3://${S3_BUCKET_NAME}/${s3Key}`
      );

      // Read file content
      const buffer = Buffer.from(await file.arrayBuffer());

      // Create PutObject command
      const command = new PutObjectCommand({
        Bucket: S3_BUCKET_NAME,
        Key: s3Key,
        Body: buffer,
        ContentType: file.type,
        // Add userId as metadata for potential S3-level checks or lifecycle rules
        Metadata: {
          "user-id": userId,
        },
      });

      // Upload to S3
      await s3Client.send(command);

      console.log(`Successfully uploaded ${filename} to S3 for user ${userId}`);

      // --- Prisma Integration Start ---
      let dbDocument;
      try {
        dbDocument = await prisma.document.create({
          data: {
            filename: filename,
            s3Key: s3Key,
            userId: userId, // Associate with the authenticated user
            status: "active", // Initial status
          },
        });
        console.log(
          `Successfully created database record for ${filename} (User: ${userId}) with ID: ${dbDocument.id}`
        );
      } catch (dbError) {
        console.error(
          `Database error creating record for ${filename} (User: ${userId}):`,
          dbError
        );
        // Optional: Consider deleting the uploaded S3 object if DB write fails
        // await s3Client.send(new DeleteObjectCommand({ Bucket: S3_BUCKET_NAME, Key: s3Key }));
        // console.warn(`Rolled back S3 upload for ${filename} due to DB error.`);
        // Skip adding this file to results if DB write failed
        continue;
      }
      // --- Prisma Integration End ---

      // --- Trigger Initial Processing/Caching ---
      try {
        // Call getDocumentTextContent to trigger processing and caching.
        // We await it here to ensure processing starts, but don't need the result immediately.
        // Errors are caught so they don't fail the upload response.
        await getDocumentTextContent(s3Key);
        console.log(`Triggered initial processing/caching for ${s3Key}`);
      } catch (processingError) {
        console.error(
          `Failed to trigger initial processing for ${s3Key}:`,
          processingError
        );
        // Decide if this should be a fatal error for the upload or just logged
      }
      // --- End Trigger ---
      // Construct URL after successful DB entry
      const url = `https://${S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${s3Key}`;

      uploadResults.push({
        documentId: dbDocument.id, // Use the ID from the database record
        filename: filename,
        s3Key: s3Key, // Include s3Key for potential future use (e.g., deletion)
        url: url, // Keep URL for potential direct access/display
        size: file.size,
        type: file.type,
      });
    }

    // Return results for all uploaded files
    return NextResponse.json({ uploads: uploadResults });
  } catch (error) {
    // Enhanced error logging
    console.error("Upload API error details:", {
      errorType:
        typeof error === "object" && error !== null && error.constructor
          ? error.constructor.name
          : typeof error,
      errorMessage: error instanceof Error ? error.message : String(error),
      errorStack: error instanceof Error ? error.stack : undefined,
      envVarsPresent: {
        AWS_REGION: !!process.env.AWS_REGION,
        AWS_ACCESS_KEY_ID: !!process.env.AWS_ACCESS_KEY_ID,
        AWS_SECRET_ACCESS_KEY: !!process.env.AWS_SECRET_ACCESS_KEY,
        S3_BUCKET_NAME: !!process.env.S3_BUCKET_NAME,
      },
    });

    // Provide more specific error feedback if possible
    const errorMessage =
      error instanceof Error ? error.message : "Unknown upload error";
    return NextResponse.json(
      { error: "Failed to upload file(s)", details: errorMessage },
      { status: 500 }
    );
  }
}

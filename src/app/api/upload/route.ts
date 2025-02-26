import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const model = formData.get("model") as string;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Forward the file to our backend
    const backendFormData = new FormData();
    backendFormData.append("file", file);
    if (model) {
      backendFormData.append("model", model);
    }

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/upload`,
      {
        method: "POST",
        body: backendFormData,
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: "Failed to upload file" },
      { status: 500 }
    );
  }
}

import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const targetName = formData.get("targetName") as string | null; // e.g. "dr-arun-shah-urologist-janakpur.jpg" for hero photo

    if (!file) {
      return NextResponse.json({ success: false, error: "No file provided" }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    let fileName = targetName;
    let targetDir = path.join(process.cwd(), "public", "uploads");

    // If updating the main hero doctor photo specifically
    if (targetName === "dr-arun-shah-urologist-janakpur.jpg") {
      targetDir = path.join(process.cwd(), "public");
      fileName = "dr-arun-shah-urologist-janakpur.jpg";
    } else if (!fileName) {
      const timestamp = Date.now();
      const cleanName = file.name.replace(/[^a-zA-Z0-9.-]/g, "-").toLowerCase();
      fileName = `${timestamp}-${cleanName}`;
    }

    try {
      if (!fs.existsSync(targetDir)) {
        fs.mkdirSync(targetDir, { recursive: true });
      }
      const filePath = path.join(targetDir, fileName);
      fs.writeFileSync(filePath, buffer);
    } catch (writeErr: unknown) {
      // In Vercel serverless environment, process.cwd() may be read-only
      const err = writeErr as { code?: string; message?: string };
      if (err.code === "EROFS" || err.code === "EACCES") {
        const tmpDir = path.join("/tmp", "uploads");
        if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true });
        fs.writeFileSync(path.join(tmpDir, fileName), buffer);
      } else {
        throw writeErr;
      }
    }

    const publicUrl = targetName === "dr-arun-shah-urologist-janakpur.jpg"
      ? `/dr-arun-shah-urologist-janakpur.jpg?v=${Date.now()}`
      : `/uploads/${fileName}`;

    return NextResponse.json({ success: true, url: publicUrl, fileName });
  } catch (error) {
    console.error("Error uploading file:", error);
    return NextResponse.json({ success: false, error: "Upload failed: Filesystem read-only on Serverless." }, { status: 500 });
  }
}

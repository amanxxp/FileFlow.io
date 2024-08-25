import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET(req) {
  const filePath = req.nextUrl.searchParams.get("filePath");

  if (!filePath) {
    return NextResponse.json({ error: "File path is required" }, { status: 400 });
  }

  const fullFilePath = path.join(process.cwd(), "public", filePath);

  try {
    const fileExists = fs.existsSync(fullFilePath);
    if (!fileExists) {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    const fileBuffer = fs.readFileSync(fullFilePath);

    return new NextResponse(fileBuffer, {
      headers: {
        "Content-Disposition": `attachment; filename=${path.basename(fullFilePath)}`,
        "Content-Type": "application/octet-stream",
      },
    });
  } catch (error) {
    return NextResponse.json({ error: "Error reading the file" }, { status: 500 });
  }
}

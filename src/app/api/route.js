import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import AdmZip from "adm-zip";



const extractZipFile = (zipFilePath, outputDir) => {
  try {
    const zip = new AdmZip(zipFilePath);
    zip.extractAllTo(outputDir, true);
    console.log(`Extracted ${zipFilePath} to ${outputDir}`);
  } catch (error) {
    console.error(`Failed to extract ${zipFilePath}:`, error);
  }
};

const readFilesRecursively = (dirPath) => {
  const files = [];

  fs.readdirSync(dirPath).forEach((file) => {
    const fullPath = path.join(dirPath, file);

    if (fs.statSync(fullPath).isDirectory()) {
      files.push(...readFilesRecursively(fullPath)); // Recursively read directories
    } else if (path.extname(fullPath) === ".zip") {
      // Extract ZIP files
      const extractDir = path.join(dirPath, path.basename(fullPath, ".zip")); // Create a directory for extracted files
      if (!fs.existsSync(extractDir)) {
        fs.mkdirSync(extractDir, { recursive: true });
      }
      extractZipFile(fullPath, extractDir);
      files.push(...readFilesRecursively(extractDir)); // Recursively read the extracted files
    } else {
      files.push(fullPath);
    }
  });

  return files;
};

export async function GET(req) {
  // Define the directory path
  const directoryPath = path.join(process.cwd(), "public/modules");
  const searchString = req.nextUrl.searchParams.get('search') || ''; // Get the search string from the query parameter

  try {
    const allFiles = readFilesRecursively(directoryPath);
    const fileContents = allFiles.map((file) => {
      const content = fs.readFileSync(file, "utf8");
      return {
        file: file.replace(`${process.cwd()}\\public`, ""), // Get relative path
        content: content,
      };
    });

    const filteredFiles = fileContents.filter((file) =>
      file.content.includes(searchString)
    );

    // Return the JSON response with filtered files
    return NextResponse.json(filteredFiles, { status: 200 });
  } catch (error) {
    // Handle errors
    return NextResponse.json({ error: "Error reading files" }, { status: 500 });
  }
}

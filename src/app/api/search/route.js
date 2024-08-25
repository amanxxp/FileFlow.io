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

const readFilesRecursively = (dirPath, fileSet, filecount, countRef) => {
  fs.readdirSync(dirPath).forEach((file) => {
    const fullPath = path.join(dirPath, file);

    if (fs.statSync(fullPath).isDirectory()) {
      readFilesRecursively(fullPath, fileSet, filecount, countRef); // Recursively read directories
    } else if (path.extname(fullPath) === ".zip") {
      const extractDir = path.join(dirPath, path.basename(fullPath, ".zip"));
      if (!fs.existsSync(extractDir)) {
        fs.mkdirSync(extractDir, { recursive: true });
      }
      extractZipFile(fullPath, extractDir);
      readFilesRecursively(extractDir, fileSet, filecount, countRef);
    } else {
      if (countRef.count >= filecount) {
        return; // Stop further processing when limit is reached
      }

      console.log({ filecount, count: countRef.count });

      if (!fileSet.has(fullPath)) {
        fileSet.add(fullPath);
        countRef.count++; // Increment the count using the reference object
      }
    }
  });
};

export async function GET(req) {
  const directoryPath = path.join(process.cwd(), "public/modules");
  const searchString = req.nextUrl.searchParams.get("search") || "";
  const page = parseInt(req.nextUrl.searchParams.get("page")) || 1;
  const limit = parseInt(req.nextUrl.searchParams.get("limit")) || 3;
  const filecount = parseInt(req.nextUrl.searchParams.get("filecount")) || 10;

  try {
    const fileSet = new Set();
    const countRef = { count: 0 };
    readFilesRecursively(directoryPath, fileSet, filecount, countRef);

    const fileContents = Array.from(fileSet).map((file) => {
      const content = fs.readFileSync(file, "utf8");
      return {
        file: file.replace(`${process.cwd()}\\public`, ""),
        content,
      };
    });

    const filteredFiles = fileContents.filter((file) =>
      file.content.includes(searchString)
    );

    // Pagination logic: slice the data to return only the relevant files
    const startIndex = (page - 1) * limit;
    const paginatedFiles = filteredFiles.slice(startIndex, startIndex + limit);

    return NextResponse.json(
      {
        files: paginatedFiles,
        totalFiles: filteredFiles.length, // Return the total number of files for pagination calculation
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json({ error: "Error reading files" }, { status: 500 });
  }
}

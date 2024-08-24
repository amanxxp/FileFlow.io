import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET(req) {
  // Define the directory path
  const directoryPath = path.join(process.cwd(), 'public/modules');

  const readFilesRecursively = (dirPath) => {
    const files = [];

    fs.readdirSync(dirPath).forEach(file => {
      const fullPath = path.join(dirPath, file);
      if (fs.statSync(fullPath).isDirectory()) {
        files.push(...readFilesRecursively(fullPath)); // Recursively read directories
      } else {
        files.push(fullPath);
      }
    });

    return files;
  };

  try {
    const allFiles = readFilesRecursively(directoryPath);
    const fileContents = allFiles.map(file => ({
      file: file.replace(`${process.cwd()}\F\public`, ''), // Get relative path
      content: fs.readFileSync(file, 'utf8') // Read file content
    }));

    // Return the JSON response with file names and contents
    return NextResponse.json(fileContents, { status: 200 });
  } catch (error) {
    // Handle errors
    return NextResponse.json({ error: 'Error reading files' }, { status: 500 });
  }
}

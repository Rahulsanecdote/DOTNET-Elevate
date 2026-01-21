'use client';

/**
 * Extracts text content from a plain text file.
 * @param file The .txt file to process.
 * @returns A promise that resolves with the extracted text content.
 */
export async function extractTextFromTxt(file: File): Promise<string> {
  if (file.type !== 'text/plain') {
    throw new Error('Invalid file type. Expected a .txt file.');
  }

  const text = await file.text();
  const trimmedText = text.trim();

  if (!trimmedText) {
    throw new Error('The uploaded .txt file is empty or contains only whitespace.');
  }

  // Normalize multiple whitespace characters into a single space
  return trimmedText.replace(/\s+/g, ' ').trim();
}

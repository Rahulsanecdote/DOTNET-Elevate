'use client';

import mammoth from 'mammoth';

/**
 * Extracts text content from a .docx file using mammoth.js.
 * @param file The .docx file to process.
 * @returns A promise that resolves with the extracted text content.
 */
export async function extractTextFromDocx(file: File): Promise<string> {
  if (file.type !== 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
    throw new Error('Invalid file type. Expected a .docx file.');
  }

  const arrayBuffer = await file.arrayBuffer();
  const result = await mammoth.extractRawText({ arrayBuffer });
  const text = result.value.trim();

  if (!text) {
    throw new Error('The uploaded .docx file is empty or contains no text.');
  }
  
  // Normalize multiple whitespace characters into a single space
  return text.replace(/\s+/g, ' ').trim();
}

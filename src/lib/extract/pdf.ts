'use client';

import * as pdfjsLib from 'pdfjs-dist';

// Set up the worker source to avoid issues with Next.js build process.
// This points to the same version of the worker as the installed library.
// Using a CDN is a reliable way to ensure the worker is available.
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;


/**
 * Extracts text content from a PDF file using pdfjs-dist.
 * @param file The .pdf file to process.
 * @returns A promise that resolves with the extracted text content.
 */
export async function extractTextFromPdf(file: File): Promise<string> {
  if (file.type !== 'application/pdf') {
    throw new Error('Invalid file type. Expected a .pdf file.');
  }

  const arrayBuffer = await file.arrayBuffer();

  // Load the PDF document
  const loadingTask = pdfjsLib.getDocument(arrayBuffer);
  const pdf = await loadingTask.promise;

  let fullText = '';

  // Iterate through each page
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();

    // Concatenate text items
    const pageText = textContent.items.map(item => ('str' in item ? item.str : '')).join(' ');
    fullText += pageText + ' ';
  }

  const trimmedText = fullText.trim();

  if (!trimmedText) {
    throw new Error('The uploaded PDF file is empty or contains no text.');
  }

  // Normalize multiple whitespace characters into a single space
  return trimmedText.replace(/\s+/g, ' ').trim();
}

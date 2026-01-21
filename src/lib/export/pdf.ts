'use client';

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { InterviewKit } from '@/lib/interviewKit/types';

// The 'jspdf-autotable' module declarations might not be perfectly aligned with the jsPDF object.
// This is a common workaround to extend the jsPDF interface to include autoTable.
declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
  }
}

export function exportKitToPdf(kit: InterviewKit) {
  const doc = new jsPDF();
  const pageMargin = 14;

  // Header
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  doc.text('.NET Elevate Interview Kit', pageMargin, 22);

  // Sub-header
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(16);
  doc.text(kit.roleTitle || 'Generated Interview Kit', pageMargin, 32);
  
  doc.setFontSize(11);
  doc.setTextColor(100); // Muted color
  doc.text(`Estimated Seniority: ${kit.seniorityGuess || 'Not Detected'}`, pageMargin, 38);
  doc.setTextColor(0); // Reset color

  // Skills
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text('Key Skills Detected:', pageMargin, 50);
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  const skillsText = doc.splitTextToSize(kit.skillsDetected.join(', '), doc.internal.pageSize.getWidth() - pageMargin * 2);
  doc.text(skillsText, pageMargin, 56);

  // Prepare data for the table
  const tableBody = kit.questions.flatMap(q => {
    // Each question is a "group" of rows in the PDF table.
    return [
      // The question itself, styled as a sub-header within the table.
      [{
        content: q.question,
        styles: { fontStyle: 'bold', fontSize: 11, fillColor: '#F5F5F5' }
      }],
      // Details row
      [{
        content: `Difficulty: ${q.difficulty} | Tags: ${q.tags.join(', ')}`,
        styles: { fontSize: 8, fontStyle: 'italic', textColor: '#777777', cellPadding: { top: 1, bottom: 2 } }
      }],
      // Answer row
      [{
        content: `Answer:\n${q.answer}`,
        styles: { fontSize: 10, cellPadding: { top: 2, bottom: 4 } }
      }],
      // Follow-ups row
      [{
        content: `Follow-ups:\n• ${q.followUps.join('\n• ')}`,
        styles: { fontSize: 10, cellPadding: { top: 2, bottom: 2 } }
      }],
      // Probe row with a separator line above it
       [{
        content: `Probe: ${q.probe}`,
        styles: { fontSize: 10, fontStyle: 'italic', cellPadding: { top: 2, bottom: 4 } }
      }]
    ];
  });

  autoTable(doc, {
    startY: 68,
    head: [['Your Personalized Interview Questions']],
    body: tableBody,
    theme: 'grid', // 'grid' theme gives nice borders
    headStyles: {
        fillColor: '#2F4F4F', // Dark slate gray
        textColor: '#FFFFFF',
        fontSize: 14,
        halign: 'center'
    },
    // We don't need column styles since we're using a single column layout
    // didParseCell is not needed if we embed styles in the body objects
  });

  // Sanitize filename
  const fileName = `Interview-Kit-${(kit.roleTitle || 'General').replace(/[^a-z0-9]/gi, '_')}.pdf`;
  doc.save(fileName);
}

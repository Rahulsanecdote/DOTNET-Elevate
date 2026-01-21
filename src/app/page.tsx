'use client';

import { useState } from 'react';
import { UploadBox } from '@/components/UploadBox';
import {
  PageHeader,
  PageHeaderDescription,
  PageHeaderText,
} from '@/components/page-header';
import { InterviewKitViewer } from '@/components/InterviewKitViewer';
import { useFirebase } from '@/firebase';

export default function InterviewKitPage() {
  const [kitId, setKitId] = useState<string | null>(null);

  // This handler will be passed to the UploadBox
  const handleKitCreated = (newKitId: string) => {
    setKitId(newKitId);
  };

  const handleReset = () => {
    setKitId(null);
  };

  if (kitId) {
    return (
      <div className="container mx-auto px-4 py-8">
        <InterviewKitViewer kitId={kitId} onReset={handleReset} />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <PageHeader>
        <PageHeaderText>AI Interview Kit Generator</PageHeaderText>
        <PageHeaderDescription>
          Upload a resume and/or job description to generate a personalized
          interview prep kit with tailored questions and answers.
        </PageHeaderDescription>
      </PageHeader>
      <UploadBox onKitCreated={handleKitCreated} />
    </div>
  );
}

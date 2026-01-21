
"use client";

import { useState } from "react";
import { UploadBox } from "@/components/UploadBox";
import {
  PageHeader,
  PageHeaderDescription,
  PageHeaderText,
} from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

// Placeholder for the results view component
const InterviewKitResults = ({ kitId, onReset }: { kitId: string, onReset: () => void }) => (
  <div className="flex flex-col items-center justify-center text-center">
    <Card className="w-full max-w-md">
      <CardHeader>
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/50">
          <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
        </div>
        <CardTitle className="mt-4">Your Kit is Ready!</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-muted-foreground">
          Your personalized interview kit has been generated.
        </p>
        <p className="font-mono text-sm bg-muted rounded-md p-2 break-all">
          Kit ID: {kitId}
        </p>
        <p className="text-xs text-muted-foreground">
          (In a real app, this view would show the generated questions and listen for real-time updates.)
        </p>
        <Button onClick={onReset} className="mt-4 w-full">Create a New Kit</Button>
      </CardContent>
    </Card>
  </div>
);

export default function InterviewKitPage() {
  const [kitId, setKitId] = useState<string | null>(null);

  if (kitId) {
    return (
      <div className="container mx-auto px-4 py-8">
        <InterviewKitResults kitId={kitId} onReset={() => setKitId(null)} />
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
      <UploadBox onKitCreated={setKitId} />
    </div>
  );
}

"use client";

import { useState } from "react";
import { reviewCodeAction } from "@/lib/actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { PageHeader, PageHeaderDescription, PageHeaderText } from "@/components/page-header";
import { Code, Loader2, TestTube2 } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const placeholderCode = `public class Calculator
{
    public int Add(string numbers)
    {
        if (string.IsNullOrEmpty(numbers))
        {
            return 0;
        }

        var parts = numbers.Split(',');
        int sum = 0;
        foreach (var part in parts)
        {
            sum += int.Parse(part);
        }
        return sum;
    }
}`;

export default function CodeReviewPage() {
  const [code, setCode] = useState(placeholderCode);
  const [feedback, setFeedback] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) {
      setError("Please enter some code to review.");
      return;
    }
    setIsLoading(true);
    setError(null);
    setFeedback("");
    try {
      const result = await reviewCodeAction({ code });
      setFeedback(result.feedback);
    } catch (err) {
      setError("Failed to get code review. Please try again.");
      console.error(err);
    }
    setIsLoading(false);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <PageHeader>
        <PageHeaderText>AI Code Reviewer</PageHeaderText>
        <PageHeaderDescription>
          Paste a .NET code snippet below to get instant feedback from an AI expert. Perfect for practice, interview prep, or on-the-job support.
        </PageHeaderDescription>
      </PageHeader>

      <div className="grid gap-8 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Your Code</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="codeSnippet">C# Code Snippet</Label>
                <Textarea
                  id="codeSnippet"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="Paste your C# code here..."
                  rows={15}
                  className="font-code text-sm"
                  disabled={isLoading}
                />
              </div>
              <Button type="submit" disabled={isLoading} className="w-full">
                {isLoading ? (
                  <Loader2 className="animate-spin" />
                ) : (
                  <TestTube2 className="mr-2" />
                )}
                Review My Code
              </Button>
              {error && <p className="text-sm text-destructive">{error}</p>}
            </form>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <h2 className="text-2xl font-bold font-headline">Expert Feedback</h2>
          {isLoading && (
            <Card className="animate-pulse p-4">
              <div className="space-y-3">
                <div className="h-4 w-3/4 rounded bg-muted"></div>
                <div className="h-4 w-full rounded bg-muted"></div>
                <div className="h-4 w-5/6 rounded bg-muted"></div>
                 <div className="h-4 w-1/2 rounded bg-muted"></div>
              </div>
            </Card>
          )}
          {!isLoading && feedback && (
            <Alert>
              <TestTube2 className="h-4 w-4" />
              <AlertTitle>Code Review Analysis</AlertTitle>
              <AlertDescription>
                <div className="prose prose-sm prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: feedback.replace(/\n/g, '<br />') }} />
              </AlertDescription>
            </Alert>
          )}
          {!isLoading && !feedback && (
            <Card className="flex h-full flex-col items-center justify-center border-dashed p-8">
              <Code className="mb-4 h-12 w-12 text-muted-foreground" />
              <p className="text-center text-muted-foreground">
                Your code review feedback will appear here.
              </p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

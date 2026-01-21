"use client";

import { useState } from "react";
import { buildStarStoryAction } from "@/lib/actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { PageHeader, PageHeaderDescription, PageHeaderText } from "@/components/page-header";
import { Loader2, Sparkles, Star } from "lucide-react";

type StarStory = {
  situation: string;
  task: string;
  action: string;
  result: string;
};

export default function StarBuilderPage() {
  const [interviewQuestion, setInterviewQuestion] = useState("Tell me about a time you faced a difficult technical challenge.");
  const [story, setStory] = useState<StarStory>({
    situation: "",
    task: "",
    action: "",
    result: "",
  });
  const [feedback, setFeedback] = useState({
    revisedStory: null,
    overallFeedback: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setStory((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      const result = await buildStarStoryAction({ interviewQuestion, ...story });
      setFeedback({
        revisedStory: {
          situation: result.revisedSituation,
          task: result.revisedTask,
          action: result.revisedAction,
          result: result.revisedResult,
        },
        overallFeedback: result.feedback,
      });
    } catch (err) {
      setError("Failed to get feedback. Please try again.");
      console.error(err);
    }
    setIsLoading(false);
  };

  const starFields: { id: keyof StarStory; label: string; placeholder: string }[] = [
    { id: 'situation', label: 'Situation', placeholder: 'Describe the context. Where and when did this happen?' },
    { id: 'task', label: 'Task', placeholder: 'What was your specific responsibility or goal?' },
    { id: 'action', label: 'Action', placeholder: 'What specific steps did YOU take to address the situation?' },
    { id: 'result', label: 'Result', placeholder: 'What was the outcome? Quantify it if possible.' },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <PageHeader>
        <PageHeaderText>Interview STAR Story Builder</PageHeaderText>
        <PageHeaderDescription>
          Craft powerful answers for behavioral interviews. Fill in the sections, and our AI will help you refine your story.
        </PageHeaderDescription>
      </PageHeader>

      <div className="grid gap-8 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Craft Your Story</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="interviewQuestion">Interview Question</Label>
                <Input
                  id="interviewQuestion"
                  value={interviewQuestion}
                  onChange={(e) => setInterviewQuestion(e.target.value)}
                  disabled={isLoading}
                />
              </div>

              {starFields.map(field => (
                <div key={field.id} className="space-y-2">
                  <Label htmlFor={field.id} className="capitalize">{field.label}</Label>
                  <Textarea
                    id={field.id}
                    name={field.id}
                    value={story[field.id]}
                    onChange={handleInputChange}
                    placeholder={field.placeholder}
                    rows={4}
                    disabled={isLoading}
                  />
                </div>
              ))}

              <Button type="submit" disabled={isLoading} className="w-full">
                {isLoading ? (
                  <Loader2 className="animate-spin" />
                ) : (
                  <Sparkles className="mr-2" />
                )}
                Get AI Feedback
              </Button>
              {error && <p className="text-sm text-destructive">{error}</p>}
            </form>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <h2 className="text-2xl font-bold font-headline">AI Feedback & Refinement</h2>
          {isLoading &&
            <Card className="animate-pulse">
              <CardHeader><div className="h-6 w-1/2 rounded bg-muted"></div></CardHeader>
              <CardContent className="space-y-4">
                <div className="h-4 w-full rounded bg-muted"></div>
                <div className="h-4 w-3/4 rounded bg-muted"></div>
                <div className="h-4 w-5/6 rounded bg-muted"></div>
              </CardContent>
            </Card>
          }
          {!isLoading && feedback.overallFeedback && (
            <Card className="bg-primary/10">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="text-primary" /> Overall Feedback
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p>{feedback.overallFeedback}</p>
              </CardContent>
            </Card>
          )}

          {!isLoading && !feedback.overallFeedback && (
             <Card className="flex h-full flex-col items-center justify-center border-dashed p-8">
              <Star className="mb-4 h-12 w-12 text-muted-foreground" />
              <p className="text-center text-muted-foreground">
                Your AI feedback will appear here.
              </p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

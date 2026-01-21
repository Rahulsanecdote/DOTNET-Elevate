"use client";

import { useState } from "react";
import { generateFlashcardsAction } from "@/lib/actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { PageHeader, PageHeaderDescription, PageHeaderText } from "@/components/page-header";
import { BrainCircuit, Loader2, Wand2 } from "lucide-react";

export default function FlashcardsPage() {
  const [lessonContent, setLessonContent] = useState("");
  const [flashcards, setFlashcards] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lessonContent.trim()) {
      setError("Please enter some lesson content.");
      return;
    }
    setIsLoading(true);
    setError(null);
    setFlashcards([]);
    try {
      const result = await generateFlashcardsAction({ lessonContent });
      setFlashcards(result.flashcards);
    } catch (err) {
      setError("Failed to generate flashcards. Please try again.");
      console.error(err);
    }
    setIsLoading(false);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <PageHeader>
        <PageHeaderText>AI-Powered Flashcards</PageHeaderText>
        <PageHeaderDescription>
          Paste your lesson notes or any .NET topic, and our AI will generate spaced repetition flashcards to supercharge your learning.
        </PageHeaderDescription>
      </PageHeader>

      <div className="grid gap-8 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Generate Flashcards</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="lessonContent">Lesson Content or Topic</Label>
                <Textarea
                  id="lessonContent"
                  value={lessonContent}
                  onChange={(e) => setLessonContent(e.target.value)}
                  placeholder="e.g., Explain the difference between `IEnumerable` and `IQueryable` in Entity Framework Core..."
                  rows={10}
                  className="font-code"
                  disabled={isLoading}
                />
              </div>
              <Button type="submit" disabled={isLoading} className="w-full">
                {isLoading ? (
                  <Loader2 className="animate-spin" />
                ) : (
                  <Wand2 className="mr-2" />
                )}
                Generate
              </Button>
              {error && <p className="text-sm text-destructive">{error}</p>}
            </form>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <h2 className="text-2xl font-bold font-headline">Generated Questions</h2>
          {isLoading && (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <Card key={i} className="flex animate-pulse items-center space-x-4 p-4">
                  <BrainCircuit className="h-6 w-6 text-muted-foreground" />
                  <div className="h-4 w-3/4 rounded bg-muted"></div>
                </Card>
              ))}
            </div>
          )}
          {!isLoading && flashcards.length > 0 && (
            <div className="space-y-4">
              {flashcards.map((card, index) => (
                <Card key={index} className="transform transition-transform duration-300 hover:scale-105">
                  <CardContent className="p-4">
                    <p className="text-lg">{card}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
          {!isLoading && flashcards.length === 0 && (
            <Card className="flex h-full flex-col items-center justify-center border-dashed p-8">
              <BrainCircuit className="mb-4 h-12 w-12 text-muted-foreground" />
              <p className="text-center text-muted-foreground">
                Your flashcard questions will appear here.
              </p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

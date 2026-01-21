"use client";

import { useState } from "react";
import { tailorResumeAction } from "@/lib/actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { PageHeader, PageHeaderDescription, PageHeaderText } from "@/components/page-header";
import { FileText, Loader2, Sparkles } from "lucide-react";

export default function ResumeTailorPage() {
  const [jobDescription, setJobDescription] = useState("");
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setResumeFile(file);
      setFileName(file.name);
    }
  };

  const fileToDataUri = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!jobDescription.trim() || !resumeFile) {
      setError("Please provide both a resume and a job description.");
      return;
    }
    setIsLoading(true);
    setError(null);
    setSuggestions([]);

    try {
      const resumeDataUri = await fileToDataUri(resumeFile);
      const result = await tailorResumeAction({
        resumeDataUri,
        jobDescription,
      });
      setSuggestions(result.tailoredResumeSuggestions);
    } catch (err) {
      setError("Failed to generate suggestions. Please try again.");
      console.error(err);
    }
    setIsLoading(false);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <PageHeader>
        <PageHeaderText>Resume Tailoring Assistant</PageHeaderText>
        <PageHeaderDescription>
          Upload your resume and paste a job description to get AI-powered suggestions for making your application stand out.
        </PageHeaderDescription>
      </PageHeader>

      <div className="grid gap-8 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Analyze Your Match</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="resumeFile">Upload Resume (PDF or DOCX)</Label>
                <Input id="resumeFile" type="file" accept=".pdf,.docx" onChange={handleFileChange} disabled={isLoading} />
                 {fileName && <p className="text-sm text-muted-foreground">Uploaded: {fileName}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="jobDescription">Job Description</Label>
                <Textarea
                  id="jobDescription"
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  placeholder="Paste the full job description here..."
                  rows={12}
                  className="font-sans"
                  disabled={isLoading}
                />
              </div>
              <Button type="submit" disabled={isLoading} className="w-full">
                {isLoading ? (
                  <Loader2 className="animate-spin" />
                ) : (
                  <Sparkles className="mr-2" />
                )}
                Get Suggestions
              </Button>
              {error && <p className="text-sm text-destructive">{error}</p>}
            </form>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <h2 className="text-2xl font-bold font-headline">AI Suggestions</h2>
          {isLoading && (
             <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <Card key={i} className="flex animate-pulse items-start space-x-4 p-4">
                  <Sparkles className="h-5 w-5 flex-shrink-0 text-muted-foreground" />
                  <div className="w-full space-y-2">
                    <div className="h-4 w-3/4 rounded bg-muted"></div>
                    <div className="h-4 w-1/2 rounded bg-muted"></div>
                  </div>
                </Card>
              ))}
            </div>
          )}
          {!isLoading && suggestions.length > 0 && (
            <div className="space-y-4">
              {suggestions.map((suggestion, index) => (
                <Card key={index} className="transform transition-transform duration-300 hover:bg-card/90">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                       <Sparkles className="mt-1 h-4 w-4 flex-shrink-0 text-primary" />
                       <p>{suggestion}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
          {!isLoading && suggestions.length === 0 && (
            <Card className="flex h-full flex-col items-center justify-center border-dashed p-8">
              <FileText className="mb-4 h-12 w-12 text-muted-foreground" />
              <p className="text-center text-muted-foreground">
                Your resume suggestions will appear here.
              </p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

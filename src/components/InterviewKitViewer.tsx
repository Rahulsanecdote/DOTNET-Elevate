'use client';

import { useState, useEffect } from 'react';
import { useFirebase } from '@/firebase';
import { listenToInterviewKit } from '@/lib/interviewKit/firestore';
import type { InterviewKit, Question } from '@/lib/interviewKit/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertCircle, CheckCircle, Copy, Loader2, ServerCrash, Sparkles } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { cn } from '@/lib/utils';

interface InterviewKitViewerProps {
  kitId: string;
  onReset: () => void;
}

const DifficultyBadge = ({ difficulty }: { difficulty: Question['difficulty'] }) => {
    const colorMap = {
        easy: 'bg-green-500/20 text-green-400 border-green-500/30',
        medium: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
        hard: 'bg-red-500/20 text-red-400 border-red-500/30',
    };
    return <Badge variant="outline" className={cn('capitalize', colorMap[difficulty])}>{difficulty}</Badge>
};

function QuestionCard({ question }: { question: Question }) {
    const { toast } = useToast();

    const handleCopy = (text: string, type: string) => {
        navigator.clipboard.writeText(text);
        toast({
            title: `${type} Copied!`,
            description: `The ${type.toLowerCase()} has been copied to your clipboard.`,
        });
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>{question.question}</CardTitle>
                <div className="flex flex-wrap gap-2 pt-2">
                    <DifficultyBadge difficulty={question.difficulty} />
                    {question.tags.map(tag => <Badge key={tag} variant="secondary">{tag}</Badge>)}
                </div>
            </CardHeader>
            <CardContent>
                <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value="answer">
                        <AccordionTrigger>View Suggested Answer</AccordionTrigger>
                        <AccordionContent className="prose prose-sm dark:prose-invert max-w-none space-y-4">
                            <p>{question.answer}</p>
                            <Button size="sm" variant="outline" onClick={() => handleCopy(question.answer, 'Answer')}>
                                <Copy className="mr-2"/> Copy Answer
                            </Button>
                        </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="followups">
                        <AccordionTrigger>View Follow-up Questions</AccordionTrigger>
                        <AccordionContent>
                            <ul className="list-disc space-y-2 pl-5">
                                {question.followUps.map((fu, i) => <li key={i}>{fu}</li>)}
                            </ul>
                        </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="probe">
                        <AccordionTrigger>View Probe Question</AccordionTrigger>
                        <AccordionContent>
                            <p className="italic">{question.probe}</p>
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>
            </CardContent>
        </Card>
    );
}


function LoadingState() {
    return (
         <div className="flex flex-col items-center justify-center text-center">
            <Card className="w-full max-w-md p-6">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                  <Loader2 className="h-6 w-6 text-primary animate-spin" />
                </div>
                <CardTitle className="mt-4">Generating Your Kit...</CardTitle>
                <CardDescription className="mt-2">
                    Our AI is analyzing your documents and crafting tailored questions. This may take a moment.
                </CardDescription>
                <div className="mt-6 space-y-3">
                    <Skeleton className="h-6 w-3/4 mx-auto" />
                    <Skeleton className="h-4 w-1/2 mx-auto" />
                    <Skeleton className="h-4 w-2/3 mx-auto" />
                </div>
            </Card>
        </div>
    );
}

export function InterviewKitViewer({ kitId, onReset }: InterviewKitViewerProps) {
  const { firestore, user } = useFirebase();
  const [kit, setKit] = useState<InterviewKit | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!firestore || !user?.uid || !kitId) return;

    const unsubscribe = listenToInterviewKit(firestore, user.uid, kitId, (data) => {
        if (data) {
            setKit(data);
            if(data.status === 'error') {
                setError(data.errorMessage || 'An unknown error occurred during generation.');
            }
        } else {
            setError("Could not find the requested interview kit.");
        }
    });

    return () => unsubscribe();
  }, [firestore, user, kitId]);


  if (error) {
    return (
         <div className="flex flex-col items-center justify-center text-center">
            <Card className="w-full max-w-md">
                 <CardHeader>
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
                        <ServerCrash className="h-6 w-6 text-destructive" />
                    </div>
                    <CardTitle className="mt-4">Generation Failed</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertTitle>Error</AlertTitle>
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                    <Button onClick={onReset} className="mt-4 w-full" variant="secondary">
                        Try Again
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
  }

  if (!kit || kit.status === 'processing') {
    return <LoadingState />;
  }

  return (
    <div className="space-y-8">
        <div className="text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/50 mb-4">
              <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <h1 className="text-3xl font-bold font-headline">Your Kit is Ready!</h1>
            <p className="text-muted-foreground mt-2 max-w-2xl mx-auto">
                Here is your personalized interview kit for a <span className="font-bold text-primary">{kit.roleTitle || 'detected role'}</span> role, estimated at a <span className="font-bold text-primary">{kit.seniorityGuess || 'detected'}</span> level.
            </p>
        </div>

        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><Sparkles /> Key Skills Detected</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2">
                {kit.skillsDetected.map(skill => <Badge key={skill}>{skill}</Badge>)}
            </CardContent>
        </Card>

        <div className="space-y-4">
            <h2 className="text-2xl font-bold font-headline text-center">Generated Questions</h2>
            {kit.questions.map((q, i) => <QuestionCard key={i} question={q} />)}
        </div>

        <div className="text-center pt-4">
             <Button onClick={onReset} variant="outline">Create a New Kit</Button>
        </div>
    </div>
  );
}

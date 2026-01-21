import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import {
  BookOpen,
  Briefcase,
  Lightbulb,
  FileText,
  Rocket,
  BrainCircuit,
  Code,
  Star,
} from 'lucide-react';
import { PageHeader, PageHeaderDescription, PageHeaderText } from '@/components/page-header';

const features = [
  {
    title: 'Learning Roadmap',
    description: 'Follow a structured path from .NET fundamentals to advanced architecture patterns.',
    href: '/learn',
    icon: <BookOpen className="mb-4 h-8 w-8 text-accent" />,
  },
  {
    title: 'AI Flashcards',
    description: 'Reinforce knowledge with spaced repetition flashcards generated from your lessons.',
    href: '/learn/flashcards',
    icon: <BrainCircuit className="mb-4 h-8 w-8 text-accent" />,
  },
  {
    title: 'Job Tracker',
    description: 'Manage your job applications, contacts, and communications in one place.',
    href: '/jobs',
    icon: <Briefcase className="mb-4 h-8 w-8 text-accent" />,
  },
  {
    title: 'Resume Tailor',
    description: 'Optimize your resume for each job description with AI-powered suggestions.',
    href: '/jobs/resume-tailor',
    icon: <FileText className="mb-4 h-8 w-8 text-accent" />,
  },
  {
    title: 'STAR Story Builder',
    description: 'Craft compelling stories for behavioral interviews and get AI feedback.',
    href: '/interview/star-builder',
    icon: <Star className="mb-4 h-8 w-8 text-accent" />,
  },
  {
    title: 'AI Code Reviewer',
    description: 'Get expert feedback on your code to sharpen your C# and .NET skills.',
    href: '/work/code-review',
    icon: <Code className="mb-4 h-8 w-8 text-accent" />,
  },
];

export default function DashboardPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <PageHeader>
        <PageHeaderText>Welcome to .NET Elevate</PageHeaderText>
        <PageHeaderDescription>
          Your AI-powered copilot for mastering .NET and accelerating your career.
        </PageHeaderDescription>
      </PageHeader>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {features.map((feature) => (
          <Card key={feature.href} className="flex transform flex-col transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-primary/20">
            <CardHeader>
              <div className="flex items-start justify-between">
                {feature.icon}
                <Rocket className="h-6 w-6 text-muted-foreground/50" />
              </div>
              <CardTitle className="font-headline text-xl">{feature.title}</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-grow flex-col justify-between">
              <p className="mb-6 text-muted-foreground">{feature.description}</p>
              <Button asChild className="mt-auto w-full">
                <Link href={feature.href}>Get Started</Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

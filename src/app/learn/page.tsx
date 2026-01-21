import { PageHeader, PageHeaderDescription, PageHeaderText } from '@/components/page-header';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2 } from 'lucide-react';

const roadmapSections = [
  {
    title: 'C# Fundamentals',
    topics: ['Variables & Data Types', 'Control Flow', 'Methods', 'Classes & Objects', 'Exception Handling'],
  },
  {
    title: 'Object-Oriented Programming (OOP)',
    topics: ['Inheritance', 'Polymorphism', 'Encapsulation', 'Abstraction', 'Interfaces'],
  },
  {
    title: 'Advanced C#',
    topics: ['LINQ', 'Async/Await', 'Events & Delegates', 'Generics', 'Attributes & Reflection'],
  },
  {
    title: 'Web APIs with ASP.NET Core',
    topics: ['MVC vs. Minimal APIs', 'Routing', 'Model Binding & Validation', 'Dependency Injection', 'Middleware'],
  },
  {
    title: 'Data Access with Entity Framework Core',
    topics: ['DbContext & DbSets', 'Migrations', 'Querying Data', 'Saving Data', 'Relationships'],
  },
  {
    title: 'Testing',
    topics: ['Unit Testing with xUnit', 'Integration Testing', 'Mocking with Moq', 'Test-Driven Development (TDD)'],
  },
  {
    title: 'Authentication & Authorization',
    topics: ['ASP.NET Core Identity', 'JWT Bearer Tokens', 'Role-based & Policy-based Auth', 'OAuth & OpenID Connect'],
  },
  {
    title: 'Cloud & DevOps with Azure',
    topics: ['Azure App Service', 'Azure SQL Database', 'CI/CD with GitHub Actions', 'Docker Basics'],
  },
  {
    title: 'Architecture & Performance',
    topics: ['Clean Architecture', 'CQRS & MediatR', 'Caching Strategies', 'Performance Profiling'],
  },
];

export default function LearnPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <PageHeader>
        <PageHeaderText>.NET Learning Roadmap</PageHeaderText>
        <PageHeaderDescription>
          Your structured path to becoming a job-ready .NET developer. Complete lessons, practice, and track your progress.
        </PageHeaderDescription>
      </PageHeader>

      <div className="max-w-4xl mx-auto">
        <Accordion type="single" collapsible className="w-full">
          {roadmapSections.map((section, index) => (
            <AccordionItem value={`item-${index}`} key={section.title}>
              <AccordionTrigger className="text-xl font-headline hover:no-underline">
                <div className="flex items-center gap-4">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold">{index + 1}</span>
                  {section.title}
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <ul className="ml-4 list-none space-y-3 py-4">
                  {section.topics.map((topic) => (
                    <li key={topic} className="flex items-center gap-3">
                      <CheckCircle2 className="h-5 w-5 text-green-500" />
                      <span className="text-base text-muted-foreground">{topic}</span>
                    </li>
                  ))}
                </ul>
                <Badge variant="outline" className="ml-4">
                  {Math.floor(Math.random() * 5)}/5 Topics Completed
                </Badge>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </div>
  );
}

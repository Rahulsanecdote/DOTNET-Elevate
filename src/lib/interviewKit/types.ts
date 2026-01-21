'use client';

import { z } from 'zod';
import { Timestamp } from 'firebase/firestore';

// Zod schema for a single interview question
export const QuestionSchema = z.object({
  question: z.string(),
  answer: z.string(),
  followUps: z.array(z.string()),
  probe: z.string(),
  tags: z.array(z.string()),
  difficulty: z.enum(['easy', 'medium', 'hard']),
});

// Zod schema for the entire InterviewKit document
export const InterviewKitSchema = z.object({
  id: z.string().optional(), // ID is added on the client after retrieval
  sourceType: z.enum(['resume', 'jobDescription', 'both']),
  roleTitle: z.string().nullable(),
  seniorityGuess: z.string().nullable(),
  skillsDetected: z.array(z.string()),
  resumeText: z.string().optional(),
  jdText: z.string().optional(),
  resumeFileUrl: z.string().url().optional(),
  jdFileUrl: z.string().url().optional(),
  questions: z.array(QuestionSchema),
  status: z.enum(['processing', 'ready', 'error']),
  errorMessage: z.string().optional(),
  inputHash: z.string(),
  createdAt: z.custom<Timestamp>(v => v instanceof Timestamp, 'Must be a Firestore Timestamp').optional(),
  updatedAt: z.custom<Timestamp>(v => v instanceof Timestamp, 'Must be a Firestore Timestamp').optional(),
});

// TypeScript types inferred from the Zod schemas
export type Question = z.infer<typeof QuestionSchema>;
export type InterviewKit = z.infer<typeof InterviewKitSchema>;

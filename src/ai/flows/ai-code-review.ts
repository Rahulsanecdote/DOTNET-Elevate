'use server';

/**
 * @fileOverview Provides AI-powered code review for .NET code snippets.
 *
 * - aiCodeReview - A function that takes .NET code as input and returns feedback to improve coding skills.
 * - AiCodeReviewInput - The input type for the aiCodeReview function.
 * - AiCodeReviewOutput - The return type for the aiCodeReview function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AiCodeReviewInputSchema = z.object({
  code: z
    .string()
    .describe('The .NET code snippet to be reviewed.'),
});
export type AiCodeReviewInput = z.infer<typeof AiCodeReviewInputSchema>;

const AiCodeReviewOutputSchema = z.object({
  feedback: z
    .string()
    .describe('Feedback on the code, highlighting areas for improvement in .NET coding skills.'),
});
export type AiCodeReviewOutput = z.infer<typeof AiCodeReviewOutputSchema>;

export async function aiCodeReview(input: AiCodeReviewInput): Promise<AiCodeReviewOutput> {
  return aiCodeReviewFlow(input);
}

const prompt = ai.definePrompt({
  name: 'aiCodeReviewPrompt',
  input: {schema: AiCodeReviewInputSchema},
  output: {schema: AiCodeReviewOutputSchema},
  prompt: `You are a senior .NET developer reviewing code submitted by a learner.

  Provide feedback on the following .NET code snippet, focusing on areas for improvement in .NET coding skills.  Be specific and actionable.

  Code:
  {{code}}`,
});

const aiCodeReviewFlow = ai.defineFlow(
  {
    name: 'aiCodeReviewFlow',
    inputSchema: AiCodeReviewInputSchema,
    outputSchema: AiCodeReviewOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);

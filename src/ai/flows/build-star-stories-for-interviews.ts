'use server';

/**
 * @fileOverview A flow for building STAR stories for behavioral interviews.
 *
 * - buildStarStory - A function that guides users through building compelling STAR stories.
 * - BuildStarStoryInput - The input type for the buildStarStory function.
 * - BuildStarStoryOutput - The return type for the buildStarStory function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const BuildStarStoryInputSchema = z.object({
  interviewQuestion: z
    .string()
    .describe('The behavioral interview question to answer.'),
  situation: z.string().optional().describe('The situation of the story.'),
  task: z.string().optional().describe('The task you faced.'),
  action: z.string().optional().describe('The actions you took.'),
  result: z.string().optional().describe('The result of your actions.'),
});
export type BuildStarStoryInput = z.infer<typeof BuildStarStoryInputSchema>;

const BuildStarStoryOutputSchema = z.object({
  revisedSituation: z
    .string()
    .describe('The revised situation of the story.'),
  revisedTask: z.string().describe('The revised task you faced.'),
  revisedAction: z.string().describe('The revised actions you took.'),
  revisedResult: z.string().describe('The revised result of your actions.'),
  feedback: z
    .string()
    .describe('AI-driven feedback on the overall STAR story.'),
});
export type BuildStarStoryOutput = z.infer<typeof BuildStarStoryOutputSchema>;

export async function buildStarStory(
  input: BuildStarStoryInput
): Promise<BuildStarStoryOutput> {
  return buildStarStoryFlow(input);
}

const buildStarStoryPrompt = ai.definePrompt({
  name: 'buildStarStoryPrompt',
  input: {schema: BuildStarStoryInputSchema},
  output: {schema: BuildStarStoryOutputSchema},
  prompt: `You are an expert career coach specializing in helping candidates craft compelling STAR stories for behavioral interviews.  A candidate will provide you with an interview question and the current state of their STAR story (situation, task, action, and result).

  Your job is to help them refine each component of the STAR story and provide overall feedback.

  Interview Question: {{{interviewQuestion}}}

  Situation: {{{situation}}}
  Task: {{{task}}}
  Action: {{{action}}}
  Result: {{{result}}}

  Revised Situation:
  Revised Task:
  Revised Action:
  Revised Result:
  Feedback:`, // TODO: update prompt to provide feedback and revise the story elements
});

const buildStarStoryFlow = ai.defineFlow(
  {
    name: 'buildStarStoryFlow',
    inputSchema: BuildStarStoryInputSchema,
    outputSchema: BuildStarStoryOutputSchema,
  },
  async input => {
    const {output} = await buildStarStoryPrompt(input);
    return output!;
  }
);

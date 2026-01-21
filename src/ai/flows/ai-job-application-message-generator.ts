'use server';

/**
 * @fileOverview This file defines a Genkit flow for generating job application messages using AI.
 *
 * It includes functions for:
 * - Generating initial outreach messages to recruiters.
 * - Generating follow-up messages.
 * - Allowing users to specify whether conversations should be saved.
 *
 * @exports generateJobApplicationMessage - The main function to generate job application messages.
 * @exports JobApplicationMessageInput - The input type for the generateJobApplicationMessage function.
 * @exports JobApplicationMessageOutput - The output type for the generateJobApplicationMessage function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const JobApplicationMessageInputSchema = z.object({
  messageType: z.enum(['initialOutreach', 'followUp']).describe('The type of message to generate: initial outreach or follow-up.'),
  jobDescription: z.string().describe('The job description for the role.'),
  resume: z.string().describe('The job seeker\u2019s resume.'),
  conversationHistory: z.string().optional().describe('The previous conversation history, if any.'),
  doNotSaveConversation: z.boolean().optional().describe('Whether the conversation should be saved. Defaults to false.'),
  additionalInstructions: z.string().optional().describe('Any additional instructions for the AI.'),
});

export type JobApplicationMessageInput = z.infer<typeof JobApplicationMessageInputSchema>;

const JobApplicationMessageOutputSchema = z.object({
  message: z.string().describe('The generated job application message.'),
});

export type JobApplicationMessageOutput = z.infer<typeof JobApplicationMessageOutputSchema>;


export async function generateJobApplicationMessage(input: JobApplicationMessageInput): Promise<JobApplicationMessageOutput> {
  return jobApplicationMessageFlow(input);
}

const jobApplicationMessagePrompt = ai.definePrompt({
  name: 'jobApplicationMessagePrompt',
  input: {schema: JobApplicationMessageInputSchema},
  output: {schema: JobApplicationMessageOutputSchema},
  prompt: `You are an AI assistant specialized in generating job application messages.

You will receive a job description, a resume, and the type of message to generate (initial outreach or follow-up).

Based on this information, generate a compelling and tailored message.

Job Description: {{{jobDescription}}}
Resume: {{{resume}}}
MessageType: {{{messageType}}}

{{#if conversationHistory}}
Conversation History: {{{conversationHistory}}}
{{/if}}

{{#if additionalInstructions}}
Additional Instructions: {{{additionalInstructions}}}
{{/if}}

Message:
`,
});

const jobApplicationMessageFlow = ai.defineFlow(
  {
    name: 'jobApplicationMessageFlow',
    inputSchema: JobApplicationMessageInputSchema,
    outputSchema: JobApplicationMessageOutputSchema,
  },
  async input => {
    const {output} = await jobApplicationMessagePrompt(input);
    return output!;
  }
);

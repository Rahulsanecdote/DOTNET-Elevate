'use server';

/**
 * @fileOverview A flow to tailor a resume for a given job description.
 *
 * - tailorResumeForJobDescription - A function that handles the resume tailoring process.
 * - TailorResumeForJobDescriptionInput - The input type for the tailorResumeForJobDescription function.
 * - TailorResumeForJobDescriptionOutput - The return type for the tailorResumeForJobDescription function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const TailorResumeForJobDescriptionInputSchema = z.object({
  resumeDataUri: z
    .string()
    .describe(
      "A resume as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  jobDescription: z.string().describe('The job description to tailor the resume for.'),
});
export type TailorResumeForJobDescriptionInput = z.infer<typeof TailorResumeForJobDescriptionInputSchema>;

const TailorResumeForJobDescriptionOutputSchema = z.object({
  tailoredResumeSuggestions: z.array(z.string()).describe('Suggestions for tailoring the resume to the job description.'),
});
export type TailorResumeForJobDescriptionOutput = z.infer<typeof TailorResumeForJobDescriptionOutputSchema>;

export async function tailorResumeForJobDescription(input: TailorResumeForJobDescriptionInput): Promise<TailorResumeForJobDescriptionOutput> {
  return tailorResumeForJobDescriptionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'tailorResumeForJobDescriptionPrompt',
  input: {schema: TailorResumeForJobDescriptionInputSchema},
  output: {schema: TailorResumeForJobDescriptionOutputSchema},
  prompt: `You are a resume expert. Given a resume and a job description, suggest specific changes to the resume to better match the job description. Focus on quantifiable achievements and keyword optimization.

Resume:
{{media url=resumeDataUri}}

Job Description:
{{jobDescription}}

Provide a list of tailored resume suggestions. Each suggestion should be concise and actionable.
`,
});

const tailorResumeForJobDescriptionFlow = ai.defineFlow(
  {
    name: 'tailorResumeForJobDescriptionFlow',
    inputSchema: TailorResumeForJobDescriptionInputSchema,
    outputSchema: TailorResumeForJobDescriptionOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);

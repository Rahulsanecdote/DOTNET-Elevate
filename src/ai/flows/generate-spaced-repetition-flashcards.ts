'use server';
/**
 * @fileOverview Generates flashcards for spaced repetition learning from lesson content and quiz mistakes.
 *
 * - generateSpacedRepetitionFlashcards - A function that generates flashcards.
 * - GenerateSpacedRepetitionFlashcardsInput - The input type for the generateSpacedRepetitionFlashcards function.
 * - GenerateSpacedRepetitionFlashcardsOutput - The return type for the generateSpacedRepetitionFlashcards function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateSpacedRepetitionFlashcardsInputSchema = z.object({
  lessonContent: z
    .string()
    .describe('The content of the lesson from which to generate flashcards.'),
  quizMistakes: z
    .string()
    .describe(
      'A summary of the mistakes made in the quiz, to focus flashcards on weak areas.'
    )
    .optional(),
});
export type GenerateSpacedRepetitionFlashcardsInput = z.infer<
  typeof GenerateSpacedRepetitionFlashcardsInputSchema
>;

const GenerateSpacedRepetitionFlashcardsOutputSchema = z.object({
  flashcards: z
    .array(z.string())
    .describe(
      'An array of flashcard questions generated from the lesson content and quiz mistakes.'
    ),
});
export type GenerateSpacedRepetitionFlashcardsOutput = z.infer<
  typeof GenerateSpacedRepetitionFlashcardsOutputSchema
>;

export async function generateSpacedRepetitionFlashcards(
  input: GenerateSpacedRepetitionFlashcardsInput
): Promise<GenerateSpacedRepetitionFlashcardsOutput> {
  return generateSpacedRepetitionFlashcardsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateSpacedRepetitionFlashcardsPrompt',
  input: {schema: GenerateSpacedRepetitionFlashcardsInputSchema},
  output: {schema: GenerateSpacedRepetitionFlashcardsOutputSchema},
  prompt: `You are an expert educator creating flashcards for .NET developers using spaced repetition.

  Generate flashcard questions based on the following lesson content:
  {{lessonContent}}

  Focus especially on these areas where the user has made mistakes (if any):
  {{quizMistakes}}

  Output ONLY an array of flashcard questions.  The questions should be concise, and aimed at testing recall.
  Do not include any introductory or concluding text. Just the questions.

  Example:
  [
    "What is the difference between == and .Equals() in C#?",
    "Explain the purpose of the using statement in C#.",
    "What are the four pillars of OOP?"
  ]
  `,
});

const generateSpacedRepetitionFlashcardsFlow = ai.defineFlow(
  {
    name: 'generateSpacedRepetitionFlashcardsFlow',
    inputSchema: GenerateSpacedRepetitionFlashcardsInputSchema,
    outputSchema: GenerateSpacedRepetitionFlashcardsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);

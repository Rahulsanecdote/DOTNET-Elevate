"use server";

import { aiCodeReview } from "@/ai/flows/ai-code-review";
import { generateJobApplicationMessage } from "@/ai/flows/ai-job-application-message-generator";
import { buildStarStory } from "@/ai/flows/build-star-stories-for-interviews";
import { generateSpacedRepetitionFlashcards } from "@/ai/flows/generate-spaced-repetition-flashcards";
import { tailorResumeForJobDescription } from "@/ai/flows/tailor-resume-for-job-description";

import type { AiCodeReviewInput } from "@/ai/flows/ai-code-review";
import type { JobApplicationMessageInput } from "@/ai/flows/ai-job-application-message-generator";
import type { BuildStarStoryInput } from "@/ai/flows/build-star-stories-for-interviews";
import type { GenerateSpacedRepetitionFlashcardsInput } from "@/ai/flows/generate-spaced-repetition-flashcards";
import type { TailorResumeForJobDescriptionInput } from "@/ai/flows/tailor-resume-for-job-description";

export const generateFlashcardsAction = async (
  input: GenerateSpacedRepetitionFlashcardsInput
) => {
  return await generateSpacedRepetitionFlashcards(input);
};

export const tailorResumeAction = async (
  input: TailorResumeForJobDescriptionInput
) => {
  return await tailorResumeForJobDescription(input);
};

export const buildStarStoryAction = async (input: BuildStarStoryInput) => {
  return await buildStarStory(input);
};

export const reviewCodeAction = async (input: AiCodeReviewInput) => {
  return await aiCodeReview(input);
};

export const generateMessageAction = async (
  input: JobApplicationMessageInput
) => {
  return await generateJobApplicationMessage(input);
};

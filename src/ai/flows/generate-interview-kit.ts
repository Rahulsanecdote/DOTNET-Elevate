
'use server';

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

// Input schema for the interview kit generation flow
const GenerateInterviewKitInputSchema = z.object({
  resumeText: z.string().optional().describe('The sanitized text from the user\'s resume.'),
  jdText: z.string().optional().describe('The sanitized text from the job description.'),
  targetRole: z.string().optional().describe('The user\'s stated target role, e.g., "Senior .NET Developer".'),
});
export type GenerateInterviewKitInput = z.infer<typeof GenerateInterviewKitInputSchema>;

// Defines the structure for a single generated question
const QuestionSchema = z.object({
  question: z.string().describe('The interview question.'),
  answer: z.string().describe('A detailed, expert-level answer to the question.'),
  followUps: z.array(z.string()).describe('An array of 2-3 potential follow-up questions.'),
  probe: z.string().describe('A question to probe deeper into the candidate\'s understanding.'),
  tags: z.array(z.string()).describe('Relevant skill tags (e.g., "C#", "System Design", "EF Core", "Behavioral").'),
  difficulty: z.enum(['easy', 'medium', 'hard']).describe('The difficulty of the question.'),
});

// Defines the full output structure the model should generate
const GenerateInterviewKitOutputSchema = z.object({
  roleTitle: z.string().nullable().describe('The specific job role identified from the inputs, e.g., ".NET Backend Engineer".'),
  seniorityGuess: z.string().nullable().describe('The estimated seniority level, e.g., "Mid-Level", "Senior", "Principal".'),
  skillsDetected: z.array(z.string()).describe('A list of key technical skills and concepts detected in the resume and job description.'),
  questions: z.array(QuestionSchema).describe('An array of 12-15 generated interview questions.'),
});
export type GenerateInterviewKitOutput = z.infer<typeof GenerateInterviewKitOutputSchema>;

// The main exported function that wraps the Genkit flow
export async function generateInterviewKit(input: GenerateInterviewKitInput): Promise<GenerateInterviewKitOutput> {
  return generateInterviewKitFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateInterviewKitPrompt',
  input: { schema: GenerateInterviewKitInputSchema },
  output: { schema: GenerateInterviewKitOutputSchema },
  prompt: `
    You are an expert technical interviewer and career coach for .NET developers. Your task is to generate a personalized interview prep kit based on the provided resume, job description (JD), and target role.

    Analyze the following inputs:
    - Resume: {{{resumeText}}}
    - Job Description: {{{jdText}}}
    - Target Role: {{{targetRole}}}

    Based on your analysis, perform the following actions and return the output in a single, valid JSON object that conforms to the specified output schema.

    1.  **Identify Role and Seniority**: From the inputs, determine the specific job title (e.g., ".NET Full-Stack Developer") and estimate the seniority ("Junior", "Mid-Level", "Senior", "Lead"). If a JD is provided, it is the primary source of truth.

    2.  **Detect Key Skills**: Extract a list of the most important technical skills, frameworks, and concepts. Prioritize skills mentioned in both the resume and the JD.

    3.  **Generate Interview Questions**: Create a list of 12-15 high-quality questions with the following distribution:
        -   **50% Role-Specific/Technical**: Questions that directly test the skills you detected (e.g., "Explain the difference between IQueryable and IEnumerable in Entity Framework Core.", "How would you implement a resilient API client in C# using Polly?").
        -   **30% Behavioral (STAR format)**: Questions that probe past experiences, tailored to the role (e.g., "Tell me about a time you had to optimize a slow database query. What was the situation, task, action, and result?").
        -   **20% System Design/Architecture**: High-level questions appropriate for the seniority (e.g., "Design a scalable notification system for a microservices architecture.", "How would you approach migrating a legacy .NET Framework monolith to .NET 8?").

    For each question, you MUST provide all fields specified in the output schema: \`question\`, a detailed expert \`answer\`, an array of \`followUps\`, a \`probe\` question, relevant \`tags\`, and a \`difficulty\`.

    Produce ONLY the JSON object as your final output. Do not include any introductory text, markdown formatting, or explanations.
  `,
});

const generateInterviewKitFlow = ai.defineFlow(
  {
    name: 'generateInterviewKitFlow',
    inputSchema: GenerateInterviewKitInputSchema,
    outputSchema: GenerateInterviewKitOutputSchema,
  },
  async (input) => {
    // In a more complex scenario, you could add pre-processing or tool calls here.
    // For this use case, we directly call the prompt with the validated input.
    const { output } = await prompt(input);
    return output!;
  }
);

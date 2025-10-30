'use server';
/**
 * @fileOverview AI-powered FAQ flow.
 *
 * This file defines a Genkit flow that answers frequently asked questions
 * about the platform, teams, and hackathons.
 *
 * @exports aiMentorFaq - The main function to answer FAQs.
 */

import {ai} from '@/ai/genkit';
import {
  AIMentorFaqInputSchema,
  AIMentorFaqOutputSchema,
  type AIMentorFaqInput,
  type AIMentorFaqOutput,
} from '@/ai/schemas/ai-mentor-faq';

export async function aiMentorFaq(input: AIMentorFaqInput): Promise<AIMentorFaqOutput> {
  return aiMentorFaqFlow(input);
}

const aiMentorFaqPrompt = ai.definePrompt({
  name: 'aiMentorFaqPrompt',
  input: {schema: AIMentorFaqInputSchema},
  output: {schema: AIMentorFaqOutputSchema},
  prompt: `You are an AI mentor for a campus collaboration platform called Nexus Teams. Your role is to answer user questions clearly and concisely.

You have access to information about users, teams, and hackathons.

User question: "{{query}}"

Based on the question, provide a helpful answer. If the question is about team suggestions, you should tell them you can help with that and ask them to confirm. If it is about something you cannot answer, politely say so.
`,
});

const aiMentorFaqFlow = ai.defineFlow(
  {
    name: 'aiMentorFaqFlow',
    inputSchema: AIMentorFaqInputSchema,
    outputSchema: AIMentorFaqOutputSchema,
  },
  async (input) => {
    const {output} = await aiMentorFaqPrompt(input);
    return output!;
  }
);

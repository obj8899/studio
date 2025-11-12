
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
  prompt: `You are an AI mentor for a campus collaboration platform called Pulse Point. Your role is to answer user questions clearly and concisely.

You have access to information about users, teams, and hackathons.

User question: "{{query}}"

Based on the question, provide a helpful and direct answer.
- If the question is about finding teams or getting suggestions, confirm you can help and ask them to use the "Suggest Teams" button.
- If the question is about hackathons, give a brief overview of what's available.
- If the question is something you cannot answer from the context of the platform (like 'what is the meaning of life'), politely state that you can only help with questions about Pulse Point, teams, and hackathons.
- Keep your answers to 2-3 sentences.`,
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

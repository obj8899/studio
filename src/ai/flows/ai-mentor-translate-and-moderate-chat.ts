'use server';

/**
 * @fileOverview AI-powered chat translation and moderation flow.
 *
 * This file defines a Genkit flow that translates user messages into English
 * and filters out profanity, ensuring effective and respectful team communication.
 *
 * @exports aiMentorTranslateAndModerateChat - The main function to translate and moderate chat messages.
 * @exports AIMentorTranslateAndModerateChatInput - The input type for the aiMentorTranslateAndModerateChat function.
 * @exports AIMentorTranslateAndModerateChatOutput - The output type for the aiMentorTranslateAndModerateChat function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AIMentorTranslateAndModerateChatInputSchema = z.object({
  message: z.string().describe('The message to be translated and moderated.'),
});
export type AIMentorTranslateAndModerateChatInput = z.infer<
  typeof AIMentorTranslateAndModerateChatInputSchema
>;

const AIMentorTranslateAndModerateChatOutputSchema = z.object({
  translatedMessage: z
    .string()
    .describe('The translated message in English.'),
  isProfane: z.boolean().describe('Whether the message contains profanity.'),
});
export type AIMentorTranslateAndModerateChatOutput = z.infer<
  typeof AIMentorTranslateAndModerateChatOutputSchema
>;

export async function aiMentorTranslateAndModerateChat(
  input: AIMentorTranslateAndModerateChatInput
): Promise<AIMentorTranslateAndModerateChatOutput> {
  return aiMentorTranslateAndModerateChatFlow(input);
}


const aiMentorTranslateAndModerateChatPrompt = ai.definePrompt({
  name: 'aiMentorTranslateAndModerateChatPrompt',
  input: {schema: AIMentorTranslateAndModerateChatInputSchema},
  output: {schema: AIMentorTranslateAndModerateChatOutputSchema},
  prompt: `You are an AI assistant. Your tasks are to translate a given message to English and determine if it contains profanity.

Message: "{{message}}"

1.  Translate the message to English.
2.  Analyze the original message for any profane language. Set isProfane to true if profanity is found, otherwise false.

Return the translated message and the profanity flag.`,
});

const aiMentorTranslateAndModerateChatFlow = ai.defineFlow(
  {
    name: 'aiMentorTranslateAndModerateChatFlow',
    inputSchema: AIMentorTranslateAndModerateChatInputSchema,
    outputSchema: AIMentorTranslateAndModerateChatOutputSchema,
  },
  async input => {
    const {output} = await aiMentorTranslateAndModerateChatPrompt(input);
    return output!;
  }
);

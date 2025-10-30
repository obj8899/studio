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
  moderationResult: z.string().describe('Moderation result from the moderation API.'),
});
export type AIMentorTranslateAndModerateChatOutput = z.infer<
  typeof AIMentorTranslateAndModerateChatOutputSchema
>;

export async function aiMentorTranslateAndModerateChat(
  input: AIMentorTranslateAndModerateChatInput
): Promise<AIMentorTranslateAndModerateChatOutput> {
  return aiMentorTranslateAndModerateChatFlow(input);
}

const moderateText = ai.defineTool(
  {
    name: 'moderateText',
    description: 'Checks if the provided text violates the policy.',
    inputSchema: z.object({
      text: z.string().describe('The text to check.'),
    }),
    outputSchema: z.object({
      flagged: z.boolean().describe('Whether the text violates the policy.'),
      categories: z
        .record(z.boolean())
        .describe('Which categories were violated.'),
    }),
  },
  async input => {
    // TODO: Implement moderation using Perspective API or OpenAI moderation API.
    // This is a placeholder implementation.
    return {flagged: false, categories: {}}; // Replace with actual moderation logic
  }
);

const translateText = ai.defineTool(
  {
    name: 'translateText',
    description: 'Translates the given text to English.',
    inputSchema: z.object({
      text: z.string().describe('The text to translate.'),
    }),
    outputSchema: z.object({
      translatedText: z.string().describe('The translated text in English.'),
    }),
  },
  async input => {
    // TODO: Implement translation using Google Translate API, DeepL, or open-source models.
    // This is a placeholder implementation.
    return {translatedText: input.text}; // Replace with actual translation logic
  }
);

const aiMentorTranslateAndModerateChatPrompt = ai.definePrompt({
  name: 'aiMentorTranslateAndModerateChatPrompt',
  tools: [translateText, moderateText],
  input: {schema: AIMentorTranslateAndModerateChatInputSchema},
  output: {schema: AIMentorTranslateAndModerateChatOutputSchema},
  prompt: `You are an AI mentor whose responsibilities include translating messages to english and removing profanity.
  
  The user has sent you this message: "{{message}}".

  First, translate the message to English, using the translateText tool.
  Then, moderate the translated message for profanity, using the moderateText tool.
  Based on the results of the translation and moderation, determine whether the message is profane or not.
`,
});

const aiMentorTranslateAndModerateChatFlow = ai.defineFlow(
  {
    name: 'aiMentorTranslateAndModerateChatFlow',
    inputSchema: AIMentorTranslateAndModerateChatInputSchema,
    outputSchema: AIMentorTranslateAndModerateChatOutputSchema,
  },
  async input => {
    const result = await aiMentorTranslateAndModerateChatPrompt(input);
    return {
      translatedMessage: result.output!.translatedMessage,
      isProfane: result.output!.isProfane,
      moderationResult: result.output!.moderationResult,
    };
  }
);

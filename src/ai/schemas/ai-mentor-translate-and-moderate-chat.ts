import {z} from 'genkit';

export const AIMentorTranslateAndModerateChatInputSchema = z.object({
  message: z.string().describe('The message to be translated and moderated.'),
});
export type AIMentorTranslateAndModerateChatInput = z.infer<
  typeof AIMentorTranslateAndModerateChatInputSchema
>;

export const AIMentorTranslateAndModerateChatOutputSchema = z.object({
  translatedMessage: z
    .string()
    .describe('The translated message in English.'),
  isProfane: z.boolean().describe('Whether the message contains profanity.'),
});
export type AIMentorTranslateAndModerateChatOutput = z.infer<
  typeof AIMentorTranslateAndModerateChatOutputSchema
>;

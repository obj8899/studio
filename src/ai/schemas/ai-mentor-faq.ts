import {z} from 'genkit';

export const AIMentorFaqInputSchema = z.object({
  query: z.string().describe("The user's question."),
});
export type AIMentorFaqInput = z.infer<typeof AIMentorFaqInputSchema>;

export const AIMentorFaqOutputSchema = z.object({
  answer: z.string().describe("The answer to the user's question."),
});
export type AIMentorFaqOutput = z.infer<typeof AIMentorFaqOutputSchema>;

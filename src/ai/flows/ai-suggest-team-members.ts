'use server';

/**
 * @fileOverview AI-driven team member suggestion flow.
 *
 * - suggestTeamMembers - A function that suggests team members based on open roles and required skills.
 * - SuggestTeamMembersInput - The input type for the suggestTeamMembers function.
 * - SuggestTeamMembersOutput - The return type for the suggestTeamMembers function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestTeamMembersInputSchema = z.object({
  openRoles: z
    .string()
    .describe('The open roles in the team.'),
  requiredSkills: z.string().describe('The required skills for the team.'),
  teamDescription: z.string().describe('The description of the team and project'),
});
export type SuggestTeamMembersInput = z.infer<typeof SuggestTeamMembersInputSchema>;

const SuggestTeamMembersOutputSchema = z.object({
  suggestedMembers: z
    .array(z.string())
    .describe('An array of suggested team members.'),
  rationale: z.string().describe('The rationale for the suggested members.'),
});
export type SuggestTeamMembersOutput = z.infer<typeof SuggestTeamMembersOutputSchema>;

export async function suggestTeamMembers(input: SuggestTeamMembersInput): Promise<SuggestTeamMembersOutput> {
  return suggestTeamMembersFlow(input);
}

const suggestTeamMembersPrompt = ai.definePrompt({
  name: 'suggestTeamMembersPrompt',
  input: {schema: SuggestTeamMembersInputSchema},
  output: {schema: SuggestTeamMembersOutputSchema},
  prompt: `You are an AI assistant helping to suggest team members for a project.

You will be provided with the open roles, required skills, and a team description.
Based on this information, suggest a list of team members and provide a rationale for each suggestion.

Team Description: {{{teamDescription}}}
Open Roles: {{{openRoles}}}
Required Skills: {{{requiredSkills}}}

Suggestions:
{{#each suggestedMembers}}
- {{{this}}}
{{/each}}

Rationale: {{{rationale}}}`,
});

const suggestTeamMembersFlow = ai.defineFlow(
  {
    name: 'suggestTeamMembersFlow',
    inputSchema: SuggestTeamMembersInputSchema,
    outputSchema: SuggestTeamMembersOutputSchema,
  },
  async input => {
    const {output} = await suggestTeamMembersPrompt(input);
    return output!;
  }
);

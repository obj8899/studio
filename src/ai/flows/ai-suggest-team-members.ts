'use server';

/**
 * @fileOverview AI-driven team member suggestion flow.
 *
 * - suggestTeamMembers - A function that suggests team members based on open roles and required skills.
 */

import {ai} from '@/ai/genkit';
import {
    SuggestTeamMembersInputSchema,
    SuggestTeamMembersOutputSchema,
    type SuggestTeamMembersInput,
    type SuggestTeamMembersOutput
} from '@/ai/schemas/ai-suggest-team-members';

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

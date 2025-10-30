'use server';
/**
 * @fileOverview AI-driven team suggestion based on user profile.
 *
 * - suggestTeamsBasedOnProfile - A function that suggests teams based on user profile.
 */

import {ai} from '@/ai/genkit';
import {
  SuggestTeamsBasedOnProfileInputSchema,
  SuggestTeamsBasedOnProfileOutputSchema,
  type SuggestTeamsBasedOnProfileInput,
  type SuggestTeamsBasedOnProfileOutput,
} from '@/ai/schemas/suggest-teams-based-on-profile';

export async function suggestTeamsBasedOnProfile(
  input: SuggestTeamsBasedOnProfileInput
): Promise<SuggestTeamsBasedOnProfileOutput> {
  return suggestTeamsBasedOnProfileFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestTeamsBasedOnProfilePrompt',
  input: {schema: SuggestTeamsBasedOnProfileInputSchema},
  output: {schema: SuggestTeamsBasedOnProfileOutputSchema},
  prompt: `You are an AI team formation expert. Given a user's skills, passion, and availability, and a list of team profiles, suggest the best teams for the user.

User Profile:
- Skills: {{#each userSkills}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}
- Passion: {{{userPassion}}}
- Availability: {{{userAvailability}}}

Available Teams:
{{#each teamProfiles}}
- Team: {{teamName}}
  - Project: {{projectDescription}}
  - Open Roles: {{#each openRoles}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}
  - Required Skills: {{#each requiredSkills}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}
{{/each}}

Analyze the user's profile against the available teams. For each team, provide a match score from 0-100 and a concise rationale for your recommendation, explaining why the user is a good fit. Return a JSON array of your top suggestions.`,
});

const suggestTeamsBasedOnProfileFlow = ai.defineFlow(
  {
    name: 'suggestTeamsBasedOnProfileFlow',
    inputSchema: SuggestTeamsBasedOnProfileInputSchema,
    outputSchema: SuggestTeamsBasedOnProfileOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);

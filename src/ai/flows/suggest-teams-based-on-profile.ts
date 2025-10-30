'use server';
/**
 * @fileOverview AI-driven team suggestion based on user profile.
 *
 * - suggestTeamsBasedOnProfile - A function that suggests teams based on user profile.
 * - SuggestTeamsBasedOnProfileInput - The input type for the suggestTeamsBasedOnProfile function.
 * - SuggestTeamsBasedOnProfileOutput - The return type for the suggestTeamsBasedOnProfile function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestTeamsBasedOnProfileInputSchema = z.object({
  userSkills: z
    .array(z.string())
    .describe('The skills of the user requesting team suggestions.'),
  userPassion: z.string().describe('The passions of the user.'),
  userAvailability: z.string().describe('The availability of the user.'),
  teamProfiles: z
    .array(z.object({
      teamName: z.string().describe('The name of the team.'),
      projectDescription: z.string().describe('The description of the project.'),
      openRoles: z.array(z.string()).describe('The open roles in the team.'),
      requiredSkills: z.array(z.string()).describe('The required skills for the team.'),
    }))
    .describe('A list of team profiles to match the user against.'),
});
export type SuggestTeamsBasedOnProfileInput = z.infer<typeof SuggestTeamsBasedOnProfileInputSchema>;

const SuggestTeamsBasedOnProfileOutputSchema = z.array(
  z.object({
    teamName: z.string().describe('The name of the suggested team.'),
    matchScore: z.number().describe('A score indicating how well the team matches the user.'),
    rationale: z.string().describe('The rationale for suggesting this team to the user.'),
  })
);
export type SuggestTeamsBasedOnProfileOutput = z.infer<typeof SuggestTeamsBasedOnProfileOutputSchema>;

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

User Skills: {{userSkills}}
User Passion: {{userPassion}}
User Availability: {{userAvailability}}

Team Profiles:
{{#each teamProfiles}}
  Team Name: {{teamName}}
  Project Description: {{projectDescription}}
  Open Roles: {{openRoles}}
  Required Skills: {{requiredSkills}}
{{/each}}

For each team, provide a match score (0-100) and a rationale for why the team is a good fit for the user. Return a json array.`,
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

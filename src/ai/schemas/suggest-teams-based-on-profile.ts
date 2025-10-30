import {z}from 'genkit';

export const SuggestTeamsBasedOnProfileInputSchema = z.object({
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

export const SuggestTeamsBasedOnProfileOutputSchema = z.array(
  z.object({
    teamName: z.string().describe('The name of the suggested team.'),
    matchScore: z.number().describe('A score from 0 to 100 indicating how well the team matches the user. 100 is a perfect match.'),
    rationale: z.string().describe('The rationale for suggesting this team to the user.'),
  })
);
export type SuggestTeamsBasedOnProfileOutput = z.infer<typeof SuggestTeamsBasedOnProfileOutputSchema>;

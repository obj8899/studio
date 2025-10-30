import {z} from 'genkit';

export const SuggestTeamMembersInputSchema = z.object({
  openRoles: z
    .string()
    .describe('The open roles in the team.'),
  requiredSkills: z.string().describe('The required skills for the team.'),
  teamDescription: z.string().describe('The description of the team and project'),
});
export type SuggestTeamMembersInput = z.infer<typeof SuggestTeamMembersInputSchema>;

export const SuggestTeamMembersOutputSchema = z.object({
  suggestedMembers: z
    .array(z.string())
    .describe('An array of suggested team members.'),
  rationale: z.string().describe('The rationale for the suggested members.'),
});
export type SuggestTeamMembersOutput = z.infer<typeof SuggestTeamMembersOutputSchema>;

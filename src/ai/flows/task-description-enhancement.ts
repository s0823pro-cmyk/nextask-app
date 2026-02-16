'use server';
/**
 * @fileOverview A Genkit flow for enhancing brief task descriptions into detailed descriptions and suggesting subtasks.
 *
 * - taskDescriptionEnhancement - A function that handles the task description enhancement process.
 * - TaskDescriptionEnhancementInput - The input type for the taskDescriptionEnhancement function.
 * - TaskDescriptionEnhancementOutput - The return type for the taskDescriptionEnhancement function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const TaskDescriptionEnhancementInputSchema = z.object({
  briefDescription: z
    .string()
    .describe('A brief title or description of a task.'),
});
export type TaskDescriptionEnhancementInput = z.infer<
  typeof TaskDescriptionEnhancementInputSchema
>;

const TaskDescriptionEnhancementOutputSchema = z.object({
  detailedDescription: z
    .string()
    .describe('A more detailed and elaborated description of the task.'),
  subtasks: z
    .array(z.string())
    .describe('An array of suggested subtasks related to the main task.'),
});
export type TaskDescriptionEnhancementOutput = z.infer<
  typeof TaskDescriptionEnhancementOutputSchema
>;

export async function taskDescriptionEnhancement(
  input: TaskDescriptionEnhancementInput
): Promise<TaskDescriptionEnhancementOutput> {
  return taskDescriptionEnhancementFlow(input);
}

const prompt = ai.definePrompt({
  name: 'taskDescriptionEnhancementPrompt',
  input: {schema: TaskDescriptionEnhancementInputSchema},
  output: {schema: TaskDescriptionEnhancementOutputSchema},
  prompt: `You are an AI assistant specialized in task management. Your goal is to take a brief task description and expand it into a more detailed explanation, as well as suggest relevant subtasks to help complete it.

Brief Task Description: "{{{briefDescription}}}"

Based on the brief description, provide a detailed description and a list of actionable subtasks.`,
});

const taskDescriptionEnhancementFlow = ai.defineFlow(
  {
    name: 'taskDescriptionEnhancementFlow',
    inputSchema: TaskDescriptionEnhancementInputSchema,
    outputSchema: TaskDescriptionEnhancementOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);

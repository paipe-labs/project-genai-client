import { z } from 'zod';
export const TaskZod = z.object({
    options: z.object({
        prompt: z.string(),
        model: z.string(),
        size: z.number().optional(),
        steps: z.number().optional(),
    }),
    taskId: z.string(),
});
export const TaskResultZod = z.object({
    resultsUrl: z.array(z.string()),
    taskId: z.string(),
    error: z.string().optional(),
    type: z.literal('result').or(z.literal('error')).or(z.literal('status')),
    status: z.literal('ready').or(z.literal('inProgress')),
});

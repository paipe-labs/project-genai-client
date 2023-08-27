import { z } from 'zod';

export const TaskZod = z.object({
    options: z.object({
        prompt: z.string(),
        model: z.string(),
        size: z.string().optional(),
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

export type Task = z.infer<typeof TaskZod>;

export type TaskResult = z.infer<typeof TaskResultZod>;

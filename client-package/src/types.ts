import { z } from 'zod';

export const TaskZod = z.object({
    options: z.object({
        prompt: z.string(),
        model: z.string(),
        size: z.object({
            width: z.number(),
            height: z.number()
        }).nullable(),
        steps: z.number().nullable(),
    }).nullable(),
    comfyOptions: z.object({
        pipelineData: z.string(),
        pipelineDependencies: z.object({
            images: z.string().nullable(),
        }).nullable(),
    }).nullable(),
    taskId: z.string(),
});

export const TaskResultZod = z.object({
    resultsUrl: z.array(z.string()),
    taskId: z.string(),
    error: z.string().optional(),
    type: z.literal('result').or(z.literal('error')).or(z.literal('status')),
    status: z.literal('ready').or(z.literal('inProgress')).optional(),
});

export type Task = z.infer<typeof TaskZod>;

export type TaskResult = z.infer<typeof TaskResultZod>;

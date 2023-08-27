import { z } from 'zod';
export declare const TaskZod: z.ZodObject<{
    options: z.ZodObject<{
        prompt: z.ZodString;
        model: z.ZodString;
        size: z.ZodOptional<z.ZodNumber>;
        steps: z.ZodOptional<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        prompt: string;
        model: string;
        size?: number | undefined;
        steps?: number | undefined;
    }, {
        prompt: string;
        model: string;
        size?: number | undefined;
        steps?: number | undefined;
    }>;
    taskId: z.ZodString;
}, "strip", z.ZodTypeAny, {
    options: {
        prompt: string;
        model: string;
        size?: number | undefined;
        steps?: number | undefined;
    };
    taskId: string;
}, {
    options: {
        prompt: string;
        model: string;
        size?: number | undefined;
        steps?: number | undefined;
    };
    taskId: string;
}>;
export declare const TaskResultZod: z.ZodObject<{
    resultsUrl: z.ZodArray<z.ZodString, "many">;
    taskId: z.ZodString;
    error: z.ZodOptional<z.ZodString>;
    type: z.ZodUnion<[z.ZodUnion<[z.ZodLiteral<"result">, z.ZodLiteral<"error">]>, z.ZodLiteral<"status">]>;
    status: z.ZodUnion<[z.ZodLiteral<"ready">, z.ZodLiteral<"inProgress">]>;
}, "strip", z.ZodTypeAny, {
    status: "ready" | "inProgress";
    type: "status" | "error" | "result";
    taskId: string;
    resultsUrl: string[];
    error?: string | undefined;
}, {
    status: "ready" | "inProgress";
    type: "status" | "error" | "result";
    taskId: string;
    resultsUrl: string[];
    error?: string | undefined;
}>;
export type Task = z.infer<typeof TaskZod>;
export type TaskResult = z.infer<typeof TaskResultZod>;

import { Command, Option } from 'commander';
import { zodToJsonSchema } from "zod-to-json-schema";
import type { JsonSchema7Type } from "zod-to-json-schema";

import { TaskResultZod, TaskZod } from "./types.js";

type BuildSchemaOptions = {
    object: string;
};

function parsebuildSchemaOptions(): BuildSchemaOptions {
    const program = new Command();

    program
        .addOption(new Option('-o, --object <object>', 'scheme object').choices(['task', 'taskResult']));

    program.parse(process.argv);

    const options = program.opts();
    return { object: options.object };
}

const sessionManagerOptions = parsebuildSchemaOptions();

if (sessionManagerOptions.object == "task") {
    const jsonSchema = zodToJsonSchema(TaskZod, "TaskZod");
    console.log(JSON.stringify(jsonSchema));
} else if (sessionManagerOptions.object == "taskResult") {
    const jsonSchema = zodToJsonSchema(TaskResultZod, "TaskResultZod");
    console.log(JSON.stringify(jsonSchema));
}

declare module "helpers/uuid" {
    export function uuidv4(): string;
}
declare module "helpers/prettyPrint" {
    export function prettyPrintJson(jsonString: string): string;
}
declare module "helpers/index" {
    export { uuidv4 } from "helpers/uuid";
    export { prettyPrintJson } from "helpers/prettyPrint";
}
declare module "SessionManager" {
    export class SessionManager {
        private DefualtApiAddress;
        constructor();
        setupSession(): Promise<void>;
    }
}
declare module "./index" {
    export { SessionManager } from "SessionManager";
}
declare module "run" { }

import { readFileSync } from 'node:fs';

export function importJson(pathToJsonFile) {
    return JSON.parse(readFileSync(pathToJsonFile))
}

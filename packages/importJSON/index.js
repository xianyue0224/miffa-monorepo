import { readFileSync } from 'node:fs';

export default function importJSON(pathToJsonFile) {
    return JSON.parse(readFileSync(pathToJsonFile))
}
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const distrosPath = path.join(__dirname, '..', 'config', 'distros.json');
export const SUPPORTED_DISTROS = JSON.parse(fs.readFileSync(distrosPath, 'utf8'));

export const MAX_RECORDS_TO_SEND = 100;

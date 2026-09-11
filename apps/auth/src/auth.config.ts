import dotenv from 'dotenv';
import { setupAuth } from './auth.js';
import { getConfig } from './config.js';

dotenv.config();

// ponytail: importable without starting a server, so the better-auth CLI can read it
export const appConfig = await getConfig();
export const auth = setupAuth(appConfig);

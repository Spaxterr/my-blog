import dotenv from 'dotenv';
import { setupAuth } from './auth.js';
import { getConfig } from './config.js';

dotenv.config();

export const appConfig = await getConfig();
export const auth = setupAuth(appConfig);

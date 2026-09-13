import { logger } from 'better-auth';
import { getMigrations } from 'better-auth/db/migration';
import { auth } from './auth.config.js';

const { runMigrations, toBeCreated, toBeAdded } = await getMigrations(auth.options);

if (toBeCreated.length === 0 && toBeAdded.length === 0) {
    logger.info('auth schema already up to date');
} else {
    logger.info(
        'creating tables: %s; altering: %s',
        toBeCreated.map((t) => t.table).join(', ') || 'none',
        toBeAdded.map((t) => t.table).join(', ') || 'none',
    );
    await runMigrations();
    logger.info('auth migrations complete');
}

process.exit(0);

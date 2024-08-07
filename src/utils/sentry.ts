import * as Sentry from '@sentry/node';
// import { nodeProfilingIntegration } from '@sentry/profiling-node';
import dotenv from 'dotenv';

dotenv.config();

export const initializeSentry = () => {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    // integrations: [nodeProfilingIntegration()],
    tracesSampleRate: 1.0,
    // profilesSampleRate: 1.0,
  });
};

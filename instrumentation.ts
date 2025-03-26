import * as Sentry from '@sentry/nextjs';

export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    await import('./apps/frontend/sentry.server.config');
  }

  if (process.env.NEXT_RUNTIME === 'edge') {
    await import('./apps/frontend/sentry.edge.config');
  }
}

export const onRequestError = Sentry.captureRequestError;

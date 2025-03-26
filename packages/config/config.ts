export const config = {
  NODE_ENV: process.env.NODE_ENV,
  IS_PROD: process.env.NODE_ENV === "production",
  SENTRY: {
    BACKEND_DSN: process.env.SENTRY_BACKEND_DSN ?? "",
    BROWSER_DSN: process.env.NEXT_PUBLIC_SENTRY_BROWSER_DSN ?? "",
  },
  REDIS_URL: process.env.REDIS_URL ?? "",
  OPENROUTER_API_KEY: process.env.OPENROUTER_API_KEY ?? "",
};
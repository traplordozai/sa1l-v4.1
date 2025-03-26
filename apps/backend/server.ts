import { initializeLoggingSystem } from "./init/logging-init"

// Initialize logging system
initializeLoggingSystem()

// Export the logger for use in other files
export { logger } from "./src/lib/logger"

// Call this function during application startup
// In Next.js, you can add this to a custom server.js file
// or use it in a global middleware


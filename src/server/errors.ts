/** Thrown for server misconfiguration (e.g. a missing required env var), as
 * opposed to feature-specific errors that signal bad/invalid request input.
 * Kept dependency-free and separate from analyze.ts: importing ConfigError
 * from a module that also pulls in @anthropic-ai/sdk at load time crashes
 * unrelated serverless functions at cold start (the exact bug this file
 * fixes for the push-notification routes — see api/analyze.js's own note
 * on why it avoids importing from src/ for the same reason). */
export class ConfigError extends Error {}

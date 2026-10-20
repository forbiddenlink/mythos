/**
 * Structured Logger Utility
 *
 * Provides consistent logging across the application with:
 * - Development-only console output
 * - Production-ready error tracking preparation (Sentry-compatible)
 * - Structured log format with timestamps and context
 */

import { scrub } from "@/lib/sentry-scrub";

type LogLevel = "debug" | "info" | "warn" | "error";

interface LogContext {
  [key: string]: unknown;
}

interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  context?: LogContext;
}

const isDevelopment = process.env.NODE_ENV === "development";

/**
 * Format a log entry for console output
 */
function formatLogEntry(entry: LogEntry): string {
  const { level, message, timestamp, context } = entry;
  const levelUpper = level.toUpperCase().padEnd(5);
  const contextStr = context ? ` ${JSON.stringify(context)}` : "";
  return `[${timestamp}] ${levelUpper} ${message}${contextStr}`;
}

/**
 * Create a log entry with timestamp
 */
function createLogEntry(
  level: LogLevel,
  message: string,
  context?: LogContext,
): LogEntry {
  return {
    level,
    message,
    timestamp: new Date().toISOString(),
    context,
  };
}

function sentryEnabled(): boolean {
  return (
    process.env.NODE_ENV === "production" &&
    Boolean(process.env.NEXT_PUBLIC_SENTRY_DSN)
  );
}

/**
 * Send an error to Sentry when a DSN is configured (production only). Uses the
 * real Error from context.error / context.err when present so the stack is kept,
 * otherwise wraps the message. Context is redacted first. Never throws.
 * This is the single logger-to-Sentry path; captureConsoleIntegration is not enabled.
 */
function reportToErrorTracking(
  message: string,
  context?: LogContext,
  error?: Error,
): void {
  if (isDevelopment || !sentryEnabled()) return;

  const cause =
    error ??
    [context?.error, context?.err].find((v): v is Error => v instanceof Error);
  const extra = scrub(
    Object.fromEntries(
      Object.entries(context ?? {}).filter(([, v]) => !(v instanceof Error)),
    ),
  ) as LogContext;

  void import("@sentry/nextjs")
    .then((Sentry) => {
      Sentry.captureException(cause ?? new Error(scrub(message) as string), {
        extra,
        tags: { source: "logger" },
      });
    })
    .catch(() => {
      /* Sentry not available */
    });
}

/**
 * Structured logger with environment-aware behavior
 */
export const logger = {
  /**
   * Debug level - only shown in development
   */
  debug(message: string, context?: LogContext): void {
    if (isDevelopment) {
      const entry = createLogEntry("debug", message, context);
      console.debug(formatLogEntry(entry));
    }
  },

  /**
   * Info level - general information
   */
  info(message: string, context?: LogContext): void {
    if (isDevelopment) {
      const entry = createLogEntry("info", message, context);
      console.info(formatLogEntry(entry));
    }
  },

  /**
   * Warning level - potential issues
   */
  warn(message: string, context?: LogContext): void {
    if (isDevelopment) {
      const entry = createLogEntry("warn", message, context);
      console.warn(formatLogEntry(entry));
    }
  },

  /**
   * Error level - always logged, sent to error tracking in production
   */
  error(message: string, context?: LogContext): void {
    const entry = createLogEntry("error", message, context);

    if (isDevelopment) {
      console.error(formatLogEntry(entry));
    }

    // In production, send to error tracking
    reportToErrorTracking(message, context);
  },

  /**
   * Log an exception with stack trace
   */
  exception(error: Error, context?: LogContext): void {
    const entry = createLogEntry("error", error.message, {
      ...context,
      stack: error.stack,
      name: error.name,
    });

    if (isDevelopment) {
      console.error(formatLogEntry(entry));
      console.error(error.stack);
    }

    reportToErrorTracking(
      error.message,
      { ...context, stack: error.stack, name: error.name },
      error,
    );
  },
};

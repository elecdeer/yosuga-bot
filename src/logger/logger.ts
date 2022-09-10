type PrintLog = (message: string, obj?: unknown) => void;

export interface Logger {
  trace: PrintLog;
  debug: PrintLog;
  info: PrintLog;
  warn: PrintLog;
  error: PrintLog;
  fatal: PrintLog;
}

export type LoggerFactory = (category: string, context?: Record<string, unknown>) => Logger;

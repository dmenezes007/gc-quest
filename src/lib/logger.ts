import { getRuntimeEnv } from './env';

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogMeta {
  [key: string]: unknown;
}

const levelPriority: Record<LogLevel, number> = {
  debug: 10,
  info: 20,
  warn: 30,
  error: 40,
};

function resolveActiveLevel(): LogLevel {
  const env = getRuntimeEnv();
  return env.LOG_LEVEL ?? (env.NODE_ENV === 'production' ? 'info' : 'debug');
}

function shouldLog(level: LogLevel): boolean {
  const activeLevel = resolveActiveLevel();
  return levelPriority[level] >= levelPriority[activeLevel];
}

function serializeError(error: unknown): unknown {
  if (!(error instanceof Error)) {
    return error;
  }

  return {
    name: error.name,
    message: error.message,
    stack: error.stack,
  };
}

function write(level: LogLevel, message: string, meta?: LogMeta): void {
  if (!shouldLog(level)) {
    return;
  }

  const payload = {
    timestamp: new Date().toISOString(),
    level,
    message,
    meta,
  };

  const line = JSON.stringify(payload);

  if (level === 'error') {
    console.error(line);
    return;
  }

  if (level === 'warn') {
    console.warn(line);
    return;
  }

  if (level === 'debug') {
    console.debug(line);
    return;
  }

  console.info(line);
}

export const logger = {
  debug(message: string, meta?: LogMeta) {
    write('debug', message, meta);
  },
  info(message: string, meta?: LogMeta) {
    write('info', message, meta);
  },
  warn(message: string, meta?: LogMeta) {
    write('warn', message, meta);
  },
  error(message: string, error?: unknown, meta?: LogMeta) {
    write('error', message, {
      ...meta,
      error: serializeError(error),
    });
  },
};

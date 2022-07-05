import { Consola, LogLevel } from "consola";

// For details on logging levels
// https://github.com/unjs/consola/blob/master/types/consola.d.ts
const logger = new Consola({ level: LogLevel.Info });

export const getLogger = (tag?: string): Consola => {
  if (tag) {
    return logger.withTag(tag);
  }
  return logger;
};

export const setLogLevel = (level?: LogLevel): void => {
  if (!level || typeof level != "number") {
    console.log("Provide a number");
    Object.entries(LogLevel).forEach(([key, value]) => {
      console.log(`${key}=${value}`);
    });
    return;
  }

  logger.level = level;
};

(global as any).setZAuctionSDKLogLevel = setLogLevel;

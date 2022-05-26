import { Consola, LogLevel }  from "consola";

// Default level is Info
const logger = new Consola({level: 3});

export const getLogger = (tag?: string): Consola => {
  if (tag) {
    return logger.withTag(tag);
  }
  return logger;
};

export const setLogLevel = (level?: LogLevel) => {
  if (level === undefined || typeof level != "number") {
    console.log("provide a number");
    Object.entries(logger.level).forEach(([key, value]) => {
      console.log(`${key}=${value}`);
    });
    return;
  }

  logger.level = level;
};

(global as any).setZAuctionSDKLogLevel = setLogLevel
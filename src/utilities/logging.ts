import * as consola from "consola";

const logger = consola.default.create({
  level: consola.LogLevel.Info,
});

export const getLogger = (tag?: string): consola.Consola => {
  if (tag) {
    return logger.withTag(tag);
  }
  return logger;
};

export const setLogLevel = (level?: consola.LogLevel) => {
  if (level === undefined || typeof level != "number") {
    console.log("provide a number");
    Object.entries(consola.LogLevel).forEach(([key, value]) => {
      console.log(`${key}=${value}`);
    });
    return;
  }

  logger.level = level;
};

(global as any).setZAuctionSDKLogLevel = setLogLevel
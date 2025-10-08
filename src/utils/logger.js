// src/utils/logger.js
// import * as logger from "firebase-functions/logger";
const isDev = process.env.NODE_ENV === "development";

export const log = (...args) => {
  if (isDev) {
    console.log("[LOG]", ...args);
    // logger.info("[LOG]", ...args);
  }
};

export const warn = (...args) => {
  if (isDev) {
    console.warn("[WARN]", ...args);
  }
  //   logger.info("[WARN] ", ...args);
};

export const serror = (...args) => {
  //   logger.error(...args);
  console.error("[ERROR]", ...args);
};

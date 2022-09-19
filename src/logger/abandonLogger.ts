/* eslint-disable @typescript-eslint/no-empty-function */
import type { Logger } from "./logger";

export const getAbandonLogger = (): Logger => {
  return {
    trace: () => {},
    debug: () => {},
    info: () => {},
    warn: () => {},
    error: () => {},
    fatal: () => {},
  };
};

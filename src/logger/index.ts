import { yosugaEnv } from "../environment";
import { initLog4jsLogger } from "./log4jsLogger";

export { getLogger } from "./log4jsLogger";
export { Logger } from "./logger";

initLog4jsLogger({
  logDir: yosugaEnv.logDir,
  allLogFileName: "yosuga.log",
  errorLogFileName: "yosuga-error.log",
});

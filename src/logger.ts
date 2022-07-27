import log4js from "log4js";
import path from "path";
import * as util from "util";

import { yosugaEnv } from "./environment";

import type { Layout } from "log4js";

const logLayout = (oneLine: boolean): Layout => ({
  type: "pattern",
  pattern: "%d %z %p %c %X{eventId} %f:%l %x{oneLine}",
  tokens: {
    oneLine: (logEvent) => {
      return logEvent.data
        .map((d) => {
          if (oneLine) {
            return stringifyLogMessage(d).replace(/\n/gm, "\\n");
          } else {
            const str = stringifyLogMessage(d);
            if (str.includes("\n")) {
              const lines = str.split("\n");
              return `\n${lines.map((line) => `  ${line}`).join("\n")}`;
            } else {
              return str;
            }
          }
        })
        .filter((d: string) => d.length > 0)
        .join(" ");
    },
  },
});

const stringifyLogMessage = (data: unknown) => {
  if (typeof data === "string" || typeof data === "number" || typeof data === "boolean") {
    return data.toString();
  } else {
    return util.inspect(data, { breakLength: Infinity });
  }
};

export const initLogger = () => {
  const layoutOneLine = logLayout(true);
  const layoutMultiLine = logLayout(false);

  log4js.configure({
    appenders: {
      out: { type: "stdout", layout: layoutMultiLine },
      app: {
        type: "file",
        filename: path.join(yosugaEnv.logDir, "yosuga.log"),
        layout: layoutOneLine,
        pattern: "-yyyy-MM-dd",
        dayToKeep: 7,
        compress: true,
      },
      error: {
        type: "file",
        filename: path.join(yosugaEnv.logDir, "yosuga-error.log"),
        layout: layoutMultiLine,
      },
    },
    categories: {
      default: {
        appenders: ["out", "app"],
        level: "all",
        enableCallStack: true,
      },
      error: {
        appenders: ["error"],
        level: "error",
        enableCallStack: true,
      },
    },
  });
};

import log4js from "log4js";
import path from "path";
import * as util from "util";

import { yosugaEnv } from "./environment";

import type { Layout } from "log4js";

const logLayout = ({ oneLine, colored }: { oneLine: boolean; colored: boolean }): Layout => ({
  type: "pattern",
  pattern: `${colored ? "%[" : ""}%d %z %p %c %X{eventId} %f:%l ${colored ? "%]" : ""}%x{oneLine}`,
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
  log4js.configure({
    appenders: {
      out: {
        type: "stdout",
        layout: logLayout({ oneLine: false, colored: true }),
      },
      app: {
        type: "file",
        filename: path.join(yosugaEnv.logDir, "yosuga.log"),
        layout: logLayout({ oneLine: true, colored: false }),
        pattern: "-yyyy-MM-dd",
        dayToKeep: 7,
        compress: true,
      },
      error: {
        type: "file",
        filename: path.join(yosugaEnv.logDir, "yosuga-error.log"),
        layout: logLayout({ oneLine: false, colored: false }),
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

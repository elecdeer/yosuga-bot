import { Client } from "discord.js";

import { YosugaClient } from "../yosugaClient";
import { Handler } from "./base/handler";
import { VersionCommand } from "./command/versionCommand";
import { DeployHandler } from "./global/deployHandler";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type HandlerList = Handler<any>[];

export const loadHandlers = (client: Client, yosuga: YosugaClient): HandlerList => {
  return [new VersionCommand(yosuga), new DeployHandler(yosuga)];
};

export const hookHandlers = (handlers: HandlerList, client: Client): void => {
  handlers.forEach((handler) => {
    handler.hookEvent(client);
  });
};

import { Client } from "discord.js";

import { YosugaClient } from "../yosugaClient";
import { CommandHandler } from "./base/commandHandler";
import { Handler } from "./base/handler";
import { EndCommand } from "./command/endCommand";
import { StartCommand } from "./command/startCommand";
import { VersionCommand } from "./command/versionCommand";
import { DeployHandler } from "./global/deployHandler";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type HandlerList = Handler<any>[];

//TODO
// Helpコマンドとかどうするのか
// キャッシュした方がいいか？

export const loadHandlers = (client: Client, yosuga: YosugaClient): HandlerList => {
  return [new DeployHandler(yosuga), ...loadCommands(client, yosuga)];
};

export const loadCommands = (client: Client, yosuga: YosugaClient): CommandHandler[] => {
  return [new VersionCommand(yosuga), new StartCommand(yosuga), new EndCommand(yosuga)];
};

export const hookHandlers = (handlers: HandlerList, client: Client): void => {
  handlers.forEach((handler) => {
    handler.hookEvent(client);
  });
};

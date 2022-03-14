import { Client } from "discord.js";

import { YosugaClient } from "../yosugaClient";
import { CommandHandler } from "./base/commandHandler";
import { Handler } from "./base/handler";
import { EndCommand } from "./command/endCommand";
import { StartCommand } from "./command/startCommand";
import { VersionCommand } from "./command/versionCommand";
import { DeployGlobalHandler } from "./global/deployGlobalHandler";
import { DeployGuildHandler } from "./global/deployGuildHandler";
import { UndeployGlobalHandler } from "./global/undeployGlobalHandler";
import { UndeployGuildHandler } from "./global/undeployGuildHandler";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type HandlerList = Handler<any>[];

//TODO
// Helpコマンドとかどうするのか
// キャッシュした方がいいか？

export const loadHandlers = (client: Client, yosuga: YosugaClient): HandlerList => {
  return [
    new DeployGlobalHandler(yosuga),
    new DeployGuildHandler(yosuga),
    new DeployGlobalHandler(yosuga),
    new UndeployGuildHandler(yosuga),
    new UndeployGlobalHandler(yosuga),
    ...loadCommands(client, yosuga),
  ];
};

export const loadCommands = (client: Client, yosuga: YosugaClient): CommandHandler[] => {
  return [new VersionCommand(yosuga), new StartCommand(yosuga), new EndCommand(yosuga)];
};

export const hookHandlers = (handlers: HandlerList, client: Client): void => {
  handlers.forEach((handler) => {
    handler.hookEvent(client);
  });
};

import { Client } from "discord.js";

import { Session } from "../session";
import { YosugaClient } from "../yosugaClient";
import { SessionContextHandler } from "./base/sessionContextHandler";
import { AutoLeaveHandler } from "./session/autoLeaveHandler";
import { ReadOutMessageHandler } from "./session/readOutMessageHandler";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type SessionHandlerList = SessionContextHandler<any>[];

export const loadSessionHandlers = (
  client: Client,
  yosuga: YosugaClient,
  session: Session
): SessionHandlerList => {
  return [new ReadOutMessageHandler(yosuga, session), new AutoLeaveHandler(yosuga, session)];
};

export const hookSessionHandlers = (handlers: SessionHandlerList, client: Client): void => {
  handlers.forEach((handler) => {
    handler.hookEvent(client);
  });
};

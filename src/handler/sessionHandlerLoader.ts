import { Client } from "discord.js";

import { Session } from "../session";
import { YosugaClient } from "../yosugaClient";
import { SessionContextHandler } from "./base/sessionContextHandler";
import { AutoLeaveHandler } from "./session/autoLeaveHandler";
import { NoticeEnterChannelHandler } from "./session/noticeEnterChannelHandler";
import { NoticeLeaveChannelHandler } from "./session/noticeLeaveChannelHandler";
import { NoticeTurnOnCameraHandler } from "./session/noticeTurnOnCameraHandler";
import { NoticeTurnOnGoLiveHandler } from "./session/noticeTurnOnGoLiveHandler";
import { ReadOutMessageHandler } from "./session/readOutMessageHandler";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type SessionHandlerList = SessionContextHandler<any>[];

export const loadSessionHandlers = (
  client: Client,
  yosuga: YosugaClient,
  session: Session
): SessionHandlerList => {
  return [
    new ReadOutMessageHandler(yosuga, session),
    new AutoLeaveHandler(yosuga, session),
    new NoticeEnterChannelHandler(yosuga, session),
    new NoticeLeaveChannelHandler(yosuga, session),
    new NoticeTurnOnGoLiveHandler(yosuga, session),
    new NoticeTurnOnCameraHandler(yosuga, session),
  ];
};

export const hookSessionHandlers = (handlers: SessionHandlerList, client: Client): void => {
  handlers.forEach((handler) => {
    handler.hookEvent(client);
  });
};

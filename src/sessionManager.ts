import { GlobalEventHandlerRegistrant } from "./types";
import log4js from "log4js";
import { Session } from "./session";
import { YosugaEventEmitter } from "./yosugaEventEmitter";
import { TextChannel, VoiceConnection } from "discord.js";

const sessionStateMap: Record<string, Session> = {};

let globalEmitter: YosugaEventEmitter;

const logger = log4js.getLogger("sessionManager");

export const registerSessionFactory: GlobalEventHandlerRegistrant = (emitter) => {
  logger.debug("session factory register");
  globalEmitter = emitter;
};

export const getSession = (voiceChannelId: string): Session | null => {
  if (voiceChannelId in sessionStateMap) {
    return sessionStateMap[voiceChannelId];
  } else {
    return null;
  }
};

export const startSession = (connection: VoiceConnection, textChannel: TextChannel): Session => {
  const session = new Session(globalEmitter, connection, textChannel);
  const channelId = connection.channel.id;
  sessionStateMap[channelId] = session;

  session.once("disconnect", () => {
    delete sessionStateMap[channelId];
  });
  return session;
};

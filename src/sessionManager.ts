import { GlobalEventHandlerRegistrant, VoiceOrStageChannel } from "./types";
import log4js from "log4js";
import { Session } from "./session";
import { YosugaEventEmitter } from "./yosugaEventEmitter";
import { TextChannel } from "discord.js";
import { VoiceConnection } from "@discordjs/voice";

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

export const startSession = (
  connection: VoiceConnection,
  textChannel: TextChannel,
  voiceChannel: VoiceOrStageChannel
): Session => {
  const session = new Session(globalEmitter, connection, textChannel, voiceChannel);
  const channelId = voiceChannel.id;
  sessionStateMap[channelId] = session;

  session.once("disconnect", () => {
    delete sessionStateMap[channelId];
  });
  return session;
};

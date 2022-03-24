import { VoiceConnection } from "@discordjs/voice";
import { Collection, TextChannel } from "discord.js";
import log4js from "log4js";

import { endSessionFilter } from "./handler/filter/endSessionFilter";
import { Session } from "./session";
import { GuildId, VoiceOrStageChannel } from "./types";
import { YosugaClient } from "./yosugaClient";

const logger = log4js.getLogger("sessionManager");

export class SessionManager {
  protected yosuga: YosugaClient;
  protected sessionCollection: Collection<GuildId, Session>;

  constructor(yosuga: YosugaClient) {
    this.yosuga = yosuga;

    this.sessionCollection = new Collection<GuildId, Session>();
  }

  getSession(guildId: GuildId): Session | null {
    return this.sessionCollection.get(guildId) ?? null;
  }

  startSession(
    connection: VoiceConnection,
    textChannel: TextChannel,
    voiceChannel: VoiceOrStageChannel
  ): Session {
    const session = new Session(this.yosuga, connection, textChannel, voiceChannel);

    const guildId = textChannel.guild.id;

    this.sessionCollection.set(guildId, session);

    const filter = endSessionFilter(session.getVoiceChannel());
    const handler = filter(() => {
      this.sessionCollection.delete(guildId);
      this.yosuga.client.off("voiceStateUpdate", handler);
    });
    this.yosuga.client.on("voiceStateUpdate", handler);

    return session;
  }
}

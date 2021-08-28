import { VoiceOrStageChannel } from "./types";
import log4js from "log4js";
import { Session } from "./session";
import { Collection, Snowflake, TextChannel } from "discord.js";
import { VoiceConnection } from "@discordjs/voice";
import { YosugaClient } from "./yosugaClient";
import { yosuga } from "./index";

const logger = log4js.getLogger("sessionManager");

export class SessionManager {
  protected yosuga: YosugaClient;
  protected sessionCollection: Collection<Snowflake, Session>;

  constructor(yosuga: YosugaClient) {
    this.yosuga = yosuga;

    this.sessionCollection = new Collection<Snowflake, Session>();
  }

  getSession(guildId: Snowflake): Session | null {
    return this.sessionCollection.get(guildId) ?? null;
  }

  startSession(
    connection: VoiceConnection,
    textChannel: TextChannel,
    voiceChannel: VoiceOrStageChannel
  ): Session {
    const session = new Session(yosuga, connection, textChannel, voiceChannel);
    const guildId = textChannel.guild.id;

    this.sessionCollection.set(guildId, session);
    session.once("disconnect", () => {
      this.sessionCollection.delete(guildId);
    });
    return session;
  }
}

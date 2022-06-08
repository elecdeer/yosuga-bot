import { Collection } from "discord.js";
import { getLogger } from "log4js";

import { endSessionFilter } from "../handler/filter/endSessionFilter";

import type { Session } from "../session";
import type { Snowflake } from "discord.js";

const logger = getLogger("ttsControllerOccupier");

class TtsControllerOccupier {
  readonly maximumUsingSessionNum: number;
  private usingSessions: Collection<Snowflake, Session>;

  constructor(maximumUsingSessionNum: number) {
    this.usingSessions = new Collection<string, Session>();
    this.maximumUsingSessionNum = maximumUsingSessionNum;
  }

  canUse(session: Session): boolean {
    if (this.usingSessions.has(this.getKey(session))) return true;
    return this.usingSessions.size < this.maximumUsingSessionNum;
  }

  use(session: Session): boolean {
    if (!this.canUse(session)) return false;
    this.usingSessions.set(this.getKey(session), session);
    logger.debug(`using: ${this.getKey(session)} ${session.voiceChannel.name}`);

    const filter = endSessionFilter(session.voiceChannel);
    const handler = filter(() => {
      logger.debug(`disposed: ${this.getKey(session)} ${session.voiceChannel.name}`);
      this.usingSessions.delete(this.getKey(session));
      session.yosuga.client.off("voiceStateUpdate", handler);
    });
    session.yosuga.client.on("voiceStateUpdate", handler);

    return true;
  }

  // noinspection JSMethodCanBeStatic
  private getKey(session: Session): Snowflake {
    return session.voiceChannel.id;
  }
}

export const ttsControllerOccupier = new TtsControllerOccupier(1);

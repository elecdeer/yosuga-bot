import { Collection, Snowflake } from "discord.js";
import { getLogger } from "log4js";

import { Session } from "../session";

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
    logger.debug(`using: ${this.getKey(session)} ${session.getVoiceChannel().name}`);

    session.once("disconnect", () => {
      logger.debug(`disposed: ${this.getKey(session)} ${session.getVoiceChannel().name}`);
      this.usingSessions.delete(this.getKey(session));
    });

    return true;
  }

  private getKey(session: Session): Snowflake {
    return session.getVoiceChannel().id;
  }
}

export const ttsControllerOccupier = new TtsControllerOccupier(1);

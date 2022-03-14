import { Client, Guild, Message } from "discord.js";

import { Session } from "../../session";
import { YosugaClient } from "../../yosugaClient";
import { EventArgs, EventKeysTuple, EventKeysUnion, Handler } from "./handler";

export abstract class SessionContextHandler<
  TEventTuple extends EventKeysTuple
> extends Handler<TEventTuple> {
  protected readonly session: Session;

  protected constructor(listenEvents: TEventTuple, yosuga: YosugaClient, session: Session) {
    super(listenEvents, yosuga);
    this.session = session;
  }

  override hookEvent(
    client: Client
  ): { name: EventKeysUnion<TEventTuple>; listener: (...args: EventArgs<TEventTuple>) => void }[] {
    const listeners = super.hookEvent(client);

    this.session.on("disconnect", () => {
      listeners.forEach(({ name, listener }) => {
        client.off(name, listener);
      });
    });

    return listeners;
  }

  protected sessionFilter(guild: Guild): boolean {
    return guild.id === this.session.getGuildId();
  }

  protected sessionFilterMessage(message: Message): boolean {
    if (!message.inGuild()) return false;
    if (message.guildId !== this.session.getGuildId()) return false;
    return message.channelId === this.session.getTextChannel().id;
  }
}

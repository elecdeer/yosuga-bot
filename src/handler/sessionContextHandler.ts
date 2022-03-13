import { Client, ClientEvents, Guild, Message } from "discord.js";

import { Session } from "../session";
import { Handler } from "./handler";

export abstract class SessionContextHandler<
  TEvent extends keyof ClientEvents
> extends Handler<TEvent> {
  protected readonly session: Session;

  protected constructor(listenEvents: TEvent[], session: Session) {
    super(listenEvents);
    this.session = session;
  }

  override hookEvent(
    client: Client
  ): { name: TEvent; listener: (...args: ClientEvents[TEvent]) => void }[] {
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
    if (message.channelId !== this.session.getTextChannel().id) return false;
    return true;
  }
}

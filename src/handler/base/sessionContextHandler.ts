import { Client, ClientEvents, Guild, Message } from "discord.js";

import { Session } from "../../session";
import { YosugaClient } from "../../yosugaClient";
import { Handler } from "./handler";

export abstract class SessionContextHandler<
  TEvent extends keyof ClientEvents
> extends Handler<TEvent> {
  protected readonly session: Session;

  protected constructor(listenEvents: TEvent[], yosuga: YosugaClient, session: Session) {
    super(listenEvents, yosuga);
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
    return message.channelId === this.session.getTextChannel().id;
  }
}

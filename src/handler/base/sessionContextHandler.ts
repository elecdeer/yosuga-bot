import { Handler } from "./handler";
import { endSessionFilter } from "../filter/endSessionFilter";

import type { EventArgs, EventKeysTuple, EventKeysUnion } from "./handler";
import type { Session } from "../../session";
import type { YosugaClient } from "../../yosugaClient";
import type { Client } from "discord.js";

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

    const filter = endSessionFilter(this.session.voiceChannel);
    const handler = filter(() => {
      listeners.forEach(({ name, listener }) => {
        client.off(name, listener);
      });
    });
    this.yosuga.client.on("voiceStateUpdate", handler);

    return listeners;
  }
}

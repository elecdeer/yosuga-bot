import { getLogger } from "log4js";

import type { YosugaClient } from "../../yosugaClient";
import type { EventFilter, Listener } from "../filter/eventFilter";
import type { Client, ClientEvents } from "discord.js";
import type { Logger } from "log4js";

export type EventKeysTuple = [...(keyof ClientEvents)[]];
export type EventKeysUnion<TEventTuple extends EventKeysTuple> = TEventTuple[number];
export type EventArgs<TEventTuple extends EventKeysTuple> =
  ClientEvents[EventKeysUnion<TEventTuple>];

export abstract class Handler<TEventTuple extends EventKeysTuple> {
  protected readonly yosuga: YosugaClient;
  protected readonly listenEvents: TEventTuple;
  protected readonly logger: Logger;

  protected constructor(listenEvents: TEventTuple, yosuga: YosugaClient) {
    this.listenEvents = listenEvents;
    this.yosuga = yosuga;
    this.logger = getLogger(this.constructor.name);
  }

  /**
   * clientに対してイベントハンドラをセットする
   * @param client
   */
  public hookEvent(client: Client): {
    name: EventKeysUnion<TEventTuple>;
    listener: (...args: EventArgs<TEventTuple>) => void;
  }[] {
    const listeners = this.listenEvents.map((eventName: EventKeysUnion<TEventTuple>) => {
      const eventListener: Listener<typeof eventName> = async (...args) => {
        await this.onEvent(eventName, ...args);
      };
      const filter = this.filter(eventName);
      const filteredListener = filter(eventListener);

      return {
        name: eventName,
        listener: filteredListener,
      };
    });

    listeners.forEach(({ name, listener }) => {
      client.on(name, listener);
    });

    return listeners;
  }

  /**
   * イベントを受けるかどうかのフィルタ
   * @param eventName
   * @protected
   */
  protected filter(
    eventName: EventKeysUnion<TEventTuple>
  ): EventFilter<EventKeysUnion<TEventTuple>> {
    return (listener) => listener;
  }

  /**
   * イベントの発生時に呼ばれる
   * @param eventName
   * @param args
   * @protected
   */
  protected abstract onEvent(
    eventName: EventKeysUnion<TEventTuple>,
    ...args: EventArgs<TEventTuple>
  ): Promise<void>;
}

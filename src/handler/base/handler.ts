import { Client, ClientEvents } from "discord.js";
import { getLogger, Logger } from "log4js";

import { YosugaClient } from "../../yosugaClient";

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
      const listener = async (...args: ClientEvents[typeof eventName]) => {
        if (!(await this.filter(eventName, args))) return;
        await this.onEvent(eventName, args);
      };
      return {
        name: eventName,
        listener: listener,
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
   * @param args
   * @protected
   */
  protected async filter(
    eventName: EventKeysUnion<TEventTuple>,
    args: EventArgs<TEventTuple>
  ): Promise<boolean> {
    return true;
  }

  /**
   * イベントの発生時に呼ばれる
   * @param eventName
   * @param args
   * @protected
   */
  protected abstract onEvent(
    eventName: EventKeysUnion<TEventTuple>,
    args: EventArgs<TEventTuple>
  ): Promise<void>;
}

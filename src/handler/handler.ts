import { Client, ClientEvents } from "discord.js";

export abstract class Handler<TEvent extends keyof ClientEvents> {
  protected readonly listenEvents: TEvent[];

  protected constructor(listenEvents: TEvent[]) {
    this.listenEvents = listenEvents;
  }

  /**
   * clientに対してイベントハンドラをセットする
   * @param client
   */
  public hookEvent(
    client: Client
  ): { name: TEvent; listener: (...args: ClientEvents[TEvent]) => void }[] {
    const listeners = this.listenEvents.map((eventName) => {
      const listener = async (...args: ClientEvents[typeof eventName]) => {
        if (!(await this.filter(eventName, ...args))) return;
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
  protected async filter(eventName: TEvent, ...args: ClientEvents[TEvent]): Promise<boolean> {
    return true;
  }

  /**
   * イベントの発生時に呼ばれる
   * @param eventName
   * @param args
   * @protected
   */
  protected abstract onEvent(eventName: TEvent, args: ClientEvents[TEvent]): Promise<void>;
}

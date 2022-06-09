import assert from "assert";
import EventEmitter from "events";

import type { Awaitable } from "discord.js";

export type EventsBase = Record<string, Record<string, unknown>>;

type Cast<T, U> = T extends U ? T : U;

export class TypedEventEmitter<
  TEvents extends EventsBase,
  TEventName extends string = Cast<keyof TEvents, string>
> extends EventEmitter {
  override addListener<K extends TEventName>(
    eventName: K,
    listener: (arg: TEvents[K]) => Awaitable<void>
  ): this {
    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    return super.addListener(eventName, listener);
  }

  override on<K extends TEventName>(
    eventName: K,
    listener: (arg: TEvents[K]) => Awaitable<void>
  ): this {
    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    return super.on(eventName, listener);
  }

  override once<K extends TEventName>(
    eventName: K,
    listener: (arg: TEvents[K]) => Awaitable<void>
  ): this {
    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    return super.once(eventName, listener);
  }

  override removeListener<K extends TEventName>(
    eventName: K,
    listener: (arg: TEvents[K]) => Awaitable<void>
  ): this {
    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    return super.removeListener(eventName, listener);
  }

  override off<K extends TEventName>(
    eventName: K,
    listener: (arg: TEvents[K]) => Awaitable<void>
  ): this {
    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    return super.off(eventName, listener);
  }

  override removeAllListeners<K extends TEventName>(event?: K): this {
    return super.removeAllListeners(event);
  }

  override listeners<K extends TEventName>(eventName: K): ((arg: TEvents[K]) => Awaitable<void>)[] {
    return super.listeners(eventName) as ((arg: TEvents[K]) => Awaitable<void>)[];
  }

  override rawListeners<K extends TEventName>(
    eventName: K
  ): ((arg: TEvents[K]) => Awaitable<void>)[] {
    return super.rawListeners(eventName) as ((arg: TEvents[K]) => Awaitable<void>)[];
  }

  override emit<K extends TEventName>(eventName: K, arg: TEvents[K]): true {
    assert(super.emit(eventName, arg));
    return true;
  }

  override listenerCount<K extends TEventName>(eventName: K): number {
    return super.listenerCount(eventName);
  }

  override prependListener<K extends TEventName>(
    eventName: K,
    listener: (arg: TEvents[K]) => void
  ): this {
    return super.prependListener(eventName, listener);
  }

  override prependOnceListener<K extends TEventName>(
    eventName: K,
    listener: (arg: TEvents[K]) => void
  ): this {
    return super.prependOnceListener(eventName, listener);
  }

  override eventNames(): TEventName[] {
    return super.eventNames() as TEventName[];
  }
}

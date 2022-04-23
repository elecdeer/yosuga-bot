import { Awaited, EventsBase } from "./typedEventEmitter";

//かなりHacky
//EventEmitterの全メソッドをTypedなやつでラップする手もある

export type Awaited = PromiseLike<void> | void;
export type EventsBase = Record<string, Record<string, unknown>>;

declare class TypedEventEmitter<TEvents extends EventsBase> {
  addListener<K extends keyof TEvents>(eventName: K, listener: (arg: TEvents[K]) => Awaited): this;

  on<K extends keyof TEvents>(eventName: K, listener: (arg: TEvents[K]) => Awaited): this;

  once<K extends keyof TEvents>(eventName: K, listener: (arg: TEvents[K]) => Awaited): this;

  removeListener<K extends keyof TEvents>(
    eventName: K,
    listener: (arg: TEvents[K]) => Awaited
  ): this;

  off<K extends keyof TEvents>(eventName: K, listener: (arg: TEvents[K]) => Awaited): this;

  removeAllListeners<K extends keyof TEvents>(event?: K): this;

  listeners<K extends keyof TEvents>(eventName: K): TEvents[K];

  rawListeners<K extends keyof TEvents>(eventName: K): TEvents[K];

  emit<K extends keyof TEvents>(eventName: K, arg: TEvents[K]): boolean;

  listenerCount<K extends keyof TEvents>(eventName: K): number;

  prependListener<K extends keyof TEvents>(eventName: K, listener: (arg: TEvents[K]) => void): this;

  prependOnceListener<K extends keyof TEvents>(
    eventName: K,
    listener: (arg: TEvents[K]) => void
  ): this;

  eventNames(): (keyof TEvents)[];
}

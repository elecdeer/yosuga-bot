type Awaitable<T> = Promise<T> | T;

interface IEventFlowEmitter<T> {
  emit(value: T): void;
}

interface IEventFlowHandler<T> {
  /**
   * handlerを登録する
   * @param handler
   */
  on(handler: (value: T) => Awaitable<void>): void;

  /**
   * 1度のみ呼ばれるhandlerを登録する
   * @param handler
   */
  once(handler: (value: T) => Awaitable<void>): void;

  /**
   * handlerを削除する
   * @param handler
   */
  off(handler: (value: T) => Awaitable<void>): void;

  /**
   * 接続するEventFlowの全てのhandlerを削除する
   */
  offAll(): void;

  /**
   * このeventFlow以下の全てのhandlerを削除する
   */
  offAllInBranch(): void;

  /**
   * filterを通過したemitのみを受け取るEventFlowを作成する
   * @param filters
   */
  filter(...filters: ((value: T) => boolean)[]): IEventFlowHandler<T>;
  filter<U extends T = T>(...filters: ((value: T) => value is U)[]): IEventFlowHandler<U>;

  // map(mapper: (value: T) => T): IEventFlowHandler<T>;
}

interface IEventFlow<T> extends IEventFlowEmitter<T>, IEventFlowHandler<T> {}

export const createEventFlow = <T>(): IEventFlow<T> => {
  return new EventFlow<T>();
};

class EventFlow<T> implements IEventFlow<T> {
  private readonly sourceFlow: EventFlow<T> | undefined;
  private readonly handlers: Set<(value: T) => Awaitable<void>> = new Set();

  constructor(sourceFlow?: EventFlow<T>) {
    this.sourceFlow = sourceFlow;
  }

  emit(value: T): void {
    if (this.sourceFlow) {
      this.sourceFlow.emit(value);
    } else {
      this.handlers.forEach((handler) => {
        void handler(value);
      });
    }
  }

  on(handler: (value: T) => Awaitable<void>): void {
    if (this.sourceFlow) {
      this.sourceFlow.on(handler);
    }

    //offAllInBranchでの削除用にsourceFlowがあっても自身でも保持する
    this.handlers.add(handler);
  }

  once(handler: (value: T) => Awaitable<void>): void {
    const onceHandler = (value: T) => {
      void handler(value);
      this.off(onceHandler);
    };

    this.on(onceHandler);
  }

  off(handler: (value: T) => Awaitable<void>): void {
    if (this.sourceFlow) {
      this.sourceFlow.off(handler);
    } else {
      this.handlers.delete(handler);
    }
  }

  offAll(): void {
    if (this.sourceFlow) {
      this.sourceFlow.offAll();
    }
    this.handlers.clear();
  }

  offAllInBranch(): void {
    const flow = this.sourceFlow;
    if (flow) {
      this.handlers.forEach((handler) => {
        flow.off(handler);
      });
    }

    this.handlers.clear();
  }

  filter(...filter: ((value: T) => boolean)[]): IEventFlowHandler<T>;
  filter<U extends T = T>(...filters: ((value: T) => value is U)[]): IEventFlowHandler<U> {
    return new EventFlowFiltered<U>(this as unknown as EventFlow<U>, ...filters);
  }
}

class EventFlowFiltered<T> extends EventFlow<T> {
  private filters: ((value: T) => value is T)[] = [];

  constructor(sourceFlow: EventFlow<T>, ...filters: ((value: T) => value is T)[]) {
    super(sourceFlow);
    this.filters = filters;
  }

  override on(handler: (value: T) => Awaitable<void>) {
    const filteredHandler = (value: T) => {
      if (this.filters.every((filter) => filter(value))) {
        void handler(value);
      }
    };
    super.on(filteredHandler);
  }
}

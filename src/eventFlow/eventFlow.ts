type Awaitable<T> = Promise<T> | T;

type Handler<T> = (value: T) => Awaitable<void>;
type Filter<T> = (value: T) => boolean;
type TypeGuardFilter<T, U extends T> = (value: T) => value is U;
type Mapper<T, U> = (value: T) => U;
type HookReturn<T> = {
  /**
   * sourceFlowに登録されたhandler
   */
  handler: Handler<T>;

  /**
   * 引数で指定したhandler
   */
  rawHandler: Handler<T>;

  /**
   * handlerをoffする
   */
  off: () => void;
};

export interface IEventFlowEmitter<T> {
  emit(value: T): void;
}

export interface IEventFlowHandler<T> {
  /**
   * handlerを登録する
   * @param handler
   */
  on(handler: Handler<T>): HookReturn<T>;

  /**
   * 1度のみ呼ばれるhandlerを登録する
   * @param handler
   */
  once(handler: Handler<T>): HookReturn<T>;

  /**
   * handlerを削除する
   * @param handler
   */
  off(handler: Handler<T>): void;

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
  filter(...filters: Filter<T>[]): IEventFlowHandler<T>;
  filter<U extends T = T>(...filters: TypeGuardFilter<T, U>[]): IEventFlowHandler<U>;

  /**
   * 変換された値をhandlerで受け取るEventFlowを作成する
   * @param mapper
   */
  map<U>(mapper: Mapper<T, U>): IEventFlowHandler<U>;
}

export interface IEventFlow<T> extends IEventFlowEmitter<T>, IEventFlowHandler<T> {}

export const createEventFlow = <T>(): IEventFlow<T> => {
  return createEventFlowSource<T>();
};

const createEventFlowSource = <T>(): IEventFlow<T> => {
  const handlers: Set<Handler<T>> = new Set();
  const branchFlows: IEventFlowHandler<unknown>[] = [];

  const createBranchNode = <T>(): IEventFlow<T> => {
    const branchFlow: IEventFlow<T> = {
      ...createEventFlowSource<T>(),
      offAll() {
        //sourceのを削除
        //源流までリフトアップされ、そこからoffAllInBranchで全て削除される
        methods.offAll();
      },
    };

    branchFlows.push(branchFlow as IEventFlowHandler<unknown>);
    return branchFlow;
  };

  const methods = {
    emit(value: T): void {
      handlers.forEach((handler) => void handler(value));
    },
    on(handler: Handler<T>): HookReturn<T> {
      handlers.add(handler);
      return {
        handler,
        rawHandler: handler,
        off: () => {
          this.off(handler);
        },
      };
    },
    once(handler: Handler<T>): HookReturn<T> {
      const onceHandler = (value: T) => {
        void handler(value);
        this.off(onceHandler);
      };
      return this.on(onceHandler);
    },
    off(handler: Handler<T>): void {
      handlers.delete(handler);
    },
    offAll(): void {
      methods.offAllInBranch();
    },
    offAllInBranch(): void {
      handlers.clear();
      branchFlows.forEach((branchFlow) => {
        branchFlow.offAllInBranch();
      });
    },
    filter(...filters: Filter<T>[]): IEventFlowHandler<T> {
      const branch = createBranchNode<T>();
      this.on((value: T) => {
        if (filters.some((filter) => !filter(value))) return;
        branch.emit(value);
      });

      return branch;
    },
    map<U>(mapper: Mapper<T, U>): IEventFlowHandler<U> {
      const branch = createBranchNode<U>();
      this.on((value: T) => {
        branch.emit(mapper(value));
      });

      return branch;
    },
  };

  return methods;
};

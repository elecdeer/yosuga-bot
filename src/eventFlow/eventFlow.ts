type Awaitable<T> = Promise<T> | T;

type Handler<T> = (value: T) => Awaitable<void>;
type Filter<T> = (value: T) => boolean;
type TypeGuardFilter<T, U extends T> = (value: T) => value is U;
type Mapper<T, U> = (value: T) => U;
type HookReturn<T> = {
  /**
   * 登録されたhandler
   */
  handler: Handler<T>;

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
   * 同じhandlerは登録されない
   * @param handler
   */
  on(handler: Handler<T>): HookReturn<T>;

  /**
   * 1度のみ呼ばれるhandlerを登録する
   * 同じhandlerは登録されない
   * @param handler
   */
  once(handler: Handler<T>): HookReturn<T>;

  /**
   * 次にemitされた値を持ったPromiseを返す
   */
  wait(): Promise<T>;

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

  /**
   * handler全体が呼ばれる前と後に関数呼び出しを挟むEventFlowを作成する
   * @param param
   */
  tap(param: { pre?: (value: T) => void; post?: (value: T) => void }): IEventFlow<T>;
}

export interface IEventFlow<T> extends IEventFlowEmitter<T>, IEventFlowHandler<T> {}

export const createEventFlow = <THandlerParam = void>(): IEventFlow<THandlerParam> => {
  return createEventFlowSource<THandlerParam>();
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
        off: () => {
          methods.off(handler);
        },
      };
    },
    once(handler: Handler<T>): HookReturn<T> {
      const onceHandler = (value: T) => {
        void handler(value);
        methods.off(onceHandler);
      };
      return methods.on(onceHandler);
    },
    wait(): Promise<T> {
      return new Promise((resolve) => {
        methods.once(resolve);
      });
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
    tap(param: { pre?: (value: T) => void; post?: (value: T) => void }): IEventFlow<T> {
      const branch = createBranchNode<T>();
      this.on((value: T) => {
        branch.emit(value);
      });

      return {
        ...branch,
        emit(value: T) {
          param.pre?.(value);
          branch.emit(value);
          param.post?.(value);
        },
      };
    },
  };

  return methods;
};

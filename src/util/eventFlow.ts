type Awaitable<T> = Promise<T> | T;

type Handler<T> = (value: T) => Awaitable<void>;
type Filter<T> = (value: T) => boolean;
type TypeGuardFilter<T, U extends T> = (value: T) => value is U;
type Mapper<T, U> = (value: T) => U;

export interface IEventFlowEmitter<T> {
  emit(value: T): void;
}

export interface IEventFlowHandler<T> {
  /**
   * handlerを登録する
   * @param handler
   */
  on(handler: Handler<T>): void;

  /**
   * 1度のみ呼ばれるhandlerを登録する
   * @param handler
   */
  once(handler: Handler<T>): void;

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

  return {
    emit(value: T): void {
      handlers.forEach((handler) => void handler(value));
    },
    on(handler: Handler<T>): void {
      handlers.add(handler);
    },
    once(handler: Handler<T>): void {
      const onceHandler = (value: T) => {
        void handler(value);
        this.off(onceHandler);
      };
      this.on(onceHandler);
    },
    off(handler: Handler<T>): void {
      handlers.delete(handler);
    },
    offAll(): void {
      handlers.clear();
    },
    offAllInBranch(): void {
      handlers.clear();
    },
    filter(...filters: Filter<T>[]): IEventFlowHandler<T> {
      const branchHandlerMap = new Map<Handler<T>, Handler<T>>();

      const sourceBranch = {
        ...this,
      };

      return {
        ...sourceBranch,
        on(handler: Handler<T>) {
          const filterHandler = (value: T) => {
            if (filters.some((filter) => !filter(value))) return;
            void handler(value);
          };

          sourceBranch.on(filterHandler);
          branchHandlerMap.set(handler, filterHandler);
        },
        off(handler: Handler<T>) {
          const filterHandler = branchHandlerMap.get(handler);

          sourceBranch.off(filterHandler!);
          branchHandlerMap.delete(handler);
        },
        offAllInBranch: () => {
          branchHandlerMap.forEach((filterHandler) => {
            sourceBranch.off(filterHandler);
          });
          branchHandlerMap.clear();
        },
      };
    },
    map<U>(mapper: Mapper<T, U>): IEventFlowHandler<U> {
      const branch = createEventFlowSource<U>();
      this.on((value: T) => {
        branch.emit(mapper(value));
      });

      const sourceOffAll = () => this.offAll();

      return {
        ...branch,
        offAll() {
          sourceOffAll();
        },
      };
    },
  };
};

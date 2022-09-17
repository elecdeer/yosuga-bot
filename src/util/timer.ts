import type { Awaitable } from "discord.js";

export type Timer = {
  /**
   * handlerを渡しカウントを開始する
   * @param handler
   */
  start: (handler: () => Awaitable<void>) => void;

  /**
   * まだhandlerが呼ばれていない場合、カウントをリセットする
   */
  reset: () => void;

  /**
   * カウントを停止する
   */
  dispose: () => void;

  /**
   * カウントが終了したかどうか
   */
  finished: () => boolean;
};

export const onceTimer = (timeMs: number, unref = true): Timer => {
  let status: {
    timer: NodeJS.Timeout;
    handler: () => Awaitable<void>;
  } | null;

  const start = (handler: () => Awaitable<void>) => {
    const timer = setTimeout(() => {
      void handler();
      status = null;
    });
    status = {
      timer: timer,
      handler: handler,
    };
  };

  return {
    startRender: start,
    reset: () => {
      if (status !== null) {
        clearTimeout(status.timer);
        start(status.handler);
      }
    },
    dispose: () => {
      if (status !== null) {
        clearTimeout(status.timer);
        status = null;
      }
    },
    finished: () => status === null,
  };
};

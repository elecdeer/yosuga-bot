export const wait = (ms: number): Promise<void> =>
  new Promise((resolve) => {
    setTimeout(() => {
      resolve();
    }, ms);
  });
//普通のPromise.allを置き換える形では無理
//Promiseが作られた時点で中の処理は走ってしまうので
export const allSerial = async (
  promiseProviders: (() => PromiseLike<unknown>)[]
): Promise<unknown[]> => {
  const results: unknown[] = [];
  for (const p of promiseProviders) {
    results.push(await p());
  }
  return results;
};

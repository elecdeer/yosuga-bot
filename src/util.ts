import { MessageEmbed } from "discord.js";

export const wait = (ms: number): Promise<void> =>
  new Promise((resolve) => {
    setTimeout(() => {
      resolve();
    }, ms);
  });

export const createYosugaEmbed = (base?: MessageEmbed): MessageEmbed => {
  return (base ?? new MessageEmbed()).setAuthor("Yosuga").setColor(0xffb6c1);
};

const regexp = /[\\^$.*+?()[\]{}|]/;
const regexpGlobal = /[\\^$.*+?()[\]{}|]/g;
export const escapeRegexp = (str: string): string => {
  return str && regexp.test(str) ? str.replace(regexpGlobal, "\\$&") : str;
};

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

export const isInRange = (value: number, min: number, max: number): boolean => {
  return min <= value && value <= max;
};

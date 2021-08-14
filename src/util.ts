import { MessageEmbed } from "discord.js";
import { promisify } from "util";

export const wait = promisify(setTimeout);

export const createEmbedBase = (): MessageEmbed => {
  return new MessageEmbed().setTitle("Yosuga").setColor(0xffb6c1);
};

const regexp = /[\\^$.*+?()[\]{}|]/;
const regexpGlobal = /[\\^$.*+?()[\]{}|]/g;
export const escapeRegexp = (str: string): string => {
  return str && regexp.test(str) ? str.replace(regexpGlobal, "\\$&") : str;
};

export const allSerial = async (
  promiseProviders: (() => PromiseLike<unknown>)[]
): Promise<unknown[]> => {
  const results: unknown[] = [];
  for (const p of promiseProviders) {
    results.push(await p());
  }
  return results;
};

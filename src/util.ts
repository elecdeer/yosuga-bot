import { MessageEmbed, Permissions, Role } from "discord.js";

export const wait = (ms: number): Promise<void> =>
  new Promise((resolve) => {
    setTimeout(() => {
      resolve();
    }, ms);
  });

export const createYosugaEmbed = (base?: MessageEmbed): MessageEmbed => {
  return (base ?? new MessageEmbed()).setAuthor("Yosuga").setColor(0xffb6c1);
};

export const hasAdminPermission = (role: Role) => {
  return role.permissions.bitfield === Permissions.FLAGS.ADMINISTRATOR;
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

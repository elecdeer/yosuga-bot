import { MessageEmbed } from "discord.js";

export const createEmbedBase = (): MessageEmbed => {
  return new MessageEmbed().setTitle("Yosuga").setColor(0xffb6c1);
};

const regexp = /[\\^$.*+?()[\]{}|]/;
const regexpGlobal = /[\\^$.*+?()[\]{}|]/g;
export const escapeRegexp = (str: string): string => {
  return str && regexp.test(str) ? str.replace(regexpGlobal, "\\$&") : str;
};

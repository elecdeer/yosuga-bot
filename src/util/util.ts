import { MessageEmbed } from "discord.js";

export const createYosugaEmbed = (base?: MessageEmbed): MessageEmbed => {
  return (base ?? new MessageEmbed()).setAuthor("Yosuga").setColor(0xffb6c1);
};

const regexp = /[\\^$.*+?()[\]{}|]/;
const regexpGlobal = /[\\^$.*+?()[\]{}|]/g;
export const escapeRegexp = (str: string): string => {
  return str && regexp.test(str) ? str.replace(regexpGlobal, "\\$&") : str;
};

export const isInRange = (value: number, min: number, max: number): boolean => {
  return min <= value && value <= max;
};

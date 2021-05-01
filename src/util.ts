import { MessageEmbed } from "discord.js";

export const createEmbedBase = (): MessageEmbed => {
  return new MessageEmbed().setTitle("Yosuga").setColor(0xffb6c1);
};

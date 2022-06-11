import { MessageSelectMenu } from "discord.js";

import type { MessageSelectMenuOptions } from "discord.js";

export type SelectorParam = Partial<
  Omit<MessageSelectMenuOptions, "customId" | "type" | "options">
>;

export const createSelectMenu = (customId: string, param: SelectorParam): MessageSelectMenu => {
  const selectMenu = new MessageSelectMenu();
  selectMenu.setCustomId(customId);
  if (param.disabled !== undefined) selectMenu.setDisabled(param.disabled);
  if (param.minValues !== undefined) selectMenu.setMinValues(param.minValues);
  if (param.maxValues !== undefined) selectMenu.setMaxValues(param.maxValues);
  if (param.placeholder !== undefined) selectMenu.setPlaceholder(param.placeholder);
  return selectMenu;
};

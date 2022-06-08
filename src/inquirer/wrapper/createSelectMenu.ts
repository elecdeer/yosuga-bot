import { MessageSelectMenu, MessageSelectMenuOptions } from "discord.js";

export type SelectorParam = Partial<
  Omit<MessageSelectMenuOptions, "customId" | "type" | "options">
>;

export const createSelectMenu = (customId: string, param: SelectorParam): MessageSelectMenu => {
  const selectMenu = new MessageSelectMenu();
  selectMenu.setCustomId(customId);
  if (param.disabled) selectMenu.setDisabled(param.disabled);
  if (param.minValues) selectMenu.setMinValues(param.minValues);
  if (param.maxValues) selectMenu.setMaxValues(param.maxValues);
  if (param.placeholder) selectMenu.setPlaceholder(param.placeholder);
  return selectMenu;
};

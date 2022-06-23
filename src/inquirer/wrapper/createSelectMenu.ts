import { MessageSelectMenu } from "discord.js";

import type { MessageSelectMenuOptions } from "discord.js";
import type { SetRequired } from "type-fest";

export type SelectorParam = SetRequired<
  Partial<MessageSelectMenuOptions>,
  "customId" | "options"
> & { type: "SELECT_MENU" };

export const createSelectMenu = (param: SelectorParam): MessageSelectMenu => {
  const selectMenu = new MessageSelectMenu();
  selectMenu.setCustomId(param.customId);
  if (param.disabled !== undefined) selectMenu.setDisabled(param.disabled);
  if (param.minValues !== undefined) selectMenu.setMinValues(param.minValues);
  if (param.maxValues !== undefined) selectMenu.setMaxValues(param.maxValues);
  if (param.placeholder !== undefined) selectMenu.setPlaceholder(param.placeholder);
  selectMenu.setOptions(param.options);
  return selectMenu;
};

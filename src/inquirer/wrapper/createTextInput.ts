import { TextInputComponent } from "discord.js";

import type { TextInputComponentOptions } from "discord.js";
import type { SetRequired } from "type-fest";

export type TextInputParam = SetRequired<TextInputComponentOptions, "customId"> & {
  type: "TEXT_INPUT";
};

export const createTextInput = (param: TextInputParam): TextInputComponent => {
  const textInput = new TextInputComponent();
  textInput.setCustomId(param.customId);
  if (param.label !== undefined) textInput.setLabel(param.label);
  textInput.setRequired(param.required ?? false);
  if (param.maxLength !== undefined) textInput.setMaxLength(param.maxLength);
  if (param.minLength !== undefined) textInput.setMinLength(param.minLength);
  if (param.placeholder !== undefined) textInput.setPlaceholder(param.placeholder);
  textInput.setStyle(param.style ?? "SHORT");
  if (param.value !== undefined) textInput.setValue(param.value);
  return textInput;
};

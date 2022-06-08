import { TextInputComponent, TextInputComponentOptions } from "discord.js";

export type TextInputParam = Partial<Omit<TextInputComponentOptions, "customId">>;

export const createTextInput = (customId: string, param: TextInputParam): TextInputComponent => {
  const textInput = new TextInputComponent();
  textInput.setCustomId(customId);
  if (param.label !== undefined) textInput.setLabel(param.label);
  textInput.setRequired(param.required ?? false);
  if (param.maxLength !== undefined) textInput.setMaxLength(param.maxLength);
  if (param.minLength !== undefined) textInput.setMinLength(param.minLength);
  if (param.placeholder !== undefined) textInput.setPlaceholder(param.placeholder);
  textInput.setStyle(param.style ?? "SHORT");
  if (param.value !== undefined) textInput.setValue(param.value);
  return textInput;
};

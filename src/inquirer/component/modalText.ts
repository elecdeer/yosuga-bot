import {
  MessageActionRow,
  MessageEmbed,
  Modal,
  ModalActionRowComponent,
  ModalOptions,
  TextInputComponent,
  TextInputComponentOptions,
} from "discord.js";
import { getLogger } from "log4js";

import { Lazy, resolveLazy } from "../../util/lazy";
import { PromptComponent, ValidateResult } from "../promptTypes";
import { ButtonParam, createButton } from "./button";
import { messageInteractionHook } from "./messageInteractionHook";

type ModalParam = Partial<Omit<ModalOptions, "customId">>;
type TextInputParam = Partial<Omit<TextInputComponentOptions, "customId">>;
type TextInputParamWithValidate = TextInputParam & {
  validation?: (input: string) => ValidateResult;
};

const logger = getLogger("modalText");
//TODO validate

export const createModalTextComponent = <TKey extends string>(param: {
  openButton: Lazy<ButtonParam>;
  textInputs: Lazy<Record<TKey, TextInputParamWithValidate>>;
  modal: Lazy<ModalParam>;
  customId?: string;
  formatErrorMessage?: (reasons: string[]) => string | MessageEmbed[];
}): PromptComponent<Record<TKey, string>> => {
  const customId = param.customId ?? "modal";
  const openButtonCustomId = `modal-button-${customId}`;

  const constructModal = () => {
    const modal = createModal(customId, resolveLazy(param.modal));
    const inputs = Object.entries<TextInputParam>(resolveLazy(param.textInputs))
      .map(([key, value]) => {
        const prevValue = getStatus().value;
        return createTextInput(
          `${customId}-${key}`,
          prevValue !== undefined
            ? {
                ...value,
                value: prevValue[key as TKey],
              }
            : value
        );
      })
      .map((item) => new MessageActionRow<ModalActionRowComponent>().addComponents(item));
    modal.setComponents(...inputs);
    return modal;
  };

  const { getStatus, hook } = messageInteractionHook<Record<TKey, string>, "BUTTON">(
    openButtonCustomId,
    "BUTTON",
    async (interaction, prevStatus) => {
      logger.debug("ModalOpenButton Interact");
      const modal = constructModal();
      await interaction.showModal(modal);

      //TODO timeもっと適切なのがあるかも
      const modalRes = await interaction.awaitModalSubmit({
        filter: (modalInteraction) => modalInteraction.customId === customId,
        time: 10 * 60 * 1000,
      });

      const resultEntries = Object.keys(param.textInputs).map((key) => [
        key,
        modalRes.fields.getTextInputValue(`${customId}-${key}`),
      ]);

      const validateResults: ValidateResult[] = resultEntries.map(([key, value]) => {
        const validator = resolveLazy(param.textInputs)[key as TKey].validation;
        if (validator !== undefined) {
          return validator(value);
        } else {
          return {
            result: "ok",
          };
        }
      });

      const validateErrors = validateResults.filter((value) => value.result === "reject");
      if (validateErrors.length > 0) {
        const errorTexts = validateErrors.map((value) => value.reason!);
        await modalRes.reply(formatErrorMessage(errorTexts, param.formatErrorMessage));
      } else {
        await modalRes.deferUpdate();
      }

      return Object.keys(param.textInputs)
        .map((key) => [key, modalRes.fields.getTextInputValue(`${customId}-${key}`)])
        .reduce((acc, [key, value]) => {
          return {
            ...acc,
            [key]: value,
          };
        }, {} as Record<TKey, string>);
    }
  );

  return {
    getStatus: getStatus,
    hook: hook,
    renderComponent: () => {
      return [
        new MessageActionRow().addComponents(
          createButton(openButtonCustomId, resolveLazy(param.openButton))
        ),
      ];
    },
  };
};

const createModal = (customId: string, param: ModalParam): Modal => {
  const modal = new Modal();
  modal.setCustomId(customId);
  modal.setTitle(param.title ?? "Text Input");
  return modal;
};

const createTextInput = (customId: string, param: TextInputParam): TextInputComponent => {
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

const formatErrorMessage = (
  messages: string[],
  formatter: ((reasons: string[]) => string | MessageEmbed[]) | undefined
) => {
  if (formatter === undefined) {
    return {
      content: messages.join("\n"),
    };
  } else {
    const formatted = formatter(messages);
    if (typeof formatted === "string") {
      return {
        content: formatted,
      };
    } else {
      return {
        embeds: formatted,
      };
    }
  }
};

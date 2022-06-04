import {
  Collection,
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
import { PromptComponent, ValidateResult, ValidateResultReject } from "../promptTypes";
import { ButtonParam, createButton } from "./button";

type ModalParam = Partial<Omit<ModalOptions, "customId">>;
type TextInputParam = Partial<Omit<TextInputComponentOptions, "customId">>;
type TextInputParamWithValidate = TextInputParam & {
  validation?: (input: string) => ValidateResult;
};

const logger = getLogger("modalText");

export const createModalTextComponent = <TKey extends string>(param: {
  openButton: Lazy<ButtonParam>;
  textInputs: Lazy<Record<TKey, TextInputParamWithValidate>>;
  modal: Lazy<ModalParam>;
  customId?: string;
  formatErrorMessage?: (reasons: string[]) => string | MessageEmbed[];
}): PromptComponent<Record<TKey, string>> => {
  const customId = param.customId ?? "modal";
  const openButtonCustomId = `modal-button-${customId}`;

  // //ここでresolveするのよくない？
  const getFormCollection = () => {
    return new Collection<TKey, TextInputParamWithValidate>(
      Object.entries(resolveLazy(param.textInputs)) as [TKey, TextInputParamWithValidate][]
    ).mapValues((item, key) => ({
      ...item,
      value: result[key],
      validation:
        item.validation ??
        (() => ({
          result: "ok",
        })),
    }));
  };

  const constructModal = () => {
    const modal = createModal(customId, resolveLazy(param.modal));
    const inputs = getFormCollection()
      .map((item, key) => createTextInput(`${customId}-${key}`, item))
      .map((item) => new MessageActionRow<ModalActionRowComponent>().addComponents(item));
    modal.setComponents(...inputs);
    return modal;
  };

  let validateErrors: ValidateResultReject[] = [];
  let result: Record<TKey, string> = Object.entries<TextInputParamWithValidate>(
    resolveLazy(param.textInputs)
  ).reduce((acc, [key, value]) => {
    return {
      ...acc,
      [key]: value.value,
    };
  }, {} as Record<TKey, string>);

  return {
    getStatus: () => {
      if (validateErrors.length > 0) {
        return {
          status: "unanswered",
        };
      } else {
        return {
          status: "answered",
          value: result,
        };
      }
    },
    hook: (message, hookParam, updateCallback) => {
      const formCollection = getFormCollection();

      const collector = message.createMessageComponentCollector({
        time: hookParam.time,
        idle: hookParam.idle,
        componentType: "BUTTON",
      });

      collector.on("collect", async (interaction) => {
        if (interaction.customId !== openButtonCustomId || !interaction.isButton()) return;

        const modal = constructModal();
        await interaction.showModal(modal);

        const modalRes = await interaction
          .awaitModalSubmit({
            filter: (modalInteraction) => modalInteraction.customId === customId,
            time: hookParam.time ?? 10 * 60 * 1000,
            idle: hookParam.idle,
          })
          .catch(() => null);

        if (modalRes === null) {
          collector.stop("modalTimeout");
          return;
        }

        const modalResult = formCollection.mapValues((form, key) => {
          return modalRes.fields.getTextInputValue(`${customId}-${key}`) ?? "";
        });
        logger.log(modalResult.toJSON().join("  "));

        result = modalResult.reduce((acc, value, key) => {
          return {
            ...acc,
            [key]: value,
          };
        }, {} as Record<TKey, string>);

        const validateResults = formCollection.mapValues((form, key) => {
          return form.validation(modalResult.get(key)!);
        });

        validateErrors = validateResults
          .map((validateResult) => validateResult)
          .filter((value) => value.result === "reject") as ValidateResultReject[];

        updateCallback();

        if (validateErrors.length > 0) {
          const errorTexts = validateErrors.map((value) => value.reason);
          await modalRes.reply(formatErrorMessage(errorTexts, param.formatErrorMessage));
        } else {
          await modalRes.deferUpdate();
        }
      });

      const stopReason = "cleanHook";
      collector.on("end", (_, reason) => {
        if (reason === stopReason) {
          return;
        }

        updateCallback();
      });

      return () => {
        collector.stop(stopReason);
      };
    },
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

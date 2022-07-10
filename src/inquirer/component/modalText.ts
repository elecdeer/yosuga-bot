import { Collection, MessageActionRow } from "discord.js";
import { getLogger } from "log4js";

import { resolveLazyParam } from "../../util/lazy";
import { createButton } from "../wrapper/createButton";
import { createModal } from "../wrapper/createModal";
import { createTextInput } from "../wrapper/createTextInput";

import type { LazyParam } from "../../util/lazy";
import type { PromptComponent, ValidateResult, ValidateResultReject } from "../promptTypes";
import type { MessageButtonParam } from "../wrapper/createButton";
import type { ModalParam } from "../wrapper/createModal";
import type { TextInputParam } from "../wrapper/createTextInput";
import type { MessageEmbed, ModalActionRowComponent } from "discord.js";

type TextInputParamLazy = LazyParam<TextInputParam, Exclude<keyof TextInputParam, "value">>;
type TextInputParamWithValidate = TextInputParamLazy & {
  validation?: (input: string) => ValidateResult;
};

const resolveTextInputParamLazy = (param: TextInputParamWithValidate) =>
  resolveLazyParam(param, [
    "type",
    "label",
    "maxLength",
    "minLength",
    "placeholder",
    "required",
    "style",
  ]);

const resolveModalParamLazy = (param: LazyParam<ModalParam>) =>
  resolveLazyParam(param, ["title", "title"]);

const logger = getLogger("modalText");

export const createModalTextComponent = <TKey extends string>(param: {
  openButton: LazyParam<MessageButtonParam>;
  textInputs: Record<TKey, TextInputParamWithValidate>;
  modal: LazyParam<ModalParam>;
  customId?: string;
  formatErrorMessage?: (reasons: string[]) => string | MessageEmbed[];
}): PromptComponent<Record<TKey, string>> => {
  const customId = param.customId ?? "modal";
  const openButtonCustomId = `modal-button-${customId}`;

  // //ここでresolveするのよくない？
  const getFormCollection = () => {
    return new Collection(
      Object.entries(param.textInputs) as [TKey, TextInputParamWithValidate][]
    ).mapValues((item, key) => ({
      ...resolveTextInputParamLazy(item),
      value: result[key],
      validation:
        item.validation ??
        (() => ({
          result: "ok",
        })),
    }));
  };

  const constructModal = () => {
    const modal = createModal(customId, resolveModalParamLazy(param.modal));
    const inputs = getFormCollection()
      .map((item, key) => createTextInput(`${customId}-${key}`, item))
      .map((item) => new MessageActionRow<ModalActionRowComponent>().addComponents(item));
    modal.setComponents(...inputs);
    return modal;
  };

  let validateErrors: ValidateResultReject[] = [];
  let result: Record<TKey, string> = Object.fromEntries(
    Object.entries<TextInputParamWithValidate>(param.textInputs).map(([key, value]) => [
      key,
      value.value ?? "",
    ])
  ) as Record<TKey, string>;

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
    hook: ({ message, promptParam, updateCallback }) => {
      const formCollection = getFormCollection();

      const collector = message.createMessageComponentCollector({
        time: promptParam.time,
        idle: promptParam.idle,
        componentType: "BUTTON",
      });

      collector.on("collect", async (interaction) => {
        if (interaction.customId !== openButtonCustomId || !interaction.isButton()) return;

        const modal = constructModal();
        await interaction.showModal(modal);

        const modalRes = await interaction
          .awaitModalSubmit({
            filter: (modalInteraction) => modalInteraction.customId === customId,
            time: promptParam.time ?? 10 * 60 * 1000,
            idle: promptParam.idle,
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

        result = Object.fromEntries(modalResult.entries()) as Record<TKey, string>;

        const validateResults = formCollection.mapValues((form, key) => {
          return form.validation(modalResult.get(key)!);
        });

        validateErrors = validateResults
          .map((validateResult) => validateResult)
          .filter((value) => value.result === "reject") as ValidateResultReject[];

        updateCallback();

        if (validateErrors.length > 0) {
          const errorTexts = validateErrors.map((value) => value.reason);
          await modalRes.reply({
            ...formatErrorMessage(errorTexts, param.formatErrorMessage),
            ephemeral: promptParam.ephemeral,
          });
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
          createButton(openButtonCustomId, resolveLazyParam(param.openButton))
        ),
      ];
    },
  };
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

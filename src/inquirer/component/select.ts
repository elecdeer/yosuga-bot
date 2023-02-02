import { Collection, MessageActionRow } from "discord.js";

import { selectMenuComponentHookValue } from "./componentHookWithValue";
import { resolveLazy, resolveLazyParam } from "../../util/lazy";
import { createSelectMenu } from "../wrapper/createSelectMenu";

import type { Lazy, LazyParam } from "../../util/lazy";
import type { PromptComponent } from "../promptTypes";
import type { SelectorParam } from "../wrapper/createSelectMenu";
import type { EmojiIdentifierResolvable } from "discord.js";

export type SelectOption<T> = {
  label: Lazy<string>;
  value: T;
  default?: boolean;
  description?: Lazy<string>;
  emoji?: Lazy<EmojiIdentifierResolvable>;
  inactive?: Lazy<boolean>;
};

const resolveSelectorLazyParam = (param: LazyParam<SelectorParam>) => resolveLazyParam(param);

export const createSelectComponent = <TOptionValue>(param: {
  selector: LazyParam<SelectorParam>;
  options: SelectOption<TOptionValue>[];
  customId?: string;
}): PromptComponent<TOptionValue[]> => {
  const customId = param.customId ?? "select";

  const { options, relationCollection } = createValueRelation(param.options);

  const initState = options.filter((item) => item.default).map((item) => item.indexKey);
  const { getRawValue, hook } = selectMenuComponentHookValue<string[]>({
    customId: customId,
    reducer: (interaction) => interaction.values,
    initialState: initState,
  });

  return {
    getStatus: () => {
      const keys = getRawValue();

      const minSelectNum = resolveLazy(param.selector.minValues) ?? 1;
      if (keys == null || keys.length < minSelectNum) {
        return {
          status: "unanswered",
        };
      }

      const values = keys
        .map((key) => relationCollection.get(key))
        .filter((item) => item !== undefined) as TOptionValue[];
      return {
        status: "answered",
        value: values,
      };
    },
    hook: hook,
    renderComponent: () => {
      const component = createSelectMenu(customId, resolveSelectorLazyParam(param.selector));

      component.setOptions(
        options
          .filter((opt) => resolveLazy(opt.inactive) !== true)
          .map((opt) => {
            return {
              label: resolveLazy(opt.label),
              value: opt.indexKey,
              default: getRawValue()?.includes(opt.indexKey) ?? false,
              description: resolveLazy(opt.description),
              emoji: resolveLazy(opt.emoji),
            };
          })
      );
      return [new MessageActionRow().addComponents(component)];
    },
  };
};

const createValueRelation = <TOptionValue>(options: SelectOption<TOptionValue>[]) => {
  const optionsWithIndexKey = options.map((opt, index) => {
    return {
      ...opt,
      indexKey: index.toString(),
    };
  });

  const relationEntries: [string, TOptionValue][] = optionsWithIndexKey.map((opt) => {
    return [opt.indexKey, opt.value];
  });

  return {
    options: optionsWithIndexKey,
    relationCollection: new Collection<string, TOptionValue>(relationEntries),
  };
};

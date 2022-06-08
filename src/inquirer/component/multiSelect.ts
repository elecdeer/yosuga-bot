import { Collection, EmojiIdentifierResolvable, MessageActionRow } from "discord.js";

import { Lazy, LazyParam, resolveLazy, resolveLazyParam } from "../../util/lazy";
import { PromptComponent } from "../promptTypes";
import { createSelectMenu, SelectorParam } from "../wrapper/createSelectMenu";
import { selectMenuInteractionHook } from "./messageInteractionHook";

export type SelectOption<T> = {
  label: Lazy<string>;
  value: T;
  default?: Lazy<boolean>;
  description?: Lazy<string>;
  emoji?: Lazy<EmojiIdentifierResolvable>;
  inactive?: Lazy<boolean>;
};

const resolveSelectorLazyParam = (param: LazyParam<SelectorParam>) => resolveLazyParam(param);

export const createMultiSelectComponent = <TOptionValue>(param: {
  selector: LazyParam<SelectorParam>;
  options: SelectOption<TOptionValue>[];
  customId?: string;
  emptyAnswered?: boolean;
}): PromptComponent<TOptionValue[]> => {
  const customId = param.customId ?? "select";

  const { options, relationCollection } = createValueRelation(param.options);

  const initState = options.filter((item) => item.default === true).map((item) => item.indexKey);
  const { getRawValue, hook } = selectMenuInteractionHook<string[]>({
    customId: customId,
    reducer: (interaction) => interaction.values,
    initialState: initState.length > 0 ? initState : param.emptyAnswered ? [] : null,
  });

  return {
    getStatus: () => {
      const keys = getRawValue();

      if (keys == null || (keys.length === 0 && !param.emptyAnswered)) {
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

import { Collection, MessageActionRow } from "discord.js";

import { resolveLazy, resolveLazyParam } from "../../util/lazy";
import { range } from "../../util/range";
import { minMax } from "../../util/util";
import { createButton } from "../wrapper/createButton";
import { createSelectMenu } from "../wrapper/createSelectMenu";
import { buttonComponentHook, selectMenuComponentHook } from "./componentHook";

import type { LazyParam } from "../../util/lazy";
import type { PromptComponent } from "../promptTypes";
import type { SelectorParam } from "../wrapper/createSelectMenu";
import type { SelectOption } from "./select";
import type { Awaitable } from "discord.js";

export type PagedSelectOption<T> = Omit<SelectOption<T>, "inactive">;
export type PagedSelectOptionWithPage<T> = PagedSelectOption<T> & {
  page: number;
};
export type PagedSelectOptionWithMeta<T> = PagedSelectOptionWithPage<T> & {
  indexKey: string;
};

export type PagedOption<T> =
  | {
      type: "balance";
      options: PagedSelectOption<T>[];
      numPerPageMax?: number;
    }
  | {
      type: "pack";
      options: PagedSelectOption<T>[];
      numPerPage?: number;
    }
  | {
      type: "manual";
      options: PagedSelectOption<T>[][];
    };

const resolveSelectorLazyParam = (param: LazyParam<SelectorParam>) => resolveLazyParam(param);

export const createPagedSelectComponent = <TOptionValue>(param: {
  selector: LazyParam<SelectorParam>;
  // buttons: LazyParam<Omit<ButtonParam, "disabled">>;
  options: PagedOption<TOptionValue>;
  pageTorus?: boolean;
  customId?: string;
}): PromptComponent<TOptionValue[]> => {
  const customId = param.customId ?? "pagedSelect";
  const leftButtonCustomId = `${customId}-button-left`;
  const rightButtonCustomId = `${customId}-button-right`;

  const pageTorus = param.pageTorus ?? true;

  const { options, relationCollection, pageNum } = createValueRelation<TOptionValue>(param.options);

  let page = 0;
  const incrementPage = () => {
    if (pageTorus) {
      page = (page + 1) % pageNum;
    } else {
      page = Math.min(pageNum, page + 1);
    }
  };
  const decrementPage = () => {
    if (pageTorus) {
      page = (page - 1 + pageNum) % pageNum;
    } else {
      page = Math.max(0, page - 1);
    }
  };

  const eachPageValues: string[][] = range(0, pageNum).map((i) =>
    options.filter((opt) => opt.page === page && opt.default).map((opt) => opt.indexKey)
  );
  const getSelectableNumCurPage = () => {
    const maxSelectNumWhole = resolveLazy(param.selector.maxValues) ?? 1;
    const selectedOtherPage = eachPageValues.flat().length - eachPageValues[page].length;
    //今のページで選択できる上限数は、全体の選択上限 - 他のページで選択済み
    return maxSelectNumWhole - selectedOtherPage;
  };

  const hooks = [
    buttonComponentHook({
      customId: leftButtonCustomId,
      onInteraction: async ({ controller }) => {
        decrementPage();
        await controller.edit();
        return false;
      },
      onEnd: () => false,
    }),
    buttonComponentHook({
      customId: rightButtonCustomId,
      onInteraction: async ({ controller }) => {
        incrementPage();
        await controller.edit();
        return false;
      },
      onEnd: () => false,
    }),
    selectMenuComponentHook({
      customId: customId,
      onInteraction: async ({ interaction, controller }) => {
        const maxSelectNum = getSelectableNumCurPage();
        if (maxSelectNum < interaction.values.length) {
          //選択上限を超えてたらロールバック
          await controller.edit();
        } else {
          eachPageValues[page] = interaction.values;
        }
        return true;
      },
      onEnd: () => true,
    }),
  ];

  return {
    getStatus: () => {
      const rawValues = eachPageValues
        .flat()
        .map((key) => relationCollection.get(key))
        .filter((value) => value !== undefined) as TOptionValue[];

      const minSelectNum = resolveLazy(param.selector.minValues) ?? 1;
      if (rawValues.length < minSelectNum) {
        return {
          status: "unanswered",
        };
      }

      return {
        status: "answered",
        value: rawValues,
      };
    },
    hook: (hookParam) => {
      const cleaner = hooks
        .map((hook) => hook(hookParam))
        .filter((hook) => !!hook) as (() => Awaitable<void>)[];
      return async () => {
        await Promise.all(cleaner.map((item) => item()));
      };
    },
    renderComponent: () => {
      const component = createSelectMenu(customId, {
        ...resolveSelectorLazyParam(param.selector),
        minValues: 0,
        maxValues: Math.max(1, getSelectableNumCurPage()),
      });

      component.setOptions(
        options
          .filter((opt) => opt.page === page)
          .map((opt) => ({
            label: resolveLazy(opt.label),
            value: opt.indexKey,
            default: eachPageValues[page].includes(opt.indexKey) ?? false,
            description: resolveLazy(opt.description),
            emoji: resolveLazy(opt.emoji),
          }))
      );

      const leftButton = createButton(leftButtonCustomId, {
        label: "←",
        disabled: !pageTorus && page === 0,
      });
      const rightButton = createButton(rightButtonCustomId, {
        label: "→",
        disabled: !pageTorus && page === pageNum - 1,
      });

      return [
        new MessageActionRow().addComponents(component),
        new MessageActionRow().addComponents(leftButton, rightButton),
      ];
    },
  };
};

const flatAndMarkOption = <T>(pagedOption: PagedOption<T>) => {
  if (pagedOption.type === "manual") {
    const options = pagedOption.options.reduce<PagedSelectOptionWithPage<T>[]>(
      (acc, cur, index) => {
        return [
          ...acc,
          ...cur.map((opt) => ({
            ...opt,
            page: index,
          })),
        ];
      },
      []
    );
    return {
      pageNum: pagedOption.options.length,
      options: options,
    };
  }

  if (pagedOption.type === "balance") {
    const num = pagedOption.options.length;
    const numPerPageMax = minMax(Math.floor(pagedOption.numPerPageMax ?? 25), 1, 25);
    const pageNum = Math.ceil(num / numPerPageMax);
    const numPerPage = Math.ceil(num / pageNum);
    const options = pagedOption.options.map((opt, index) => ({
      ...opt,
      page: Math.floor(index / numPerPage),
    }));
    return {
      pageNum: pageNum,
      options: options,
    };
  }

  if (pagedOption.type === "pack") {
    const numPerPage = minMax(Math.floor(pagedOption.numPerPage ?? 25), 1, 25);
    const options = pagedOption.options.map((opt, index) => ({
      ...opt,
      page: Math.floor(index / numPerPage),
    }));
    return {
      pageNum: Math.ceil(options.length / numPerPage),
      options: options,
    };
  }

  throw new Error("unreachable");
};

const createValueRelation = <T>(option: PagedOption<T>) => {
  const { options: optionsWithPage, pageNum } = flatAndMarkOption(option);

  const optionsWithMeta: PagedSelectOptionWithMeta<T>[] = optionsWithPage.map((opt, index) => ({
    ...opt,
    indexKey: index.toString(),
  }));

  const relationEntries: [string, T][] = optionsWithMeta.map((opt) => {
    return [opt.indexKey, opt.value];
  });

  return {
    pageNum: pageNum,
    options: optionsWithMeta,
    relationCollection: new Collection<string, T>(relationEntries),
  };
};

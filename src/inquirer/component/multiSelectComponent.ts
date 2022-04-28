import {
  Collection,
  EmojiIdentifierResolvable,
  MessageActionRow,
  MessageSelectMenu,
  MessageSelectMenuOptions,
  SelectMenuInteraction,
} from "discord.js";

import { MessageInteractionComponent } from "./messageInteractionComponent";

type SelectorParam = Partial<Omit<MessageSelectMenuOptions, "customId" | "type" | "options">>;

export type SelectOption<T> = {
  label: string;
  value: T;
  default?: boolean;
  description?: string;
  emoji?: EmojiIdentifierResolvable;
};

export class MultiSelectComponent<
  TOptionValue,
  TId extends string = string
> extends MessageInteractionComponent<TId, TOptionValue[], "SELECT_MENU"> {
  readonly selectParam: SelectorParam;
  readonly options: (SelectOption<TOptionValue> & { indexKey: string })[];
  readonly valueCollection: Collection<string, TOptionValue>;

  constructor(param: { id: TId; options: SelectOption<TOptionValue>[] } & SelectorParam) {
    super(param, "SELECT_MENU");
    this.selectParam = param;

    const relation = this.createValueRelation(param.options);
    this.options = relation.options;
    this.valueCollection = relation.keyCollection;
  }

  protected createValueRelation(options: SelectOption<TOptionValue>[]) {
    const optionsWithIndexKey = options.map((opt, index) => {
      return {
        ...opt,
        indexKey: `${this.id}-${index}`,
      };
    });

    const entries: [string, TOptionValue][] = optionsWithIndexKey.map((opt) => {
      return [opt.indexKey, opt.value];
    });
    return {
      keyCollection: new Collection(entries),
      options: optionsWithIndexKey,
    };
  }

  override createComponent(): MessageActionRow[] {
    const selector = createSelectMenu(this.id, this.selectParam);
    selector.setOptions(
      this.options.map((opt) => {
        return {
          label: opt.label,
          value: opt.indexKey,
          default: opt.default,
          description: opt.description,
          emoji: opt.emoji,
        };
      })
    );

    return [new MessageActionRow().addComponents([selector])];
  }

  protected override onInteraction(
    interaction: SelectMenuInteraction<"cached">
  ): TOptionValue[] | null {
    return interaction.values.map((v) => this.valueCollection.get(v)!);
  }
}

const createSelectMenu = (id: string, param: SelectorParam): MessageSelectMenu => {
  const selectMenu = new MessageSelectMenu();
  selectMenu.setCustomId(id);
  if (param.disabled) selectMenu.setDisabled(param.disabled);
  if (param.minValues) selectMenu.setMinValues(param.minValues);
  if (param.maxValues) selectMenu.setMaxValues(param.maxValues);
  if (param.placeholder) selectMenu.setPlaceholder(param.placeholder);
  return selectMenu;
};

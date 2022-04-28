import { MappedInteractionTypes, MessageActionRow, MessageSelectMenuOptions } from "discord.js";

import { MessageInteractionComponent } from "./messageInteractionComponent";
import { MultiSelectComponent, SelectOption } from "./multiSelectComponent";

type SingleSelectorParam = Partial<
  Omit<MessageSelectMenuOptions, "customId" | "type" | "options" | "minValues" | "maxValues">
>;

export class SingleSelectComponent<
  TOptionValue,
  TId extends string = string
> extends MessageInteractionComponent<TId, TOptionValue, "SELECT_MENU"> {
  readonly innerSelectComponent: MultiSelectComponent<TOptionValue, TId>;

  constructor(param: { id: TId; options: SelectOption<TOptionValue>[] } & SingleSelectorParam) {
    super(param, "SELECT_MENU");

    this.innerSelectComponent = new MultiSelectComponent<TOptionValue, TId>({
      ...param,
      minValues: 1,
      maxValues: 1,
    });
  }

  override createComponent(): MessageActionRow[] {
    return this.innerSelectComponent.createComponent();
  }

  protected override onInteraction(
    interaction: MappedInteractionTypes["SELECT_MENU"]
  ): TOptionValue | null {
    const value = interaction.values[0];
    return this.innerSelectComponent.valueCollection.get(value)!;
  }
}

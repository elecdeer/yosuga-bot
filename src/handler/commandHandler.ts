import type { Yosuga, YosugaEventParam } from "../yosuga";
import type { CommandTree } from "./command";
import type { ChatInputCommandInteraction, Interaction } from "discord.js";

const chatInputCommandFilter = (
  param: YosugaEventParam<{
    interaction: Interaction;
  }>
): param is YosugaEventParam<{
  interaction: ChatInputCommandInteraction;
}> => param.interaction.isChatInputCommand();

//TODO permission判定はcommand側の高階関数でやる

export const registerHandlersFromCommandTree = (
  interactionCreateFlow: Yosuga["events"]["interactionCreate"],
  commandTree: CommandTree
) => {
  const flow = interactionCreateFlow.filter<
    YosugaEventParam<{
      interaction: ChatInputCommandInteraction;
    }>
  >(chatInputCommandFilter);

  commandTree.forEach((root) => {
    const eventFlow = flow.filter(({ interaction }) => interaction.commandName === root.props.name);
    root.event?.registerEvent(eventFlow);

    if (root.sub) {
      root.sub.forEach((sub) => {
        const subEventFlow = eventFlow.filter(
          ({ interaction }) =>
            (interaction.options.getSubcommandGroup() === null &&
              interaction.options.getSubcommand() === sub.props.name) ||
            interaction.options.getSubcommandGroup() === sub.props.name
        );
        sub.event?.registerEvent(subEventFlow);

        if (sub.sub) {
          sub.sub.forEach((subSub) => {
            const subSubEventFlow = subEventFlow.filter(
              ({ interaction }) => interaction.options.getSubcommand() === subSub.props.name
            );
            subSub.event?.registerEvent(subSubEventFlow);
          });
        }
      });
    }
  });
};

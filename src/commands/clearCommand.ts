import { Command, commandLogger, createEmbedBase } from "./commands";

export const clearCommand: Command = {
  trigger: ["c", "clear"],
  description: "読み上げを強制的に停止し,キューをクリアする.",
  usage: "",

  execute: async (args, message, session, config) => {
    commandLogger.debug("handleClear");

    if (!session?.connection) return;

    if (session.connection.dispatcher) {
      session.connection.dispatcher.destroy();
    }

    session.initializeQueue();

    const embed = createEmbedBase().setDescription("読み上げキューをクリアしました.");
    await session.textChannel.send(embed);
  },
};

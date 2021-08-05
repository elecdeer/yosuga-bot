import { GlobalEventHandlerRegistrant } from "../types";
import log4js from "log4js";
import { yosuga } from "../index";

const commandLogger = log4js.getLogger("command");

export const registerCommandHandler: GlobalEventHandlerRegistrant = (emitter) => {
  commandLogger.debug("registerCommandHandler");
  emitter.on("command", (cmd, args, context) => {
    commandLogger.debug(`cmd: ${cmd} args: ${args}`);

    const command = yosuga.commandManager.getCommand(cmd);
    if (!command) return;

    void command.execute(args, context).then((resEmbed) => {
      if (context.type === "interaction") {
        if (context.interaction.deferred) {
          void context.interaction.editReply({ embeds: [resEmbed] });
        } else {
          void context.interaction.reply({ embeds: [resEmbed] });
        }
      }
      if (context.type === "text") {
        void context.textChannel.send({ embeds: [resEmbed] });
      }
    });
  });
};

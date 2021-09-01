import assert from "assert";
import log4js from "log4js";

import { CommandContext } from "../commandContext";
import { CommandPermission } from "../permissionUtil";
import { CommandBase } from "./commandBase";
import { voiceSub } from "./configSubCommands/voiceSub";

const commandLogger = log4js.getLogger("command");
export class UserConfigCommand extends CommandBase {
  constructor() {
    super({
      name: "config-user",
      description: "ユーザレベルの設定を変更",
      permission: CommandPermission.Everyone,
      interactionCommand: {
        commandOptions: [voiceSub.data],
      },
    });
  }

  async execute(context: CommandContext): Promise<void> {
    commandLogger.debug("MasterConfigCommand");

    const options = context.getOptions();
    assert(options);
    commandLogger.debug(options);

    const configManager = context.configManager;

    switch (options.getSubcommand()) {
      case voiceSub.data.name:
        await configManager.setUserConfig(context.member.id, voiceSub.configKey, (old) =>
          voiceSub.setValue(options, old)
        );
        break;
    }

    await context.reply("plain", "設定しました");
  }
}

import assert from "assert";
import log4js from "log4js";

import { CommandContext } from "../commandContext";
import { CommandPermission } from "../permissionUtil";
import { CommandBase } from "./commandBase";
import { addSpeakerDaemonSub } from "./configSubCommands/addSpeakerDaemonSub";
import { addSpeakerTtsSub } from "./configSubCommands/addSpeakerTtsSub";

const commandLogger = log4js.getLogger("command");

export class MasterConfigCommand extends CommandBase {
  constructor() {
    super({
      name: "config-master",
      description: "Yosugaインスタンス全体の設定を変更",
      permission: CommandPermission.AppOwner,
      interactionCommand: {
        commandOptions: [addSpeakerDaemonSub.data, addSpeakerTtsSub.data],
      },
    });
  }

  async execute(context: CommandContext): Promise<void> {
    commandLogger.debug("MasterConfigCommand");

    const options = context.getOptions();
    assert(options);

    commandLogger.debug(options);

    const configManager = context.configManager;

    //これなんとかならないか...?

    switch (options.getSubcommand()) {
      case addSpeakerDaemonSub.data.name:
        await configManager.setMasterConfig(addSpeakerDaemonSub.configKey, (old) =>
          addSpeakerDaemonSub.setValue(options, old)
        );
        break;
      case addSpeakerTtsSub.data.name:
        await configManager.setMasterConfig(addSpeakerTtsSub.configKey, (old) =>
          addSpeakerTtsSub.setValue(options, old)
        );
        break;
    }

    await context.reply("plain", "設定しました");
  }
}

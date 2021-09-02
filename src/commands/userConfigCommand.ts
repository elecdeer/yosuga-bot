import log4js from "log4js";

import { CommandPermission } from "../permissionUtil";
import { CommandGroup } from "./commandGroup";
import { VoiceSub } from "./configSubCommands/voiceSub";

const commandLogger = log4js.getLogger("command");

export class UserConfigCommand extends CommandGroup {
  constructor() {
    super({
      name: "user-config",
      description: "ユーザレベルの設定を変更",
      permission: CommandPermission.Everyone,
    });

    this.addSubCommand(new VoiceSub());
  }
}

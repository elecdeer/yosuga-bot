import log4js from "log4js";

import { CommandPermission } from "../permissionUtil";
import { CommandGroup } from "./commandGroup";
import { SetAutoLeaveSecSub } from "./configSubCommands/setAutoLeaveSecSub";
import { SetCommandPrefixSub } from "./configSubCommands/setCommandPrefixSub";
import { SetFastSpeedSub } from "./configSubCommands/setFastSpeedSub";
import { SetIgnorePrefixSub } from "./configSubCommands/setIgnorePrefixSub";
import { SetMaxLengthSub } from "./configSubCommands/setMaxLengthSub";
import { SetReadNameIntervalSub } from "./configSubCommands/setReadNameIntervalSub";
import { SetReadStatusUpdateSub } from "./configSubCommands/setReadStatusUpdateSub";
import { SetSpeedSub } from "./configSubCommands/setSpeedSub";
import { SetVoiceSub } from "./configSubCommands/setVoiceSub";
import { SetVolumeSub } from "./configSubCommands/setVolumeSub";

const commandLogger = log4js.getLogger("command");

export class GuildConfigCommand extends CommandGroup {
  constructor() {
    super({
      name: "guild-config",
      description: "サーバーレベルの設定を変更",
      permission: CommandPermission.GuildAdmin,
    });

    this.addSubCommand(new SetVoiceSub());
    this.addSubCommand(new SetVolumeSub());
    this.addSubCommand(new SetSpeedSub());
    this.addSubCommand(new SetFastSpeedSub());
    this.addSubCommand(new SetCommandPrefixSub());
    this.addSubCommand(new SetReadStatusUpdateSub());
    this.addSubCommand(new SetIgnorePrefixSub());
    this.addSubCommand(new SetAutoLeaveSecSub());
    this.addSubCommand(new SetReadNameIntervalSub());
    this.addSubCommand(new SetMaxLengthSub());
  }
}

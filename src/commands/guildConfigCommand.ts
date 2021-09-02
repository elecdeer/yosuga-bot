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
import { ShowConfigSub } from "./configSubCommands/showConfigSub";

const commandLogger = log4js.getLogger("command");

export class GuildConfigCommand extends CommandGroup {
  constructor() {
    super({
      name: "guild-config",
      description: "サーバーレベルの設定を変更",
      permission: CommandPermission.GuildAdmin,
    });

    this.addSubCommand(new SetVoiceSub("GUILD"));
    this.addSubCommand(new SetVolumeSub("GUILD"));
    this.addSubCommand(new SetSpeedSub("GUILD"));
    this.addSubCommand(new SetFastSpeedSub("GUILD"));
    this.addSubCommand(new SetCommandPrefixSub("GUILD"));
    this.addSubCommand(new SetReadStatusUpdateSub("GUILD"));
    this.addSubCommand(new SetIgnorePrefixSub("GUILD"));
    this.addSubCommand(new SetAutoLeaveSecSub("GUILD"));
    this.addSubCommand(new SetReadNameIntervalSub("GUILD"));
    this.addSubCommand(new SetMaxLengthSub("GUILD"));
    this.addSubCommand(new ShowConfigSub("GUILD"));
  }
}

import log4js from "log4js";

import { CommandPermission } from "../permissionUtil";
import { CommandGroup } from "./commandGroup";
import { AddSpeakerDaemonSub } from "./configSubCommands/addSpeakerDaemonSub";
import { AddSpeakerTtsSub } from "./configSubCommands/addSpeakerTtsSub";
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

export class MasterConfigCommand extends CommandGroup {
  constructor() {
    super({
      name: "master-config",
      description: "Yosugaインスタンス全体の設定を変更",
      permission: CommandPermission.AppOwner,
    });

    this.addSubCommand(new AddSpeakerDaemonSub());
    this.addSubCommand(new AddSpeakerTtsSub());
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

import log4js from "log4js";

import { CommandPermission } from "../application/permissionUtil";
import { CommandGroup } from "./commandGroup";
import { AddSpeakerDaemonSub } from "./configSubCommands/addSpeakerDaemonSub";
import { AddSpeakerTtsSub } from "./configSubCommands/addSpeakerTtsSub";
import { AddVoicevoxSub } from "./configSubCommands/addVoicevoxSub";
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

export class MasterConfigCommand extends CommandGroup {
  constructor() {
    super({
      name: "master-config",
      description: "Yosugaインスタンス全体の設定を変更",
      permission: CommandPermission.AppOwner,
    });

    this.addSubCommand(new AddSpeakerDaemonSub("MASTER"));
    this.addSubCommand(new AddSpeakerTtsSub("MASTER"));
    this.addSubCommand(new AddVoicevoxSub("MASTER"));
    this.addSubCommand(new SetVoiceSub("MASTER"));
    this.addSubCommand(new SetVolumeSub("MASTER"));
    this.addSubCommand(new SetSpeedSub("MASTER"));
    this.addSubCommand(new SetFastSpeedSub("MASTER"));
    this.addSubCommand(new SetCommandPrefixSub("MASTER"));
    this.addSubCommand(new SetReadStatusUpdateSub("MASTER"));
    this.addSubCommand(new SetIgnorePrefixSub("MASTER"));
    this.addSubCommand(new SetAutoLeaveSecSub("MASTER"));
    this.addSubCommand(new SetReadNameIntervalSub("MASTER"));
    this.addSubCommand(new SetMaxLengthSub("MASTER"));
    this.addSubCommand(new ShowConfigSub("MASTER"));
  }
}

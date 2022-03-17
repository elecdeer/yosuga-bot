import { CommandInteraction } from "discord.js";

import { CommandContextSlash } from "../../../commandContextSlash";
import { ValidationResult } from "../../../commands/configSubCommands/setConfigSubCommand";
import { ConfigEachLevel, GuildLevel, MasterLevel, UserLevel } from "../../../config/typesConfig";
import { isInRange } from "../../../util/util";
import { YosugaClient } from "../../../yosugaClient";
import { SetConfigSubCommandHandler } from "../../base/setConfigSubCommandHandler";
import { SubCommandProps } from "../../base/subCommandHandler";

export class SetVoiceSub extends SetConfigSubCommandHandler<
  MasterLevel | GuildLevel | UserLevel,
  "speakerOption"
> {
  constructor(yosuga: YosugaClient, level: MasterLevel | GuildLevel | UserLevel) {
    super(yosuga, level, "speakerOption");
  }

  protected initCommandProps(): SubCommandProps {
    return {
      name: "voice",
      description: "読み上げボイスの設定",
      options: [
        {
          name: "voicename",
          description: "ボイスの登録名",
          type: "STRING",
          required: true,
        },
        {
          name: "pitch",
          description: "声のピッチ（0 - 2)",
          type: "NUMBER",
        },
        {
          name: "intonation",
          description: "声のイントネーション（0 - 2)",
          type: "NUMBER",
        },
      ],
      permission: this.getPermissionLevel(),
    };
  }

  protected override async getValueFromOptions(
    options: CommandInteraction["options"],
    oldValue:
      | Readonly<ConfigEachLevel<MasterLevel | GuildLevel | UserLevel>["speakerOption"]>
      | undefined
  ): Promise<ConfigEachLevel<MasterLevel | GuildLevel | UserLevel>["speakerOption"] | undefined> {
    const voiceName = options.getString("voicename");
    if (!voiceName) {
      return undefined;
    }

    return {
      speakerName: voiceName,
      voiceParam: {
        pitch: options.getNumber("pitch") ?? 1,
        intonation: options.getNumber("intonation") ?? 1,
      },
    };
  }

  protected override async validateValue(
    value: ConfigEachLevel<MasterLevel | GuildLevel | UserLevel>["speakerOption"] | undefined,
    context: Omit<CommandContextSlash, "reply">
  ): Promise<ValidationResult> {
    const buildOptions = await context.getUnifiedConfigAccessor().get("speakerBuildOptions");

    if (value) {
      if (!buildOptions[value.speakerName]) {
        return {
          status: "warn",
          message: "登録されていないボイス名を指定しています.",
        };
      }

      if (!isInRange(value.voiceParam.pitch, 0, 2)) {
        return {
          status: "error",
          message: "pitchに設定する値は0 ~ 2の範囲内である必要があります.",
        };
      }
      if (!isInRange(value.voiceParam.intonation, 0, 2)) {
        return {
          status: "error",
          message: "intonationに設定する値は0 ~ 2の範囲内である必要があります.",
        };
      }
    }

    return super.validateValue(value, context);
  }
}

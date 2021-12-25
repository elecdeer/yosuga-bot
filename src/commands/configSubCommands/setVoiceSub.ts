import { CommandInteractionOptionResolver } from "discord.js";

import { CommandContextSlash } from "../../commandContextSlash";
import { ConfigCommandLevel, UserConfig } from "../../config/typesConfig";
import { isInRange } from "../../util/util";
import { isRequiredOption, SetConfigSubCommand, ValidationResult } from "./setConfigSubCommand";

export class SetVoiceSub extends SetConfigSubCommand<UserConfig, "speakerOption"> {
  constructor(level: ConfigCommandLevel) {
    super(
      {
        name: "voice",
        description: "読み上げボイスの設定",
        options: [
          {
            name: "voicename",
            description: "ボイスの登録名",
            type: "STRING",
            required: isRequiredOption(level),
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
      },
      level,
      "speakerOption"
    );
  }

  override getValueFromOptions(
    options: CommandInteractionOptionResolver,
    oldValue: Readonly<UserConfig["speakerOption"]> | undefined
  ): UserConfig["speakerOption"] | undefined {
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
    value: UserConfig["speakerOption"] | undefined,
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

import { Collection, Formatters, MessageEmbed } from "discord.js";

import { levelString } from "../../commands/configSubCommands/setConfigSubCommand";
import { ConfigEachLevel, MasterLevel } from "../../config/typesConfig";
import { SpeakerBuildOption } from "../../speaker/voiceProvider";
import { YosugaClient } from "../../yosugaClient";
import { SetConfigSubCommandHandler } from "./setConfigSubCommandHandler";

export abstract class AddSpeakerSubHandler extends SetConfigSubCommandHandler<
  MasterLevel,
  "speakerBuildOptions"
> {
  public constructor(yosuga: YosugaClient, level: MasterLevel) {
    super(yosuga, level, "speakerBuildOptions");
  }

  protected override constructConfigReplyEmbed(
    oldValue: Readonly<ConfigEachLevel<MasterLevel>["speakerBuildOptions"] | undefined>,
    newValue: Readonly<ConfigEachLevel<MasterLevel>["speakerBuildOptions"] | undefined>
  ): MessageEmbed {
    const embed = new MessageEmbed();
    embed.setDescription(`${levelString[this.level]}の設定を変更しました.`);
    embed.addField(this.commandProps.name, this.commandProps.description, true);

    this.logger.debug("constructReplyEmbed");
    this.logger.debug(oldValue);
    this.logger.debug(newValue);
    const hasDifferenceVoices = extractOptionDifference(oldValue, newValue);
    this.logger.debug(hasDifferenceVoices);

    const differenceOldOptions = !oldValue
      ? "[ボイス未登録]"
      : hasDifferenceVoices.map((key) => `${key}\n${voiceParamsToStr(oldValue[key])}`).join("\n\n");

    const differenceNewOptions = !newValue
      ? "[ボイス未登録]"
      : hasDifferenceVoices.map((key) => `${key}\n${voiceParamsToStr(newValue[key])}`).join("\n\n");

    embed.addField("変更前", differenceOldOptions, true);
    embed.addField("変更後", differenceNewOptions, true);
    return embed;
  }
}

const extractOptionDifference = (
  oldValue: Readonly<Record<string, SpeakerBuildOption>> | undefined,
  newValue: Readonly<Record<string, SpeakerBuildOption>> | undefined
) => {
  const oldValueCollection = new Collection(Object.entries(oldValue ?? {}));
  const newValueCollection = new Collection(Object.entries(newValue ?? {}));

  const differenceKeys: string[] = [];
  newValueCollection.forEach((newParams, key) => {
    const oldParams = oldValueCollection.get(key);
    if (!oldParams) {
      //片方にしかない
      differenceKeys.push(key);
    } else {
      const newParamsCollection = new Collection(Object.entries(newParams));
      const oldParamsCollection = new Collection(Object.entries(oldParams));
      if (
        //どれか一つでも違うのがあったなら
        newParamsCollection.some(
          (paramValue, paramKey) => paramValue !== oldParamsCollection.get(paramKey)
        )
      ) {
        differenceKeys.push(key);
      }
    }
  });

  oldValueCollection.forEach((oldParams, key) => {
    const newParams = newValueCollection.get(key);
    if (!newParams) {
      //片方にしかない
      differenceKeys.push(key);
    } else {
      const newParamsCollection = new Collection(Object.entries(newParams));
      const oldParamsCollection = new Collection(Object.entries(oldParams));
      if (
        //どれか一つでも違うのがあったなら
        oldParamsCollection.some(
          (paramValue, paramKey) => paramValue !== newParamsCollection.get(paramKey)
        )
      ) {
        differenceKeys.push(key);
      }
    }
  });

  return Array.from(new Set(differenceKeys));
};

const voiceParamsToStr = (paramRecord: SpeakerBuildOption | undefined): string => {
  if (!paramRecord) {
    return "[未設定]";
  }
  const entries = Object.entries(paramRecord);
  return entries.map(([key, value]) => `${key}: ${Formatters.inlineCode(value)}`).join("\n");
};

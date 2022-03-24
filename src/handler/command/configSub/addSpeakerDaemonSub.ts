import { CommandInteraction } from "discord.js";

import { ConfigEachLevel, MasterLevel } from "../../../config/typesConfig";
import { AddSpeakerSubHandler } from "../../base/addSpeakerSubHandler";
import { SubCommandProps } from "../../base/subCommandHandler";

export class AddSpeakerDaemonSub extends AddSpeakerSubHandler {
  protected initCommandProps(): SubCommandProps {
    return {
      name: "add-speaker-daemon",
      description: "VoiceroidDaemonによるボイスの追加",
      options: [
        {
          name: "name",
          description: "ボイスの登録名",
          type: "STRING",
          required: true,
        },
        {
          name: "url",
          description: "VoiceroidDaemonのURLBase",
          type: "STRING",
          required: true,
        },
      ],
      permission: this.getPermissionLevel(),
    };
  }

  protected async getValueFromOptions(
    options: CommandInteraction["options"],
    oldValue: Readonly<ConfigEachLevel<MasterLevel>["speakerBuildOptions"]> | undefined
  ): Promise<ConfigEachLevel<MasterLevel>["speakerBuildOptions"] | undefined> {
    const voiceName = options.getString("name", true);
    return {
      ...oldValue,
      [voiceName]: {
        type: "voiceroidDaemon",
        voiceName: options.getString("name", true),
        urlBase: options.getString("url", true),
      },
    };
  }
}

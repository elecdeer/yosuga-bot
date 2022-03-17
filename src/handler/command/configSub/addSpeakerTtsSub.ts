import { CommandInteraction } from "discord.js";

import { ConfigEachLevel, MasterLevel } from "../../../config/typesConfig";
import { AddSpeakerSubHandler } from "../../base/addSpeakerSubHandler";
import { SubCommandProps } from "../../base/subCommandHandler";

export class AddSpeakerTtsSub extends AddSpeakerSubHandler {
  protected initCommandProps(): SubCommandProps {
    return {
      name: "add-speaker-tts",
      description: "TTSControllerによるボイスの追加",
      options: [
        {
          name: "name",
          description: "ボイスの登録名",
          required: true,
          type: "STRING",
        },
        {
          name: "url",
          description: "TTSControllerのURLBase",
          required: true,
          type: "STRING",
        },
        {
          name: "wsurl",
          description: "socketio-audio-recorderのWebsocketURL",
          required: true,
          type: "STRING",
        },
        {
          name: "device",
          description: "socketio-audio-recorderのoutputDevice",
          required: true,
          type: "STRING",
        },
        {
          name: "callname",
          description: "TTSControllerでの呼び出し名",
          required: true,
          type: "STRING",
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
        type: "ttsController",
        voiceName: options.getString("name", true),
        urlBase: options.getString("url", true),
        wsUrl: options.getString("wsurl", true),
        outputDevice: options.getString("device", true),
        callName: options.getString("callname", true),
      },
    };
  }
}

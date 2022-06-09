import { filterGenerator } from "./eventFilter";

import type { VoiceOrStageChannel } from "../../types";
import type { EventFilterGenerator } from "./eventFilter";
import type { ClientEvents } from "discord.js";

/**
 * 呼び出されたイベントがカメラ開始を示すものであるかどうか
 * @param voiceChannel
 */
export const isTurnOnCameraCall =
  (voiceChannel: Readonly<VoiceOrStageChannel>) =>
  (...args: ClientEvents["voiceStateUpdate"]): boolean => {
    const [oldState, newState] = args;
    if (!newState.guild.id) return false;
    if (!oldState.member || !newState.member) return false;
    if (oldState.member !== newState.member) return false;

    if (voiceChannel.id === oldState.channelId && voiceChannel.id === newState.channelId) {
      if (!oldState.selfVideo && newState.selfVideo) {
        return true;
      }
    }
    return false;
  };

/**
 * カメラ開始時のみ通過するイベントフィルタ
 * @param voiceChannel
 */
export const turnOnCameraFilter: EventFilterGenerator<
  "voiceStateUpdate",
  Readonly<VoiceOrStageChannel>
> = filterGenerator(isTurnOnCameraCall);

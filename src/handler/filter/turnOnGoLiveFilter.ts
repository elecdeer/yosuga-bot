import { ClientEvents } from "discord.js";

import { VoiceOrStageChannel } from "../../types";
import { EventFilter, filterer } from "./eventFilter";

/**
 * 呼び出されたイベントがGoLive開始を示すものであるかどうか
 * @param voiceChannel
 */
export const isTurnOnGoLiveCall =
  (voiceChannel: Readonly<VoiceOrStageChannel>) =>
  (...args: ClientEvents["voiceStateUpdate"]): boolean => {
    const [oldState, newState] = args;
    if (!newState.guild.id) return false;
    if (!oldState.member || !newState.member) return false;
    if (oldState.member !== newState.member) return false;

    if (voiceChannel.id === oldState.channelId && voiceChannel.id === newState.channelId) {
      if (!oldState.streaming && newState.streaming) {
        return true;
      }
    }
    return false;
  };

/**
 * goLive開始時のみ通過するイベントフィルタ
 * @param voiceChannel
 */
export const turnOnGoLiveFilter: EventFilter<
  "voiceStateUpdate",
  Readonly<VoiceOrStageChannel>
> = filterer(isTurnOnGoLiveCall);

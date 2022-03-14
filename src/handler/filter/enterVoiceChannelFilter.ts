import { ClientEvents } from "discord.js";

import { VoiceOrStageChannel } from "../../types";
import { EventFilter, filterer } from "./eventFilter";

/**
 * 呼び出されたイベントがvoiceChannelへの入室を示すものであるかどうか
 * @param voiceChannel
 */
export const isEnterVoiceChannelCall =
  (voiceChannel: Readonly<VoiceOrStageChannel>) =>
  (...args: ClientEvents["voiceStateUpdate"]): boolean => {
    const [oldState, newState] = args;
    if (!newState.guild.id) return false;
    if (!oldState.member || !newState.member) return false;
    if (oldState.member !== newState.member) return false;

    //入室: oldが別チャンネル|無し & newがsessionのチャンネル
    const sessionVCId = voiceChannel.id;
    return oldState.channelId !== sessionVCId && newState.channelId === sessionVCId;
  };

/**
 * voiceChannelへの入室時のみ通過するイベントフィルタ
 * @param voiceChannel
 */
export const enterVoiceChannelFilter: EventFilter<
  "voiceStateUpdate",
  Readonly<VoiceOrStageChannel>
> = filterer(isEnterVoiceChannelCall);

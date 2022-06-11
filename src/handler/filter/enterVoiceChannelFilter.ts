import { filterGenerator } from "./eventFilter";

import type { VoiceOrStageChannel } from "../../types";
import type { EventFilterGenerator } from "./eventFilter";
import type { ClientEvents } from "discord.js";

/**
 * 呼び出されたイベントがvoiceChannelへの入室を示すものであるかどうか
 * @param voiceChannel
 */
export const isEnterVoiceChannelCall =
  (voiceChannel: Readonly<VoiceOrStageChannel>) =>
  (...args: ClientEvents["voiceStateUpdate"]): boolean => {
    const [oldState, newState] = args;
    if (newState.guild.id === "") return false;
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
export const enterVoiceChannelFilter: EventFilterGenerator<
  "voiceStateUpdate",
  Readonly<VoiceOrStageChannel>
> = filterGenerator(isEnterVoiceChannelCall);

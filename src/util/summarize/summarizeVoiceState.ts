import type { VoiceState } from "discord.js";

export const summarizeVoiceState = (voiceState: VoiceState) => {
  return {
    id: voiceState.id,
    sessionId: voiceState.sessionId,
    channelId: voiceState.channelId,
    guildId: voiceState.guild.id,
    serverDeaf: voiceState.serverDeaf, //サーバ側スピーカーミュート
    serverMute: voiceState.serverMute, //サーバ側マイクミュート
    selfDeaf: voiceState.selfDeaf, //ユーザ側スピーカーミュート
    selfMute: voiceState.selfMute, //ユーザ側マイクミュート
    selfVideo: voiceState.selfVideo, //カメラ
    streaming: voiceState.streaming, //goLive
  };
};

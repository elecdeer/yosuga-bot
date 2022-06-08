import { VoiceState } from "discord.js";

import { Session } from "../../session";
import { createYosugaEmbed } from "../../util/createEmbed";
import { YosugaClient } from "../../yosugaClient";
import { EventKeysUnion } from "../base/handler";
import { SessionContextHandler } from "../base/sessionContextHandler";
import { enterVoiceChannelFilter } from "../filter/enterVoiceChannelFilter";
import { composeFilter, EventFilterGenerator, filterer } from "../filter/eventFilter";
import { leaveVoiceChannelFilter } from "../filter/leaveVoiceChannelFilter";

export class AutoLeaveHandler extends SessionContextHandler<["voiceStateUpdate"]> {
  private timer: NodeJS.Timeout | null = null;

  constructor(yosuga: YosugaClient, session: Session) {
    super(["voiceStateUpdate"], yosuga, session);
  }

  protected override filter(
    eventName: EventKeysUnion<["voiceStateUpdate"]>
  ): ReturnType<EventFilterGenerator<EventKeysUnion<["voiceStateUpdate"]>, unknown>> {
    return composeFilter(
      super.filter(eventName),
      filterer<"voiceStateUpdate">((oldState) => oldState.guild.id === this.session.guild.id),
      leaveVoiceChannelFilter(this.session.voiceChannel),
      filterer<"voiceStateUpdate">((oldState, newState) => {
        const member = newState.member!;
        return member.id !== this.yosuga.client.user.id;
      })
    );
  }

  protected override async onEvent(
    eventName: "voiceStateUpdate",
    oldState: VoiceState,
    newState: VoiceState
  ): Promise<void> {
    const memberNumExcludedBot = getMemberNumExcludedBot(this.session);
    //最後の1人ではない
    if (memberNumExcludedBot > 0) return;

    //既にタイマーが動いている
    if (this.timer) return;

    const config = await this.session.getConfig();
    const timeToAutoLeaveMs = config.timeToAutoLeaveSec * 1000;
    this.logger.debug(`setLeaveTimer: ${timeToAutoLeaveMs} ms`);

    const client = this.yosuga.client;

    const leaveChannel = () => {
      const embed = createYosugaEmbed({
        message: "一定時間ボイスチャンネルに誰もいなくなったため退出しました.",
      });

      void this.session.textChannel.send({ embeds: [embed] }).then(() => {
        this.session.disconnect();
      });
    };

    const cancelAutoLeave = () => {
      this.logger.debug(`cancelAutoLeave`);
      if (this.timer) {
        clearTimeout(this.timer);
        this.timer = null;
      }
      client.off("voiceStateUpdate", handleEnterChannel);
      client.off("voiceStateUpdate", handleLeaveChannel);
    };

    //タイムアウトした場合
    const handleTimeout = () => {
      this.logger.debug(`igniteAutoLeave`);
      client.off("voiceStateUpdate", handleEnterChannel);
      client.off("voiceStateUpdate", handleLeaveChannel);
      this.timer = null;
      leaveChannel();
    };
    this.timer = setTimeout(handleTimeout, timeToAutoLeaveMs);

    //時間待ち中に入ってきた場合
    const enterFilter = enterVoiceChannelFilter(this.session.voiceChannel);
    const handleEnterChannel = enterFilter(() => {
      if (getMemberNumExcludedBot(this.session) > 0) {
        cancelAutoLeave();
      }
    });
    client.on("voiceStateUpdate", handleEnterChannel);

    //時間待ち中に退出した場合
    const leaveFilter = leaveVoiceChannelFilter(this.session.voiceChannel);
    const handleLeaveChannel = leaveFilter((oldState) => {
      if (oldState.member?.id === this.yosuga.client.user.id) {
        cancelAutoLeave();
      }
    });
    client.on("voiceStateUpdate", handleLeaveChannel);
  }
}

const getMemberNumExcludedBot = (session: Session): number =>
  session.voiceChannel.members.filter((member) => !member.user.bot).size;

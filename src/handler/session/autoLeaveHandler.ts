import { Session } from "../../session";
import { createYosugaEmbed } from "../../util/createEmbed";
import { YosugaClient } from "../../yosugaClient";
import { EventArgs, EventKeysUnion } from "../base/handler";
import { SessionContextHandler } from "../base/sessionContextHandler";
import { enterVoiceChannelFilter } from "../filter/enterVoiceChannelFilter";
import { isLeaveVoiceChannelCall } from "../filter/leaveVoiceChannelFilter";

export class AutoLeaveHandler extends SessionContextHandler<["voiceStateUpdate"]> {
  private timer: NodeJS.Timeout | null = null;

  constructor(yosuga: YosugaClient, session: Session) {
    super(["voiceStateUpdate"], yosuga, session);
  }

  protected override async filter(
    eventName: EventKeysUnion<["voiceStateUpdate"]>,
    args: EventArgs<["voiceStateUpdate"]>
  ): Promise<boolean> {
    const [oldState, newState] = args;

    if (!(await super.filter(eventName, args))) return false;

    const voiceChannel = this.session.getVoiceChannel();
    if (!isLeaveVoiceChannelCall(voiceChannel)(oldState, newState)) return false;

    const member = newState.member!;
    return member.id !== this.yosuga.client.user.id;
  }

  protected async onEvent(
    eventName: EventKeysUnion<["voiceStateUpdate"]>,
    args: EventArgs<["voiceStateUpdate"]>
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

      void this.session
        .getTextChannel()
        .send({ embeds: [embed] })
        .then(() => {
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
    const enterFilter = enterVoiceChannelFilter(this.session.getVoiceChannel());
    const handleEnterChannel = enterFilter(() => {
      if (getMemberNumExcludedBot(this.session) > 0) {
        cancelAutoLeave();
      }
    });
    client.on("voiceStateUpdate", handleEnterChannel);

    //時間待ち中に退出した場合
    const leaveFilter = enterVoiceChannelFilter(this.session.getVoiceChannel());
    const handleLeaveChannel = leaveFilter((oldState) => {
      if (oldState.member?.id === this.yosuga.client.user.id) {
        cancelAutoLeave();
      }
    });
    client.on("voiceStateUpdate", handleLeaveChannel);
  }
}

const getMemberNumExcludedBot = (session: Session): number =>
  session.getVoiceChannel().members.filter((member) => !member.user.bot).size;

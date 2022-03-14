import { Session } from "../../session";
import { YosugaClient } from "../../yosugaClient";
import { EventArgs, EventKeysUnion } from "../base/handler";
import { SessionContextHandler } from "../base/sessionContextHandler";
import { isTurnOnCameraCall } from "../filter/turnOnCameraFilter";

export class NoticeTurnOnCamera extends SessionContextHandler<["voiceStateUpdate"]> {
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
    return isTurnOnCameraCall(voiceChannel)(oldState, newState);
  }

  protected async onEvent(
    eventName: EventKeysUnion<["voiceStateUpdate"]>,
    args: EventArgs<["voiceStateUpdate"]>
  ): Promise<void> {
    const [oldState, newState] = args;
    const member = oldState.member;
    await this.session.pushSpeech({
      text: `${this.session.getUsernamePronunciation(member)}がカメラをオンにしました。`,
    });
  }
}

import { SessionEventHandlerRegistrant } from "../types";

export const registerTurnOnVideo: SessionEventHandlerRegistrant = (session) => {
  session.on("turnOnVideo", (member) => {
    session.pushSpeech({
      text: `${session.getUsernamePronunciation(member)}がカメラをオンにしました。`,
    });
  });
};

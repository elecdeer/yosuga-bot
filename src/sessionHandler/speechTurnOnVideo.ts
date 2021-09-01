import { SessionEventHandlerRegistrant } from "../types";

export const registerTurnOnVideo: SessionEventHandlerRegistrant = (session) => {
  session.on("turnOnVideo", async (member) => {
    await session.pushSpeech({
      text: `${session.getUsernamePronunciation(member)}がカメラをオンにしました。`,
    });
  });
};

import { SessionEventHandlerRegistrant } from "../types";

export const registerEnterRoom: SessionEventHandlerRegistrant = (session) => {
  session.on("enterChannel", async (member) => {
    await session.pushSpeech({
      text: `${session.getUsernamePronunciation(member)}が入室しました。`,
    });
  });
};

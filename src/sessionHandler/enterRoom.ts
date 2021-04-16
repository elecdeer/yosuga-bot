import { SessionEventHandlerRegister } from "../types";

export const enterRoomRegister: SessionEventHandlerRegister = (session) => {
  session.on("enterChannel", (member) => {
    session.pushSpeech({
      text: `${session.getUsernamePronunciation(member)}が入室しました。`,
    });
  });
};

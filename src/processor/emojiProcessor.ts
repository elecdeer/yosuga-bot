import axios from "axios";
import RGI_Emoji from "emoji-regex";
import { processorLogger } from "processor";
import { logger } from "commands/commands";
import { ProcessorProvider } from "types";

let emojiAnnotation: Record<string, string>;

const fetchEmojiPronunciationMap = async (): Promise<Record<string, string>> => {
  const res = await axios.get<Record<string, string>>(
    "https://raw.githubusercontent.com/elecdeer/emoji-pronunciation-ja/master/data/pronunciation.json"
  );
  return res.data;
};

fetchEmojiPronunciationMap()
  .then((data) => {
    emojiAnnotation = data;
  })
  .catch((err) => {
    logger.info("絵文字発音リストの取得に失敗しました");
    logger.info(err);
  });

const emojiReg = RGI_Emoji();

export const emojiProcessor: ProcessorProvider<void> = () => async(speechText) => {
  // console.log("絵文字: " + speechText.match(reg));
  return {
    ...speechText,
    text: speechText.text.replace(emojiReg, (match) => {
      processorLogger.debug(`${match} => ${emojiAnnotation[match]}`);
      return emojiAnnotation[match] ?? "絵文字";
    },
  };
};

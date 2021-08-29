import { getLogger } from "log4js";

import { SpeechText, TextProcessor } from "../types";

export const processorLogger = getLogger("processor");

export class ProcessorChain {
  processors: TextProcessor[];

  constructor() {
    this.processors = [];
  }

  use(processor: TextProcessor): ProcessorChain {
    this.processors.push(processor);
    return this;
  }

  async process(
    text: SpeechText | SpeechText[],
    collectSameParams?: boolean
  ): Promise<SpeechText[]> {
    //reduceでもう少しうまく書ける気もする

    let prevTexts: SpeechText[] = ([] as SpeechText[]).concat(text);
    for await (const processor of this.processors) {
      const eachResults = await Promise.all(prevTexts.map((textItem) => processor(textItem)));
      //展開
      prevTexts = eachResults.reduce(
        (acc: SpeechText[], cur: SpeechText[] | SpeechText) => acc.concat(cur),
        []
      );
    }

    //同一のvolume,speedのものはくっつける
    if (collectSameParams) {
      prevTexts = prevTexts.reduce((acc: SpeechText[], cur: SpeechText) => {
        const prevLast = acc[acc.length - 1];
        if (prevLast && prevLast.volume === cur.volume && prevLast.speed === cur.speed) {
          prevLast.text = `${prevLast.text}、${cur.text}`;
        } else {
          acc.push(cur);
        }
        return acc;
      }, []);
    }

    return prevTexts;
  }
}

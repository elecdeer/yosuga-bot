# yosuga-bot

![code check](https://github.com/elecdeer/yosuga-bot/workflows/code%20check/badge.svg)

japanese voice bot for discord

## 使い方

そのうち書く

## VOICEVOX APIのAspida定義更新方法

1. `/src/voicevoxApi`下で`$ npx openapi2aspida -i localhost:50021/openapi.json`
必要に応じてホストは変える
2. `/src/voicevoxApi/speakers/index.ts`など必要な部分に`resBody: Readable`を追加
```ts
export type Methods = {
  post: {
    query: {
      speaker: number;
    };

    status: 200;
    reqBody: Types.AudioQuery;
    resBody: Readable;
  };
};
```
3. `/src/voicevoxApi`下で`$ aspida`



import { vi } from "vitest";

import { createMessageMock } from "./messageMock";

import type { DMChannel, NewsChannel, TextChannel, ThreadChannel } from "discord.js";

export const createSendableChannelMock = <
  T extends TextChannel | DMChannel | NewsChannel | ThreadChannel
>(): T => {
  return {
    send: vi.fn(async () => createMessageMock()),
  } as unknown as T;
};

export const createTextChannelMock = createSendableChannelMock<TextChannel>;
export const createDMChannelMock = createSendableChannelMock<DMChannel>;
export const createNewsChannelMock = createSendableChannelMock<NewsChannel>;

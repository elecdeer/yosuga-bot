import { vi } from "vitest";

import { createMessageMock } from "./messageMock";

import type {
  ChatInputCommandInteraction,
  MessageComponentInteraction,
  BaseInteraction,
} from "discord.js";

export const createInteractionMock = <T extends BaseInteraction>(): T => {
  return {
    reply: vi.fn(async () => createMessageMock()),
    editReply: vi.fn(async () => createMessageMock()),
  } as unknown as T;
};

export const createMessageComponentInteractionMock = createInteractionMock<
  MessageComponentInteraction<"cached">
>;

export const createChatInputInteractionMock = createInteractionMock<
  ChatInputCommandInteraction<"cached">
>;

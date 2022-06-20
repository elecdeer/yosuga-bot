import { vi } from "vitest";

import { createMessageMock } from "./messageMock";

import type { Interaction, BaseCommandInteraction, MessageComponentInteraction } from "discord.js";

export const createInteractionMock = <T extends Interaction>(): T => {
  return {
    reply: vi.fn(async () => createMessageMock()),
    editReply: vi.fn(async () => createMessageMock()),
  } as unknown as T;
};

export const createMessageComponentInteractionMock =
  createInteractionMock<MessageComponentInteraction<"cached">>();

export const createBaseCommandInteractionMock =
  createInteractionMock<BaseCommandInteraction<"cached">>();

import { vi } from "vitest";

import type { Message } from "discord.js";

export const createMessageMock = (): Message => {
  const thisMessage = {
    reply: vi.fn(async () => createMessageMock()),
    edit: vi.fn(async () => thisMessage),
  } as unknown as Message;
  return thisMessage;
};

/* eslint-disable @typescript-eslint/unbound-method */
import { describe, expect, it, vi } from "vitest";

import { createReplyHelper } from "./replyHelpter2";

import type {
  BaseCommandInteraction,
  DMChannel,
  Message,
  MessageComponentInteraction,
  TextChannel,
  ThreadChannel,
} from "discord.js";

const createSendableChannelMock = <T>() => {
  return {
    send: vi.fn(),
  } as unknown as T;
};

const createMessageMock = () => {
  return {
    reply: vi.fn(),
  } as unknown as Message;
};

const createCommandInteractionMock = () => {
  return {
    reply: vi.fn(),
  } as unknown as BaseCommandInteraction<"cached">;
};

const createMessageInteractionMock = () => {
  return {
    reply: vi.fn(),
  } as unknown as MessageComponentInteraction<"cached">;
};

describe("replyHelper", () => {
  it("scene.typeでnewThreadを指定した際", async () => {
    const textChannel = {
      threads: {
        create: vi.fn(),
      },
    } as unknown as TextChannel;

    await createReplyHelper({
      type: "newThread",
      channel: textChannel,
      option: {
        name: "threadName",
      },
    });

    expect(textChannel.threads.create).toHaveBeenCalledWith({
      name: "threadName",
    });
  });

  describe("reply引数無し", () => {
    it("scene.typeがtextChannelのとき", async () => {
      const textChannel = createSendableChannelMock<TextChannel>();

      const replyHelper = await createReplyHelper({
        type: "textChannel",
        channel: textChannel,
      });
      const message = await replyHelper.reply({
        content: "hello",
      });

      expect(textChannel.send).toHaveBeenCalledWith({
        content: "hello",
      });

      // eslint-disable-next-line @typescript-eslint/no-unsafe-call
      expect(replyHelper.postedMessages.at(-1)).toBe(message);
    });

    it("scene.typeがthreadChannelのとき", async () => {
      const threadChannel = createSendableChannelMock<ThreadChannel>();

      const replyHelper = await createReplyHelper({
        type: "threadChannel",
        channel: threadChannel,
      });

      const message = await replyHelper.reply({
        content: "hello",
      });

      expect(threadChannel.send).toHaveBeenCalledWith({
        content: "hello",
      });
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call
      expect(replyHelper.postedMessages.at(-1)).toBe(message);
    });

    it("scene.typeがdmChannelのとき", async () => {
      const dmChannel = createSendableChannelMock<DMChannel>();

      const replyHelper = await createReplyHelper({
        type: "dmChannel",
        channel: dmChannel,
      });
      const message = await replyHelper.reply({
        content: "hello",
      });

      expect(dmChannel.send).toHaveBeenCalledWith({
        content: "hello",
      });
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call
      expect(replyHelper.postedMessages.at(-1)).toBe(message);
    });
  });

  describe("messageへのreply", () => {
    it("scene.typeがtextChannelのとき", async () => {
      const textChannel = createSendableChannelMock<TextChannel>();
      const message = createMessageMock();

      const replyHelper = await createReplyHelper({
        type: "textChannel",
        channel: textChannel,
      });
      await replyHelper.reply(
        {
          content: "hello",
        },
        {
          type: "message",
          message: message,
        }
      );

      expect(message.reply).toHaveBeenCalledWith({
        content: "hello",
      });
    });

    it("scene.typeがthreadChannelのとき", async () => {
      const threadChannel = createSendableChannelMock<ThreadChannel>();
      const message = createMessageMock();

      const replyHelper = await createReplyHelper({
        type: "threadChannel",
        channel: threadChannel,
      });

      await replyHelper.reply(
        {
          content: "hello",
        },
        {
          type: "message",
          message: message,
        }
      );

      expect(message.reply).toHaveBeenCalledWith({
        content: "hello",
      });
    });
  });

  describe("commandInteractionへのreply", () => {
    it("scene.typeがtextChannelのとき", async () => {
      const textChannel = createSendableChannelMock<TextChannel>();
      const interaction = createCommandInteractionMock();

      const replyHelper = await createReplyHelper({
        type: "textChannel",
        channel: textChannel,
      });
      await replyHelper.reply(
        {
          content: "hello",
        },
        {
          type: "commandInteraction",
          interaction: interaction,
        }
      );

      expect(interaction.reply).toHaveBeenCalledWith({
        content: "hello",
        fetchReply: true,
      });
    });

    it("scene.typeがthreadChannelのとき", async () => {
      const threadChannel = createSendableChannelMock<ThreadChannel>();
      const interaction = createCommandInteractionMock();

      const replyHelper = await createReplyHelper({
        type: "threadChannel",
        channel: threadChannel,
      });

      await replyHelper.reply(
        {
          content: "hello",
        },
        {
          type: "commandInteraction",
          interaction: interaction,
        }
      );

      expect(interaction.reply).toHaveBeenCalledWith({
        content: "hello",
        threadId: threadChannel.id,
        fetchReply: true,
      });
    });
  });

  describe("messageComponentInteractionへのreply", () => {
    it("scene.typeがtextChannelのとき", async () => {
      const textChannel = createSendableChannelMock<TextChannel>();
      const interaction = createMessageInteractionMock();

      const replyHelper = await createReplyHelper({
        type: "textChannel",
        channel: textChannel,
      });
      await replyHelper.reply(
        {
          content: "hello",
        },
        {
          type: "messageComponentInteraction",
          interaction: interaction,
        }
      );

      expect(interaction.reply).toHaveBeenCalledWith({
        content: "hello",
        fetchReply: true,
      });
    });

    it("scene.typeがthreadChannelのとき", async () => {
      const threadChannel = createSendableChannelMock<ThreadChannel>();
      const interaction = createMessageInteractionMock();

      const replyHelper = await createReplyHelper({
        type: "threadChannel",
        channel: threadChannel,
      });

      await replyHelper.reply(
        {
          content: "hello",
        },
        {
          type: "messageComponentInteraction",
          interaction: interaction,
        }
      );

      expect(interaction.reply).toHaveBeenCalledWith({
        content: "hello",
        threadId: threadChannel.id,
        fetchReply: true,
      });
    });
  });
});

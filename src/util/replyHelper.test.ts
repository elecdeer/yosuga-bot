/* eslint-disable @typescript-eslint/unbound-method */
import { describe, expect, it, vi } from "vitest";

import {
  createChatInputInteractionMock,
  createInteractionMock,
  createMessageComponentInteractionMock,
  createMessageMock,
  createSendableChannelMock,
  createTextChannelMock,
} from "../mock";
import { replyHelper } from "./replyHelper";

import type {
  DMChannel,
  MessageComponentInteraction,
  TextChannel,
  ThreadChannel,
} from "discord.js";

describe("replier", () => {
  it("scene.typeでnewThreadを指定した際", async () => {
    const textChannel = {
      threads: {
        create: vi.fn(() => createTextChannelMock()),
      },
    } as unknown as TextChannel;

    const service = replyHelper({
      type: "newThread",
      channel: textChannel,
      option: {
        name: "threadName",
      },
    });

    await service.reply({
      content: "hello",
    });

    expect(textChannel.threads.create).toHaveBeenCalledWith({
      name: "threadName",
    });
  });

  describe("channelへのreply", () => {
    it("scene.typeがtextChannelのとき", async () => {
      const textChannel = createSendableChannelMock<TextChannel>();

      const replier = replyHelper({
        type: "textChannel",
        channel: textChannel,
      });
      const message = await replier.reply({
        content: "hello",
      });

      expect(textChannel.send).toHaveBeenCalledWith({
        content: "hello",
      });

      expect(replier.postedMessages().at(-1)).toBe(message);
    });

    it("scene.typeがthreadChannelのとき", async () => {
      const threadChannel = createSendableChannelMock<ThreadChannel>();

      const replier = replyHelper({
        type: "threadChannel",
        channel: threadChannel,
      });

      const message = await replier.reply({
        content: "hello",
      });

      expect(threadChannel.send).toHaveBeenCalledWith({
        content: "hello",
      });
      expect(replier.postedMessages().at(-1)).toBe(message);
    });

    it("scene.typeがdmChannelのとき", async () => {
      const dmChannel = createSendableChannelMock<DMChannel>();

      const replier = replyHelper({
        type: "dmChannel",
        channel: dmChannel,
      });
      const message = await replier.reply({
        content: "hello",
      });

      expect(dmChannel.send).toHaveBeenCalledWith({
        content: "hello",
      });
      expect(replier.postedMessages().at(-1)).toBe(message);
    });
  });

  describe("messageへのreply", () => {
    it("scene.typeがtextChannelのとき", async () => {
      const textChannel = createSendableChannelMock<TextChannel>();
      const message = createMessageMock();

      const replier = replyHelper({
        type: "textChannel",
        channel: textChannel,
      });
      await replier.reply(
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

      const replier = replyHelper({
        type: "threadChannel",
        channel: threadChannel,
      });

      await replier.reply(
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
      const interaction = createChatInputInteractionMock();

      const replier = replyHelper({
        type: "textChannel",
        channel: textChannel,
      });
      await replier.reply(
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
      const interaction = createChatInputInteractionMock();

      const replier = replyHelper({
        type: "threadChannel",
        channel: threadChannel,
      });

      await replier.reply(
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
      const interaction = createInteractionMock<MessageComponentInteraction<"cached">>();

      const replier = replyHelper({
        type: "textChannel",
        channel: textChannel,
      });
      await replier.reply(
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
      const interaction = createMessageComponentInteractionMock();

      const replier = replyHelper({
        type: "threadChannel",
        channel: threadChannel,
      });

      await replier.reply(
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

  describe("messageにreplyされたmessageのedit", () => {
    it("scene.typeがtextChannelのとき", async () => {
      const textChannel = createSendableChannelMock<TextChannel>();
      const message = createMessageMock();

      const replier = replyHelper({
        type: "textChannel",
        channel: textChannel,
      });
      const replyMessage = await replier.reply(
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

      await replier.edit(
        {
          content: "world",
        },
        -1
      );
      expect(replyMessage.edit).toHaveBeenCalledWith({
        content: "world",
      });
    });

    it("scene.typeがcommandInteractionのとき", async () => {
      const textChannel = createSendableChannelMock<TextChannel>();
      const interaction = createChatInputInteractionMock();

      const replier = replyHelper({
        type: "textChannel",
        channel: textChannel,
      });
      const replyMessage = await replier.reply(
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

      await replier.edit(
        {
          content: "world",
        },
        -1
      );
      expect(interaction.editReply).toHaveBeenCalledWith({
        content: "world",
      });
    });

    it("scene.typeがmessageComponentInteractionのとき", async () => {
      const textChannel = createSendableChannelMock<TextChannel>();
      const interaction = createInteractionMock<MessageComponentInteraction<"cached">>();

      const replier = replyHelper({
        type: "textChannel",
        channel: textChannel,
      });
      const replyMessage = await replier.reply(
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

      await replier.edit(
        {
          content: "world",
        },
        -1
      );
      expect(interaction.editReply).toHaveBeenCalledWith({
        content: "world",
      });
    });
  });
});

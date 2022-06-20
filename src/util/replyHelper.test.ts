/* eslint-disable @typescript-eslint/unbound-method */
import { describe, expect, it, vi } from "vitest";

import { createInteractionMock, createMessageMock, createSendableChannelMock } from "../mock";
import { createReplyHelper } from "./replyHelpter";

import type {
  BaseCommandInteraction,
  DMChannel,
  MessageComponentInteraction,
  TextChannel,
  ThreadChannel,
} from "discord.js";

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

  describe("channelへのreply", () => {
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

      expect(replyHelper.postedMessages().at(-1)).toBe(message);
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
      expect(replyHelper.postedMessages().at(-1)).toBe(message);
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
      expect(replyHelper.postedMessages().at(-1)).toBe(message);
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
      const interaction = createInteractionMock<BaseCommandInteraction<"cached">>();

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
      const interaction = createInteractionMock<BaseCommandInteraction<"cached">>();

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
      const interaction = createInteractionMock<MessageComponentInteraction<"cached">>();

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
      const interaction = createInteractionMock<MessageComponentInteraction<"cached">>();

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

  describe("messageにreplyされたmessageのedit", () => {
    it("scene.typeがtextChannelのとき", async () => {
      const textChannel = createSendableChannelMock<TextChannel>();
      const message = createMessageMock();

      const replyHelper = await createReplyHelper({
        type: "textChannel",
        channel: textChannel,
      });
      const replyMessage = await replyHelper.reply(
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

      await replyHelper.edit(
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
      const interaction = createInteractionMock<BaseCommandInteraction<"cached">>();

      const replyHelper = await createReplyHelper({
        type: "textChannel",
        channel: textChannel,
      });
      const replyMessage = await replyHelper.reply(
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

      await replyHelper.edit(
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

      const replyHelper = await createReplyHelper({
        type: "textChannel",
        channel: textChannel,
      });
      const replyMessage = await replyHelper.reply(
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

      await replyHelper.edit(
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

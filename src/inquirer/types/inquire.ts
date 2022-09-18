import type { Lazy } from "../../util/lazy";
import type { Messenger, ReplyTarget } from "../../util/messenger/messenger";
import type { APIEmbed } from "discord-api-types/v10";

export type InquirerOptionController = {
  /**
   * 最初にinquirerを送信してからタイムアウトするまでの時間
   */
  time?: number;

  /**
   * 最後に回答状態かコンポーネントの状態が変化してからタイムアウトするまでの時間
   */
  idle?: number;

  /**
   * 使用しなくなったMessageのComponentを削除するかどうか
   */
  clearComponentsOnClose?: boolean;
};

export type InquirerOptionMessage = {
  /**
   * 送信するMessageに含まれるコンテント
   */
  messageContent: Lazy<APIEmbed>;

  /**
   * promptを送信するためのMessenger
   */
  messenger: Messenger;

  /**
   * 最初のMessageの送信先
   */
  rootTarget: ReplyTarget;

  /**
   * 送信するMessageがそのユーザにしか見えないかどうか
   */
  ephemeral?: boolean;
};

export type InquirerOption = InquirerOptionController & InquirerOptionMessage;

import { Modal, ModalOptions } from "discord.js";

export type ModalParam = Partial<Omit<ModalOptions, "customId">>;

export const createModal = (customId: string, param: ModalParam): Modal => {
  const modal = new Modal();
  modal.setCustomId(customId);
  modal.setTitle(param.title ?? "Text Input");
  return modal;
};

import { MessageActionRow } from "discord.js";

import { createButton } from "./wrapper/createButton";
import { createSelectMenu } from "./wrapper/createSelectMenu";

import type { ComponentParam, ComponentRowList } from "./promptTypes";

export const renderComponents = (param: ComponentRowList): MessageActionRow[] => {
  return param.map((row) => {
    const components = row.map((comParam) => {
      return instantiateComponent(comParam);
    });

    const actionRow = new MessageActionRow();
    actionRow.addComponents(...components);
    return actionRow;
  });
};

const instantiateComponent = (componentParam: ComponentParam) => {
  if (componentParam.type === "BUTTON") return createButton(componentParam);
  if (componentParam.type === "SELECT_MENU") return createSelectMenu(componentParam);

  throw new Error("Unknown component type");
};

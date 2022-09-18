import { ComponentType } from "discord-api-types/v10";

import type { ComponentPayload } from "../types/prompt";
import type { APIMessageActionRowComponent } from "discord-api-types/v10";

export const rowComponent = (components: APIMessageActionRowComponent[]): ComponentPayload => {
  return {
    type: ComponentType.ActionRow,
    components: components,
  };
};

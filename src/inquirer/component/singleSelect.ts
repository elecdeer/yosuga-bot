import { createSelectComponent } from "./select";

import type { LazyParam } from "../../util/lazy";
import type { PromptComponent } from "../promptTypes";
import type { SelectorParam } from "../wrapper/createSelectMenu";
import type { SelectOption } from "./select";

export const createSingleSelectComponent = <TOptionValue>(param: {
  selector: LazyParam<Omit<SelectorParam, "maxValues" | "minValues">>;
  options: SelectOption<TOptionValue>[];
  customId?: string;
}): PromptComponent<TOptionValue> => {
  const { getStatus, renderComponent, hook } = createSelectComponent(param);
  return {
    renderComponent,
    hook,
    getStatus: () => {
      const status = getStatus();
      if (status.status === "answered") {
        return {
          status: "answered",
          value: status.value[0],
        };
      } else {
        return status;
      }
    },
  };
};

import { Lazy } from "../../util/lazy";
import { PromptComponent } from "../promptTypes";
import { createMultiSelectComponent, SelectOption, SelectorParam } from "./multiSelect";

export const createSingleSelectComponent = <TOptionValue>(param: {
  selector: Lazy<Omit<SelectorParam, "maxValues" | "minValues">>;
  options: SelectOption<TOptionValue>[];
  customId?: string;
  emptyAnswered?: boolean;
}): PromptComponent<TOptionValue> => {
  const { getStatus, renderComponent, hook } = createMultiSelectComponent(param);
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

import { LazyParam } from "../../util/lazy";
import { PromptComponent } from "../promptTypes";
import { SelectorParam } from "../wrapper/createSelectMenu";
import { createMultiSelectComponent, SelectOption } from "./multiSelect";

export const createSingleSelectComponent = <TOptionValue>(param: {
  selector: LazyParam<Omit<SelectorParam, "maxValues" | "minValues">>;
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

import { createPagedSelectComponent } from "./pagedSelect";

import type { LazyParam } from "../../util/lazy";
import type { PromptComponent } from "../promptTypes";
import type { SelectorParam } from "../wrapper/createSelectMenu";
import type { PagedOption } from "./pagedSelect";

export const createPagedSingleSelectComponent = <TOptionValue>(param: {
  selector: LazyParam<Omit<SelectorParam, "minValues" | "maxValues">>;
  options: PagedOption<TOptionValue>;
  pageTorus?: boolean;
  customId?: string;
}): PromptComponent<TOptionValue> => {
  const { getStatus, renderComponent, hook } = createPagedSelectComponent(param);
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

export type ButtonAction = {
  type: "click";
  customId: string;
};

export type SelectAction = {
  type: "select";
  customId: string;
  selectedItems: string[];
};

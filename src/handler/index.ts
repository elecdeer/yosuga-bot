import type { Yosuga } from "../yosuga";

export type HandlerRegister = (yosuga: Yosuga) => void;

const handlerRegisters: HandlerRegister[] = [
  //ここにhandlerを列挙
];

export const registerHandlers = (yosuga: Yosuga) => {
  handlerRegisters.forEach((register) => register(yosuga));
};

//SessionはsessionStartイベントにフックする形にする

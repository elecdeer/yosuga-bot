import { describe, expect, test, vi } from "vitest";

import { createEventFlow } from "./eventFlow";

describe("utils/eventFlow", () => {
  describe("on(), emit()", () => {
    test("登録した複数のhandlerが呼ばれる", () => {
      const handler1 = vi.fn();
      const handler2 = vi.fn();
      const handler3 = vi.fn();

      const flow = createEventFlow();
      flow.on(handler1);
      flow.on(handler2);
      flow.on(handler3);

      const obj = {
        str: "test data",
      };

      flow.emit(obj);
      expect(handler1).toBeCalledWith(obj);
      expect(handler2).toBeCalledWith(obj);
      expect(handler3).toBeCalledWith(obj);
    });
  });

  describe("once()", () => {
    test("発火後は削除される", () => {
      const handler = vi.fn();

      const flow = createEventFlow();
      flow.once(handler);

      flow.emit(0);
      flow.emit(0);
      expect(handler).toBeCalledTimes(1);
    });
  });

  describe("off()", () => {
    test("削除したhandlerが呼ばれない", () => {
      const handler = vi.fn();

      const flow = createEventFlow();
      flow.on(handler);
      flow.off(handler);

      flow.emit(0);
      expect(handler).not.toBeCalled();
    });
  });

  describe("offAll()", () => {
    test("削除したhandlerが呼ばれない", () => {
      const handler = vi.fn();
      const handler2 = vi.fn();

      const flow = createEventFlow();
      flow.on(handler);
      flow.on(handler2);
      flow.offAll();

      flow.emit(0);
      expect(handler).not.toBeCalled();
    });
  });

  describe("offAllInBranch()", () => {
    test("このBranchのhandlerのみが削除される", () => {
      const handler = vi.fn();
      const handler2 = vi.fn();

      const flow = createEventFlow();
      const subFlow = flow.filter(() => true);

      flow.on(handler);
      subFlow.on(handler2);
      subFlow.offAllInBranch();

      flow.emit(0);
      expect(handler).toHaveBeenCalled();
      expect(handler2).not.toHaveBeenCalled();
    });
  });

  describe("filter()", () => {
    test("元のflowに影響を与えない", () => {
      const handler = vi.fn();

      const flow = createEventFlow();
      flow.filter(() => false);

      flow.on(handler);
      flow.emit(0);

      expect(handler).toHaveBeenCalledWith(0);
    });

    test("filterに通過したemitしか発火しない", () => {
      const handler = vi.fn();

      const flow = createEventFlow<number>();
      const filteredFlow = flow.filter((num) => num % 2 === 0);

      filteredFlow.on(handler);

      flow.emit(0);
      flow.emit(1);
      flow.emit(2);

      expect(handler).toHaveBeenCalledWith(0);
      expect(handler).not.toHaveBeenCalledWith(1);
      expect(handler).toHaveBeenCalledWith(2);
    });

    test("複数指定したfilterに通過したemitしか発火しない", () => {
      const handler = vi.fn();

      const flow = createEventFlow<number>();

      const filteredFlow = flow.filter(
        (num) => num % 2 === 0,
        (num) => num % 3 === 0
      );

      //6の倍数だけ通過する
      filteredFlow.on(handler);

      flow.emit(0);
      flow.emit(2);
      flow.emit(3);
      flow.emit(6);

      expect(handler).toHaveBeenCalledWith(0);
      expect(handler).not.toHaveBeenCalledWith(2);
      expect(handler).not.toHaveBeenCalledWith(3);
      expect(handler).toHaveBeenCalledWith(6);
    });

    test("重ねられたfilterに通過したemitしか発火しない", () => {
      const handler = vi.fn();

      const flow = createEventFlow<number>();

      const filteredFlow = flow.filter((num) => num % 2 === 0).filter((num) => num % 3 === 0);

      //6の倍数だけ通過する
      filteredFlow.on(handler);

      flow.emit(0);
      flow.emit(2);
      flow.emit(3);
      flow.emit(6);

      expect(handler).toHaveBeenCalledWith(0);
      expect(handler).not.toHaveBeenCalledWith(2);
      expect(handler).not.toHaveBeenCalledWith(3);
      expect(handler).toHaveBeenCalledWith(6);
    });

    test("型を絞り込むことができる", () => {
      const handler = vi.fn<[string], void>();

      const flow = createEventFlow<number | string>();
      const stringGuard = (numOrStr: number | string): numOrStr is string =>
        typeof numOrStr === "string";
      const filteredFlow = flow.filter<string>(stringGuard);

      filteredFlow.on((numOrStr) => handler(numOrStr));
      flow.emit(0);

      expect(handler).not.toHaveBeenCalledWith(0);
    });
  });
});

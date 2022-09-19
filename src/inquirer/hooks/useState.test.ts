import { describe, expect, test, vi } from "vitest";

import { getAbandonLogger } from "../../logger/abandonLogger";
import { createHookContext } from "../hookContext";
import { useState } from "./useState";

describe("/inquirer/hooks/useState", () => {
  describe("useState()", () => {
    test("初期値が保持される", () => {
      const controller = createHookContext(vi.fn(), getAbandonLogger());

      {
        controller.startRender();
        const [state] = useState(3);
        expect(state).toBe(3);
        controller.endRender();
      }

      {
        controller.startRender();
        const [state] = useState(10);
        expect(state).toBe(3);
        controller.endRender();
      }

      controller.close();
    });

    test("setStateで正しく状態が保存される", () => {
      const controller = createHookContext(vi.fn(), getAbandonLogger());

      {
        controller.startRender();
        const [state, setState] = useState(2);
        setState(3);
        expect(state).toBe(2);

        controller.endRender();
      }

      {
        controller.startRender();
        const [state, setState] = useState(2);
        expect(state).toBe(3);
        setState((prev) => prev + 2);
        setState((prev) => prev + 3);
        expect(state).toBe(3);
        controller.endRender();
      }

      {
        controller.startRender();
        const [state] = useState(2);
        expect(state).toBe(3 + 2 + 3);
        controller.endRender();
      }

      controller.close();
    });

    test("setStateの呼び出しでdispatchが呼ばれる", () => {
      const dispatch = vi.fn();
      const controller = createHookContext(dispatch, getAbandonLogger());

      {
        controller.startRender();
        const [_, setState] = useState(2);
        setState(3);
        expect(dispatch).toHaveBeenCalledTimes(1);
        controller.endRender();
      }

      {
        controller.startRender();
        const [_, setState] = useState(2);
        setState((prev) => prev + 2);
        expect(dispatch).toHaveBeenCalledTimes(2);
        controller.endRender();
      }

      controller.close();
    });

    test("context外で呼び出すとエラーになる", () => {
      expect(() => {
        useState(0);
      }).toThrowError();
    });
  });
});

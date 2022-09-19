import { describe, expect, test, vi } from "vitest";

import { getAbandonLogger } from "../../logger/abandonLogger";
import { createMessageMock } from "../../mock";
import { createHookContext } from "../hookContext";
import { useEffect } from "./useEffect";

describe("/inquirer/hooks/useEffect", () => {
  describe("useEffect()", () => {
    test("mount時に正しくコールバックが呼ばれる", () => {
      const controller = createHookContext(vi.fn(), getAbandonLogger());

      const callback = vi.fn();

      const render = () => {
        controller.startRender();
        useEffect(callback);
        controller.endRender();
      };

      render();
      controller.afterMount(createMessageMock());
      expect(callback).toBeCalledTimes(1);

      controller.beforeUnmount();
      render();
      controller.afterMount(createMessageMock());
      expect(callback).toBeCalledTimes(2);
    });

    test("unmount時に正しくクリーンナップが呼ばれる", () => {
      const controller = createHookContext(vi.fn(), getAbandonLogger());

      const cleanup = vi.fn();

      controller.startRender();
      useEffect(() => cleanup);
      controller.endRender();

      controller.afterMount(createMessageMock());
      expect(cleanup).not.toHaveBeenCalled();
      controller.beforeUnmount();
      expect(cleanup).toBeCalledTimes(1);
    });

    test("マウントが行われない場合はコールバックは呼ばれない", () => {
      const controller = createHookContext(vi.fn(), getAbandonLogger());

      const callback = vi.fn();

      controller.startRender();
      useEffect(callback);
      controller.endRender();

      expect(callback).not.toHaveBeenCalled();
    });

    test("depsを指定しない場合は毎回呼ばれる", () => {
      const controller = createHookContext(vi.fn(), getAbandonLogger());

      const callback = vi.fn();

      const renderWithMount = () => {
        callback.mockClear();

        controller.beforeUnmount();
        controller.startRender();
        useEffect(callback);
        controller.endRender();
        controller.afterMount(createMessageMock());
      };

      renderWithMount();
      expect(callback).toHaveBeenCalledOnce();

      renderWithMount();
      expect(callback).toHaveBeenCalledOnce();

      renderWithMount();
      expect(callback).toHaveBeenCalledOnce();
    });

    test("depsが空配列の場合は初回のみ呼ばれる", () => {
      const controller = createHookContext(vi.fn(), getAbandonLogger());

      const callback = vi.fn();

      const renderWithMount = () => {
        callback.mockClear();

        controller.beforeUnmount();
        controller.startRender();
        useEffect(callback, []);
        controller.endRender();
        controller.afterMount(createMessageMock());
      };

      renderWithMount();
      expect(callback).toHaveBeenCalledOnce();

      renderWithMount();
      expect(callback).not.toHaveBeenCalled();
    });

    test("depsが指定されている場合はdepsが変わるまで呼ばれない", () => {
      const controller = createHookContext(vi.fn(), getAbandonLogger());

      const callback = vi.fn();

      const renderWithMount = (depsValue: unknown[]) => {
        callback.mockClear();

        controller.beforeUnmount();
        controller.startRender();
        useEffect(callback, depsValue);
        controller.endRender();
        controller.afterMount(createMessageMock());
      };

      renderWithMount([0]);
      expect(callback).toHaveBeenCalledOnce();

      renderWithMount([0]);
      expect(callback).not.toHaveBeenCalled();

      const value = {
        count: 0,
      };
      renderWithMount([value]);
      expect(callback).toHaveBeenCalledOnce();

      value.count = value.count + 1;
      renderWithMount([value]);
      // depsの参照が変わっていないので呼ばれない
      expect(callback).not.toHaveBeenCalled();
    });
  });
});

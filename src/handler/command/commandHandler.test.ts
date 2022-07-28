import { describe, expect, test, vi } from "vitest";

import { createEventFlow } from "../../eventFlow/eventFlow";
import { registerHandlersFromCommandTree } from "../commandHandler";

import type { Yosuga, YosugaEventParam } from "../../yosuga";
import type { CommandTree } from "./index";
import type { Interaction } from "discord.js";

const createSourceFlowParamMock = ({
  commandName,
  subCommandName = null,
  subCommandGroupName = null,
}: {
  commandName: string;
  subCommandName?: string | null;
  subCommandGroupName?: string | null;
}) => {
  return {
    interaction: {
      commandName: commandName,
      options: {
        getSubcommand: () => subCommandName,
        getSubcommandGroup: () => subCommandGroupName,
      },
      isChatInputCommand: () => true,
    } as unknown as Interaction,
  } as unknown as YosugaEventParam<{
    interaction: Interaction;
  }>;
};

describe("/src/handler/command/commandHandler.ts", () => {
  describe("registerHandlersFromCommandTree()", () => {
    describe("正しくhandlerが登録される", () => {
      const mocks = {
        testHandler: vi.fn(),
        testHandler2: vi.fn(),
        sub: {
          testHandler2Sub: vi.fn(),
          testHandler2Sub2: vi.fn(),
          sub: {
            testHandler2Sub2Sub: vi.fn(),
          },
        },
      };

      const tree: CommandTree = [
        {
          props: {
            name: "testCommand",
            description: "testCommandDescription",
            permission: "USER",
          },
          event: {
            registerEvent: (flow) => {
              flow.on(mocks.testHandler);
            },
            slashOption: vi.fn(),
          },
        },
        {
          props: {
            name: "testCommand2",
            description: "testCommand2Description",
            permission: "USER",
          },
          event: {
            registerEvent: (flow) => {
              flow.on(mocks.testHandler2);
            },
            slashOption: vi.fn(),
          },
          sub: [
            {
              props: {
                name: "testCommand2Sub",
                description: "testCommand2SubDescription",
                permission: "USER",
              },
              event: {
                registerEvent: (flow) => {
                  flow.on(mocks.sub.testHandler2Sub);
                },
                slashOption: vi.fn(),
              },
            },
            {
              props: {
                name: "testCommand2Sub2",
                description: "testCommand2Sub2Description",
                permission: "USER",
              },
              event: {
                registerEvent: (flow) => {
                  flow.on(mocks.sub.testHandler2Sub2);
                },
                slashOption: vi.fn(),
              },
              sub: [
                {
                  props: {
                    name: "testCommand2Sub2Sub",
                    description: "testCommand2Sub2SubDescription",
                    permission: "USER",
                  },
                  event: {
                    registerEvent: (flow) => {
                      flow.on(mocks.sub.sub.testHandler2Sub2Sub);
                    },
                    slashOption: vi.fn(),
                  },
                },
              ],
            },
          ],
        },
      ];

      // root / subgroup / subcommand

      test("testCommand/null/null", () => {
        vi.resetAllMocks();

        const sourceFlow: Yosuga["events"]["interactionCreate"] = createEventFlow();
        registerHandlersFromCommandTree(sourceFlow, tree);

        sourceFlow.emit(
          createSourceFlowParamMock({
            commandName: "testCommand",
          })
        );
        expect(mocks.testHandler).toBeCalled();
        expect(mocks.testHandler2).not.toBeCalled();
        expect(mocks.sub.testHandler2Sub).not.toBeCalled();
        expect(mocks.sub.testHandler2Sub2).not.toBeCalled();
        expect(mocks.sub.sub.testHandler2Sub2Sub).not.toBeCalled();
      });

      test("testCommand2/null/testCommand2Sub", () => {
        vi.resetAllMocks();

        const sourceFlow: Yosuga["events"]["interactionCreate"] = createEventFlow();
        registerHandlersFromCommandTree(sourceFlow, tree);

        sourceFlow.emit(
          createSourceFlowParamMock({
            commandName: "testCommand2",
            subCommandName: "testCommand2Sub",
          })
        );

        expect(mocks.testHandler).not.toBeCalled();
        expect(mocks.testHandler2).toHaveBeenCalledOnce();
        expect(mocks.sub.testHandler2Sub).toHaveBeenCalledOnce();
        expect(mocks.sub.testHandler2Sub2).not.toBeCalled();
        expect(mocks.sub.sub.testHandler2Sub2Sub).not.toBeCalled();
      });

      test("testCommand/null/testCommand2Sub", () => {
        vi.resetAllMocks();

        const sourceFlow: Yosuga["events"]["interactionCreate"] = createEventFlow();
        registerHandlersFromCommandTree(sourceFlow, tree);

        sourceFlow.emit(
          createSourceFlowParamMock({
            commandName: "testCommand",
            subCommandName: "testCommand2Sub",
          })
        );

        expect(mocks.testHandler).toBeCalled();
        expect(mocks.testHandler2).not.toBeCalled();
        expect(mocks.sub.testHandler2Sub).not.toBeCalled();
        expect(mocks.sub.testHandler2Sub2).not.toBeCalled();
        expect(mocks.sub.sub.testHandler2Sub2Sub).not.toBeCalled();
      });

      test("testCommand2/testCommand2Sub2/null", () => {
        vi.resetAllMocks();

        const sourceFlow: Yosuga["events"]["interactionCreate"] = createEventFlow();
        registerHandlersFromCommandTree(sourceFlow, tree);

        sourceFlow.emit(
          createSourceFlowParamMock({
            commandName: "testCommand2",
            subCommandGroupName: "testCommand2Sub2",
          })
        );
        expect(mocks.testHandler).not.toBeCalled();
        expect(mocks.testHandler2).toHaveBeenCalledOnce();
        expect(mocks.sub.testHandler2Sub).not.toBeCalled();
        expect(mocks.sub.testHandler2Sub2).toHaveBeenCalledOnce();
        expect(mocks.sub.sub.testHandler2Sub2Sub).not.toBeCalled();
      });

      test("testCommand2/testCommand2Sub/testCommand2Sub2Sub", () => {
        vi.resetAllMocks();

        const sourceFlow: Yosuga["events"]["interactionCreate"] = createEventFlow();
        registerHandlersFromCommandTree(sourceFlow, tree);

        sourceFlow.emit(
          createSourceFlowParamMock({
            commandName: "testCommand2",
            subCommandGroupName: "testCommand2Sub2",
            subCommandName: "testCommand2Sub2Sub",
          })
        );
        expect(mocks.testHandler).not.toBeCalled();
        expect(mocks.testHandler2).toHaveBeenCalledOnce();
        expect(mocks.sub.testHandler2Sub).not.toBeCalled();
        expect(mocks.sub.testHandler2Sub2).toHaveBeenCalledOnce();
        expect(mocks.sub.sub.testHandler2Sub2Sub).toHaveBeenCalledOnce();
      });
    });
  });
});

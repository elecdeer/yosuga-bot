// import { MessageActionRow, MessageSelectMenu } from "discord.js";
//
// import { PromptComponentFactory } from "../promptTypes";
//
// type SelectItem = "AAA" | "BBB" | "CCC";
//
// export const createSelectComponent: PromptComponentFactory<"AAA" | "BBB" | "CCC"> = (param) => {
//   let selected: SelectItem | null = null;
//
//   return {
//     getStatus: () => {
//       if (selected === null) {
//         return {
//           status: "unanswered",
//         };
//       } else {
//         return {
//           status: "answered",
//           value: selected,
//         };
//       }
//     },
//     renderComponent: () => {
//       return [
//         new MessageActionRow().addComponents(
//           new MessageSelectMenu().setCustomId("select").setOptions([
//             {
//               value: "AAA",
//               label: "AAA",
//             },
//             {
//               value: "BBB",
//               label: "BBB",
//             },
//             {
//               value: "CCC",
//               label: "CCC",
//             },
//           ])
//         ),
//       ];
//     },
//     hook: (message, hookParam, updateCallback) => {
//       const collector = message.createMessageComponentCollector({
//         time: hookParam.time,
//         idle: hookParam.idle,
//       });
//
//       collector.on("collect", async (interaction) => {
//         if (!interaction.isSelectMenu() || interaction.customId !== "select") {
//           return;
//         }
//         const value = interaction.values[0];
//         selected = value as SelectItem;
//         await interaction.deferUpdate();
//
//         updateCallback();
//       });
//
//       collector.on("end", (_, reason) => {
//         if (reason === "cleanHook") {
//           return;
//         }
//
//         updateCallback();
//       });
//
//       return () => {
//         collector.stop("cleanHook");
//       };
//     },
//   };
// };

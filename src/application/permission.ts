import { getLogger } from "log4js";

import type { Guild, GuildMember, Role } from "discord.js";

export const CommandPermission = {
  Everyone: 0,
  GuildAdmin: 5,
  AppOwner: 100,
} as const;
export type CommandPermission = typeof CommandPermission[keyof typeof CommandPermission];

const logger = getLogger("permissionManager");

const yosugaManagerRoleName = "YosugaManager";
/**
 * YosugaManagerロールの生成
 * @param guild
 */
export const createYosugaManagerRole = async (guild: Guild): Promise<Role> => {
  logger.debug(`try createManagerRole guild:${guild.id}`);
  const role = await guild.roles.create({
    name: yosugaManagerRoleName,
    color: [255, 182, 193],
    reason: "YosugaのGuildレベル設定の変更権限を持つ",
  });
  logger.debug(`created: ${role.id}`);
  return role;
};

/**
 * YosugaMangerロールを取得
 * 無ければ新しくロールを作成する
 * @param guild
 */
export const getYosugaManagerRole = async (guild: Guild): Promise<Role | null> => {
  await guild.fetch();
  await guild.roles.fetch();
  const existingRole = guild.roles.cache.find((role) => role.name === yosugaManagerRoleName);
  if (existingRole) {
    logger.debug(`managerRole: ${existingRole}`);
    return existingRole;
  } else {
    try {
      return await createYosugaManagerRole(guild);
    } catch (e) {
      logger.error(e);
      return null;
    }
  }
};

/**
 * GuildMemberのコマンド権限を取得する
 * @param member
 */
export const getMemberPermission = async (member: GuildMember): Promise<CommandPermission> => {
  const managerRole = await getYosugaManagerRole(member.guild);

  if (member.id === member.client.application?.owner?.id) return CommandPermission.AppOwner;
  if (managerRole && managerRole.members.has(member.id)) return CommandPermission.GuildAdmin;
  return CommandPermission.Everyone;
};

/**
 * memberがlevel以上の権限を持っているかどうか
 * @param member
 * @param level
 */
export const hasMemberPermission = async (
  member: GuildMember,
  level: CommandPermission
): Promise<boolean> => {
  logger.debug(`hasMemberPermission`);
  const memberPermission = await getMemberPermission(member);
  return comparePermission(level, memberPermission);
};

/**
 * targetがbenchmark以上の権限であるかを比較
 * @param benchmark
 * @param target
 */
export const comparePermission = (benchmark: CommandPermission, target: CommandPermission) => {
  return benchmark <= target;
};

// export const createPermissionRegisterData = (command: CommandHandler) => {
//   const commandPermission = command.commandProps.permission;
//   if (commandPermission === CommandPermission.Everyone) {
//     return {
//       defaultPermission: true,
//       allow: [],
//     };
//   } else {
//     const allowList: ApplicationCommandPermissionData[] = [];
//
//     if (comparePermission(commandPermission, CommandPermission.GuildAdmin)) {
//
//     }
//     if (comparePermission(commandPermission, CommandPermission.AppOwner)) {
//       allowList.push({
//         type: "USER",
//         id:
//       })
//     }
//     return {
//       defaultPermission: false,
//       allow: allowList,
//     };
//   }
// };

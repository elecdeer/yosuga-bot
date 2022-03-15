import { Guild, GuildMember, Role } from "discord.js";
import { getLogger } from "log4js";

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
  logger.debug(`createManagerRole guild:${guild.id}`);
  return await guild.roles.create({
    name: yosugaManagerRoleName,
    color: [16, 758, 465],
    reason: "YosugaのGuildレベル設定の変更権限を持つ",
  });
};

/**
 * YosugaMangerロールを取得
 * 無ければ新しくロールを作成する
 * @param guild
 */
export const getYosugaManagerRole = async (guild: Guild): Promise<Role> => {
  await guild.fetch();
  const existingRole = guild.roles.cache.find((role) => role.name === yosugaManagerRoleName);
  if (existingRole) {
    return existingRole;
  } else {
    return createYosugaManagerRole(guild);
  }
};

/**
 * GuildMemberのコマンド権限を取得する
 * @param member
 */
export const getMemberPermission = async (member: GuildMember): Promise<CommandPermission> => {
  if (member.id === member.client.application?.owner?.id) return CommandPermission.AppOwner;

  const managerRole = await getYosugaManagerRole(member.guild);
  if (managerRole.members.has(member.id)) return CommandPermission.GuildAdmin;

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
  const memberPermission = await getMemberPermission(member);
  return level <= memberPermission;
};

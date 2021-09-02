import {
  ApplicationCommandPermissionData,
  Collection,
  Guild,
  GuildMember,
  Permissions,
  Role,
  Snowflake,
} from "discord.js";
import { getLogger } from "log4js";

export const CommandPermission = {
  Everyone: 0,
  GuildAdmin: 5,
  AppOwner: 100,
} as const;
export type CommandPermission = typeof CommandPermission[keyof typeof CommandPermission];

const logger = getLogger("permissionManager");

export const hasAdminPermission = (role: Role): boolean => {
  return (role.permissions.bitfield & Permissions.FLAGS.ADMINISTRATOR) > 0;
};

export const fetchAdminRolesInGuild = async (
  guild: Guild
): Promise<Collection<Snowflake, Role>> => {
  await guild.roles.fetch();
  logger.debug(`roles: ${guild.roles.cache.map((role) => role.name).join(",")}`);
  return guild.roles.cache.filter((role) => hasAdminPermission(role));
};

export const constructPermissionData = async (
  permission: CommandPermission,
  guild: Guild
): Promise<{
  defaultPermission: boolean;
  allowList: ApplicationCommandPermissionData[];
}> => {
  if (permission <= CommandPermission.Everyone) {
    return {
      defaultPermission: true,
      allowList: [],
    };
  }

  const allowList: ApplicationCommandPermissionData[] = [];

  if (permission <= CommandPermission.GuildAdmin) {
    const roles = await fetchAdminRolesInGuild(guild);
    // logger.debug(`adminRoles: ${roles.map((role) => role.name).join(",")}`);

    const list: ApplicationCommandPermissionData[] = roles.map((role) => ({
      type: "ROLE",
      id: role.id,
      permission: true,
    }));

    allowList.push(...list);
  }

  if (permission <= CommandPermission.AppOwner) {
    allowList.push({
      type: "USER",
      id: guild.client.application?.owner?.id ?? "",
      permission: true,
    });
  }

  return {
    defaultPermission: false,
    allowList: allowList,
  };
};

export const fetchPermission = async (member: GuildMember): Promise<CommandPermission> => {
  if (member.client.application?.owner?.id === member.id) return CommandPermission.AppOwner;

  await member.guild.roles.fetch();
  if (hasAdminPermission(member.guild.roles.highest)) {
    return CommandPermission.GuildAdmin;
  }

  return CommandPermission.Everyone;
};

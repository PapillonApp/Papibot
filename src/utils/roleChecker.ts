import { GuildMember } from "discord.js";

const roleMap: Record<string, string> = {
    maintainer: process.env.ROLE_MAINTAINER || "",
    papillon_team: process.env.ROLE_PAPILLON_TEAM || "",
    selected_admin: process.env.ROLE_SELECTED_ADMIN || "",
    moderator: process.env.ROLE_MODERATOR || "",
    papibot: process.env.ROLE_PAPIBOT || "",
    support: process.env.ROLE_SUPPORT || ""
};

/**
 * Vérifie si un membre possède au moins un des rôles donnés
 */
export function hasAnyRole(member: GuildMember, roleNames: string[]): boolean {
    return roleNames.some(
        (roleName) => roleMap[roleName] && member.roles.cache.has(roleMap[roleName])
    );
}

/**
 * Vérifie si un membre possède un rôle "staff"
 */
export function hasStaffRole(member: GuildMember): boolean {
    const staffRoles = ["maintainer", "papillon_team", "selected_admin", "moderator", "papibot"];
    return hasAnyRole(member, staffRoles);
}

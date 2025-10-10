import { GuildMember } from "discord.js";
import config from '../../config.json';

export default async (member: GuildMember) => {
    try {
        member.roles.add(config.server.roles.unverified);
    } catch { return; }
}
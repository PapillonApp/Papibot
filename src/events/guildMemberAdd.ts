import { GuildMember } from "discord.js";
import { ExtendedClient } from "../types/ExtendedClient";

export default async (bot: ExtendedClient, member: GuildMember) => {

    try {

        await member.roles.add(process.env.ROLE_UNVERIFIED || "");
        console.log(`Rôle non vérifié ajouté à ${member.user.tag}`);

    } catch (error) {

        console.error(`Impossible d'ajouter le rôle à ${member.user.tag}:`, error);
    
    }
    
};
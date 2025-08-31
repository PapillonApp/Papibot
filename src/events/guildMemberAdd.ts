import { ContainerBuilder, GuildChannel, GuildMember, GuildTextBasedChannel, MessageFlags, SectionBuilder, TextDisplayBuilder, ThumbnailBuilder } from "discord.js";
import { ExtendedClient } from "../types/ExtendedClient";

export default async (bot: ExtendedClient, member: GuildMember) => {

    const welcomeChannel = member.guild.channels.cache.get(`${process.env.CHANNEL_WELCOME_MESSAGES}`) as GuildTextBasedChannel;

    // Autorole
    try {
        await member.roles.add(process.env.ROLE_UNVERIFIED || "");
    } catch {
        return;
    }

    // Welcome message
    const title = new TextDisplayBuilder()
        .setContent(`${process.env.BLUE_DISCORD} **<@${member.user.id}> vient de rejoindre le serveur !**`);

    const description = new TextDisplayBuilder()
        .setContent(`-# Nous sommes désormais **${member.guild.memberCount} membres** sur le Discord de Papillon !`)

    const thumbnail = new ThumbnailBuilder().setURL(member.user.displayAvatarURL());

    const section = new SectionBuilder()
        .addTextDisplayComponents(title, description)
        .setThumbnailAccessory(thumbnail);

    const container = new ContainerBuilder()
        .addSectionComponents(section);

    welcomeChannel.send({
        flags: [MessageFlags.IsComponentsV2],
        components: [container]
    });
    
};
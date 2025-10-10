import { ExtendedClient } from "../types/extendedClient";
import { errorMessage } from "../functions/errorMessage";
import { ContainerBuilder, GuildMember, Interaction, MessageFlags, SectionBuilder, TextDisplayBuilder, ThumbnailBuilder } from "discord.js";
import { Command } from "../types/command";
import config from '../../config.json';

export default async function interactionCreate(bot: ExtendedClient, interaction: Interaction): Promise<void> {
    if(interaction.isChatInputCommand()) {
        const command: Command | undefined = bot.commands.get(interaction.commandName);
        if(!command) {
            await interaction.reply(errorMessage("Commande introuvable. Vérifie le nom et réessaie."));
            return;
        }
        
        try {
            if(command.run) {
                await command.run(bot, interaction);
            }
        } catch (err) {
            await interaction.reply(errorMessage("Une erreur est survenue lors de l’exécution de la commande."));
            return console.error(err);
        }
    }

    if(interaction.isButton()) {
        if(interaction.customId === "acceptRules") {
            if((interaction.member as GuildMember).roles.cache.has(config.server.roles.unverified || "")) {
                const title = new TextDisplayBuilder().setContent(`## Bienvenue parmis nous ! ${config.emojis.papillon}`);
                const description = new TextDisplayBuilder().setContent(`Tu as désormais accès à l'entièreté du serveur Discord de Papillon, bon séjour parmis nous ! 💚`);
                const thumbnail = new ThumbnailBuilder({
                    media: {
                        url: `https://raw.githubusercontent.com/PapillonApp/Papibot/refs/heads/main/src/assets/papillon_purple.png`,
                    },
                });
                const section = new SectionBuilder().addTextDisplayComponents(title, description).setThumbnailAccessory(thumbnail);
                const container = new ContainerBuilder().addSectionComponents(section);
                
                await (interaction.member as GuildMember).roles.remove(config.server.roles.unverified);
                await interaction.reply({
                    flags: [MessageFlags.IsComponentsV2, MessageFlags.Ephemeral],
                    components: [container]
                });
            }
        }
    }
}
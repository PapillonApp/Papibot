import { ExtendedClient } from "../types/extendedClient";
import { errorMessage } from "../functions/errorMessage";
import { ActionRowBuilder, ContainerBuilder, GuildMember, Interaction, LabelBuilder, MessageFlags, ModalBuilder, SectionBuilder, TextDisplayBuilder, TextInputBuilder, TextInputStyle, ThumbnailBuilder } from "discord.js";
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

    if(interaction.isStringSelectMenu()) {
        if(interaction.customId === "selectTicketType") {
            const selected = interaction.values[0];
            switch(selected) {
                case "problemTicketType":
                    const modalTicketProblem = new ModalBuilder()
                        .setCustomId("modalTicketProblem")
                        .setTitle(`🦋 Problème sur Papillon`);
                    const inputModelProblem = new TextInputBuilder()
                        .setCustomId("inputModelProblem")
                        .setLabel("Quel est ton appareil ? 📱")
                        .setStyle(TextInputStyle.Short)
                        .setPlaceholder("iPhone 15 Pro")
                        .setRequired(true);
                    const inputVersionProblem = new TextInputBuilder()
                        .setCustomId("inputVersionProblem")
                        .setLabel("Quelle est ta version de Papillon ? 🦋")
                        .setStyle(TextInputStyle.Short)
                        .setPlaceholder("8.2.0")
                        .setRequired(true);
                    const inputDescriptionProblem = new TextInputBuilder()
                        .setCustomId("inputDescriptionProblem")
                        .setLabel("Décris brièvement ton problème ci-dessous ⬇️")
                        .setStyle(TextInputStyle.Paragraph)
                        .setPlaceholder("Je n'arrives pas à me connecter à mon compte PRONOTE car...")
                        .setRequired(true);
                    
                    const actionRowProblem1 = new ActionRowBuilder<TextInputBuilder>().addComponents(inputModelProblem);
                    const actionRowProblem2 = new ActionRowBuilder<TextInputBuilder>().addComponents(inputVersionProblem);
                    const actionRowProblem3 = new ActionRowBuilder<TextInputBuilder>().addComponents(inputDescriptionProblem);
                    modalTicketProblem.addComponents(actionRowProblem1, actionRowProblem2, actionRowProblem3);
                    await interaction.showModal(modalTicketProblem);
                break;

                case "questionTicketType":
                    const modalTicketQuestion = new ModalBuilder()
                        .setCustomId("modalTicketQuestion")
                        .setTitle(`🦋 Question sur l'appli`);
                    const inputDescriptionQuestion = new TextInputBuilder()
                        .setCustomId("inputDescriptionQuestion")
                        .setLabel("Quelle question veux-tu nous poser ? 😎")
                        .setStyle(TextInputStyle.Paragraph)
                        .setPlaceholder("Je voudrais savoir si Papillon est...")
                        .setRequired(true);
                    
                    const actionRowQuestion1 = new ActionRowBuilder<TextInputBuilder>().addComponents(inputDescriptionQuestion);
                    modalTicketQuestion.addComponents(actionRowQuestion1);
                    await interaction.showModal(modalTicketQuestion);
                break;

                case "otherTicketType":
                    const modalTicketOther = new ModalBuilder()
                        .setCustomId("modalTicketOther")
                        .setTitle(`👨‍⚖️ Autres demandes`);
                    const inputDescriptionOther = new TextInputBuilder()
                        .setCustomId("inputDescriptionOther")
                        .setLabel("Quelle est ta demande ? 😎")
                        .setStyle(TextInputStyle.Paragraph)
                        .setPlaceholder("J'aimerais que...")
                        .setRequired(true);
                    
                    const actionRowOther1 = new ActionRowBuilder<TextInputBuilder>().addComponents(inputDescriptionOther);
                    modalTicketOther.addComponents(actionRowOther1);
                    await interaction.showModal(modalTicketOther);
                break;
            }
        }
    }

    if(interaction.isModalSubmit()) {
        
    }
}
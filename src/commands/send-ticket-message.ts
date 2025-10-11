import { PermissionFlagsBits, ChatInputCommandInteraction, TextDisplayBuilder, ThumbnailBuilder, SeparatorBuilder, ButtonBuilder, SectionBuilder, ContainerBuilder, SeparatorSpacingSize, ButtonStyle, GuildTextBasedChannel, MessageFlags, StringSelectMenuBuilder, ActionRowBuilder } from "discord.js";
import { Command } from "../types/command";
import type { ExtendedClient } from "../types/extendedClient";
import config from '../../config.json';

const sendTicketMessageCommand: Command = {
    name: "send-ticket-message",
    description: "Envoi du message contenant le panneau d'ouverture des tickets",
    dm: false,
    permission: PermissionFlagsBits.ManageGuild,

    async run(bot: ExtendedClient, interaction: ChatInputCommandInteraction) {
        const title = new TextDisplayBuilder().setContent(`# Bienvenue sur le support Papillon ${config.emojis.papillon}`);
        const separator = new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large);
        const description = new TextDisplayBuilder().setContent(`Des problèmes pour vous connecter à Papillon ? Des questions sur l'application ?\n\n**Ici, nous répondons à toutes vos interrogations ! ${config.emojis.animated.question}**`);
        const thumbnail = new ThumbnailBuilder({
            media: {
                url: "https://raw.githubusercontent.com/PapillonApp/Papibot/refs/heads/main/src/assets/icon_green.png"
            }
        });
        const selectMenu = new StringSelectMenuBuilder({
            custom_id: "selectTicketType",
            placeholder: `Choisis la catégorie de ta demande ${config.emojis.papillon}`,
            max_values: 1,
            options: [
                { emoji: `${config.emojis.papillon}`, label: "Problème sur Papillon", value: "problemTicketType", description: "Un problème sur l'application ?" },
                { emoji: "🦋", label: "Question sur l'appli", value: "questionTicketType", description: "Une question sur Papillon ?" },
                { emoji: "👨‍⚖️", label: "Autres demandes", value: "otherTicketType", description: "Pour tout autres demandes, c'est par là !" }
            ]
        });
        const actionrow = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(selectMenu);
        const section = new SectionBuilder().addTextDisplayComponents(title, description).setThumbnailAccessory(thumbnail);
        const container = new ContainerBuilder().addSectionComponents(section).addSeparatorComponents(separator).addActionRowComponents(actionrow);

        await (interaction.channel as GuildTextBasedChannel).send({
            flags: [MessageFlags.IsComponentsV2],
            components: [container]
        });
    }
};
export default sendTicketMessageCommand;
import {
    MessageFlags,
    TextDisplayBuilder,
    ContainerBuilder,
    ChatInputCommandInteraction,
    ThumbnailBuilder,
    SectionBuilder,
    SeparatorBuilder,
    SeparatorSpacingSize,
    ActionRowBuilder,
    GuildTextBasedChannel,
    StringSelectMenuBuilder,
    GuildMember,
} from "discord.js";
import { Command } from "../types/Command";
import type { ExtendedClient } from "../types/ExtendedClient";
import { errorMessage } from "../utils/errorMessage";
import { hasStaffRole } from "../utils/roleChecker";

const msgTicketsCommand: Command = {
    name: "msg-tickets",
    description: "-",
    dm: false,

    async run(bot: ExtendedClient, interaction: ChatInputCommandInteraction) {

        if (!hasStaffRole(interaction.member as GuildMember)) {
            await interaction.reply(
                errorMessage(
                    bot,
                    "Désolé, tu n’as pas la permission d’utiliser cette commande.",
                    "Permission refusée",
                    "0x203",
                    false
                )
            );
            return;
        }

        const title = new TextDisplayBuilder().setContent(`# Bienvenue sur le support Papillon ${process.env.GREEN_PAPILLON}`);
        const separator = new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large);
        const description = new TextDisplayBuilder().setContent(`Des problèmes pour vous connecter à Papillon ? Des questions sur l'application ?\n\n**Ici on répond à toutes vos interrogations ! ${process.env.RED_STAR}**`);
        const thumbnail = new ThumbnailBuilder({
            media: {
                url: `https://raw.githubusercontent.com/ryzenixx/papillon-assets/refs/heads/main/logov8.png`,
            },
        });

        const selectMenu = new StringSelectMenuBuilder({
            custom_id: "selectMenuTicket",
            placeholder: "Choisis la catégorie de ta demande 🦋",
            max_values: 1,
            options: [
                { label: `⚠️ Problème sur l'application`, value: "ticketCategoryHelpWithApp", description: "Un problème avec Papillon ?" },
                { label: `🦋 Question sur Papillon`, value: "ticketCategoryQuestionOnPapillon", description: "Une question sur Papillon ?" },
                { label: `📜 Autre demande`, value: "ticketCategoryOther", description: "Pour tout autre demande c'est par ici !" }
            ]
        });

        const actionrow = new ActionRowBuilder<StringSelectMenuBuilder>()
            .addComponents(selectMenu);

        const section = new SectionBuilder()
            .addTextDisplayComponents(title, description)
            .setThumbnailAccessory(thumbnail);

        const container = new ContainerBuilder()
            .addSectionComponents(section)
            .addSeparatorComponents(separator)
            .addActionRowComponents(actionrow);

        await interaction.reply({
            flags: [MessageFlags.Ephemeral],
            content: "**Le message a été envoyé !**",
        });

        await (interaction.channel as GuildTextBasedChannel).send({
            flags: [MessageFlags.IsComponentsV2],
            components: [container],
        });

    },
};

export default msgTicketsCommand;

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
    GuildMember,
    ButtonBuilder,
    ButtonStyle,
} from "discord.js";
import { Command } from "../types/Command";
import type { ExtendedClient } from "../types/ExtendedClient";
import { errorMessage } from "../utils/errorMessage";
import { hasStaffRole } from "../utils/roleChecker";

const msgWelcomeCommand: Command = {
    name: "msg-welcome",
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

        const title = new TextDisplayBuilder().setContent(`# Hello ! Je suis Erya, ton nouvel assistant sur le Discord de Papillon ${process.env.GREEN_PAPILLON}`);
        const desc = new TextDisplayBuilder().setContent(`Et bonne nouvelle, je suis open-source, tu peux donc contribuer à mon évolution depuis le répository GitHub disponible en cliquant sur le bouton ci-dessous ! 🎊`)
        const separator = new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large);
        const description = new TextDisplayBuilder().setContent("**Tu peux faire la commande ``/aide`` pour voir mes fonctionnalitées à tout moment 🦋 !**");
        const thumbnail = new ThumbnailBuilder({
            media: {
                url: `https://raw.githubusercontent.com/ryzenixx/papillon-assets/refs/heads/main/logov8.png`,
            },
        });

        const button = new ButtonBuilder()
            .setStyle(ButtonStyle.Link)
            .setURL(`https://github.com/papillonapp/erya`)
            .setLabel("Répository d'Erya")
            .setEmoji("📎");

        const actionrow = new ActionRowBuilder<ButtonBuilder>()
            .addComponents(button);

        const section = new SectionBuilder()
            .addTextDisplayComponents(title, desc)
            .setThumbnailAccessory(thumbnail);

        const container = new ContainerBuilder()
            .addSectionComponents(section)
            .addSeparatorComponents(separator)
            .addTextDisplayComponents(description)
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

export default msgWelcomeCommand;

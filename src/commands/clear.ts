import {
    ChatInputCommandInteraction,
    ContainerBuilder,
    GuildMember,
    GuildTextBasedChannel,
    MessageFlags,
    TextDisplayBuilder,
} from "discord.js";
import { Command } from "../types/Command";
import type { ExtendedClient } from "../types/ExtendedClient";
import { hasStaffRole } from "../utils/roleChecker";
import { errorMessage } from "../utils/errorMessage";
import "dotenv/config";

const clearCommand: Command = {
    name: "clear",
    description: "Effacer d'un seul coup un nombre précis de message dans un salon",
    dm: false,
    options: [
        {
            type: "integer",
            name: "nombre",
            description: "Nombre de messages à supprimer (entre 1 et 100)",
            required: true,
        },
    ],

    async run(bot: ExtendedClient, interaction: ChatInputCommandInteraction) {

        // Récupération des variables
        const numberOfMessages = interaction.options.getInteger("nombre");
        const logsChannelId = process.env.CHANNEL_LOGS as string;
        const logsChannel = interaction.guild?.channels.cache.get(logsChannelId);

        // Vérification des permissions
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

        // Vérification du nombre saisi
        if (numberOfMessages! < 1 || numberOfMessages! > 100) {
            await interaction.reply(
                errorMessage(
                    bot,
                    "Le nombre de messages à supprimer doit être compris entre ``1`` et ``100`` !",
                    "Demande invalide",
                    "0x200",
                    false
                )
            );
            return;
        }

        const deletedMessages = await (interaction.channel as GuildTextBasedChannel).bulkDelete(numberOfMessages!, true);

        // Envoyer un message de confirmation
        const text = new TextDisplayBuilder().setContent(`${process.env.GREEN_PAPILLON} **Tu viens de supprimer ${deletedMessages.size} messages de ce salon !**`);

        const container = new ContainerBuilder()
            .addTextDisplayComponents(text);

        // Envoyer dans le salon dans laquelle la commande a été faîte
        interaction.reply({
            flags: [MessageFlags.IsComponentsV2],
            components: [container],
            allowedMentions: {
                parse: [],
                roles: [],
            },
        });

        // Envoyer dans le salon des logs du serveur
        const text2 = new TextDisplayBuilder().setContent(`${process.env.GREEN_PAPILLON} **<@${interaction.member?.user.id}> a supprimer ${deletedMessages.size} messages du salon <#${interaction.channel?.id}>**`);

        const container2 = new ContainerBuilder()
            .addTextDisplayComponents(text2);

        if (logsChannel && logsChannel.isTextBased()) {
            logsChannel.send({
                flags: [MessageFlags.IsComponentsV2],
                components: [container2],
                allowedMentions: {
                    parse: [],
                    roles: [],
                },
            });
        } else {
            return;
        }

    },
};

export default clearCommand;

import {
    ChatInputCommandInteraction,
    ContainerBuilder,
    GuildMember,
    MessageFlags,
    SectionBuilder,
    TextDisplayBuilder,
    ThumbnailBuilder,
} from "discord.js";
import { Command } from "../types/Command";
import type { ExtendedClient } from "../types/ExtendedClient";
import { hasStaffRole } from "../utils/roleChecker";
import { errorMessage } from "../utils/errorMessage";
import { currentTimestamp, generateID } from "../utils/sanctionsUtils";
import "dotenv/config";

const kickCommand: Command = {
    name: "expulser",
    description: "Expulser un utilisateur du serveur",
    dm: false,
    options: [
        {
            type: "user",
            name: "utilisateur",
            description: "—",
            required: true,
        },
        {
            type: "string",
            name: "raison",
            description: "—",
            required: false,
        },
    ],

    async run(bot: ExtendedClient, interaction: ChatInputCommandInteraction) {

        // Récupération des variables
        let db = bot.db;
        let userTargeted = interaction.options.getUser("utilisateur"); if (!userTargeted) { return; }
        let reason = interaction.options.getString("raison") || "Aucune raison n’a été précisée.";
        const logsChannelId = process.env.CHANNEL_SANCTIONS_LOGS as string;
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

        // Vérifier si c'est l'utilisateur lui-même qui essaye de s'appliquer l'expulsion
        if (userTargeted?.id === interaction.user.id) {
            await interaction.reply(
                errorMessage(
                    bot,
                    "Tu ne peux pas t'expulser toi-même.",
                    "Demande invalide",
                    "0x200",
                    false
                )
            );
            return;
        }

        // Vérifier si l'utilisateur visé est présent sur le serveur
        let member;
        try {
            member = await interaction.guild?.members.fetch(userTargeted.id);
        } catch {
            await interaction.reply(
                errorMessage(
                    bot,
                    "L’utilisateur que tu veux expulser n’est pas présent sur ce serveur.",
                    "Utilisateur introuvable",
                    "0x204",
                    false
                )
            );
            return;
        }

        // Vérifier si l'utilisateur peut reçevoir une expulsion
        if (!member?.kickable) {
            await interaction.reply(
                errorMessage(
                    bot,
                    "Cet utilisateur ne peut pas recevoir d’expulsion.",
                    "Permission refusée",
                    "0x203",
                    false
                )
            );
            return;
        }

        // Vérifier si l'utilisateur qui tente d'expulser à un rôle plus élevé
        const targetMember = interaction.guild?.members.cache.get(userTargeted.id); if (!targetMember) { return; }
        const executorMember = interaction.guild?.members.cache.get(interaction.user.id); if (!executorMember) { return; }
        const targetHighestRole = targetMember?.roles.highest; if (!targetHighestRole) { return; }
        const executorHighestRole = executorMember?.roles.highest; if (!executorHighestRole) { return; }

        if (executorHighestRole.position <= targetHighestRole.position) {
            await interaction.reply(
                errorMessage(
                    bot,
                    "Cet utilisateur ne peut pas recevoir d’expulsion de ta part.",
                    "Permission refusée",
                    "0x203",
                    false
                )
            );
            return;
        }

        // Créér la sanction
        const timestamp = currentTimestamp();
        const sanctionId = generateID();

        // Enregistrer l'expulsion dans la base de données
        try {
            await db?.promise().query(`INSERT INTO sanctions (sanction_id, author_id, user_id, reason, timestamp, type, duration) VALUES (?, ?, ?, ?, ?, ?, ?)`, [sanctionId, interaction.user.id, userTargeted.id, reason, timestamp, "Expulsion", "Aucune"]);
        } catch {
            await interaction.reply(
                errorMessage(
                    bot,
                    "Impossible d’enregistrer la sanction dans la base de données.",
                    "Erreur base de données",
                    "0x302",
                    true
                )
            );
            return;
        }

        // Envoyer un message de confirmation publique
        const text = new TextDisplayBuilder().setContent(`## <@${userTargeted.id}> a été expulsé\n\n${process.env.RED_HAMMER} **Modérateur :** <@${interaction.user.id}>\n${process.env.RED_STAR} **Raison :** _${reason}_\n\n${process.env.GREEN_PAPILLON} **Référence de la sanction :** ${sanctionId}`);
        const thumbnail = new ThumbnailBuilder({ media: { url: `https://raw.githubusercontent.com/ryzenixx/papillon-assets/refs/heads/main/papillon_angry.png`, }, });

        const section = new SectionBuilder()
            .addTextDisplayComponents(text)
            .setThumbnailAccessory(thumbnail);

        const container = new ContainerBuilder()
            .addSectionComponents(section);

        // Envoyer dans le salon dans laquelle la commande a été faîte
        interaction.reply({
            flags: [MessageFlags.IsComponentsV2],
            components: [container]
        });

        // Envoyer dans le salon des logs du serveur
        if (logsChannel && logsChannel.isTextBased()) {
            logsChannel.send({
                flags: [MessageFlags.IsComponentsV2],
                components: [container]
            });
        } else {
            return;
        }

        // Envoyer un DM à l'utilisateur expulsé
        const text_dm = new TextDisplayBuilder().setContent(`## Tu as été expulsé\n\n${process.env.RED_HAMMER} **Modérateur :** <@${interaction.user.id}>\n${process.env.RED_STAR} **Raison :** _${reason}_\n\n${process.env.GREEN_PAPILLON} **Référence de la sanction :** ${sanctionId}`);
        const thumbnail_dm = new ThumbnailBuilder({ media: { url: `https://raw.githubusercontent.com/ryzenixx/papillon-assets/refs/heads/main/papillon_angry.png`, }, });

        const section_dm = new SectionBuilder()
            .addTextDisplayComponents(text_dm)
            .setThumbnailAccessory(thumbnail_dm);

        const container_dm = new ContainerBuilder()
            .addSectionComponents(section_dm);

        try {
            await userTargeted.send({
                flags: [MessageFlags.IsComponentsV2],
                components: [container_dm],
            });
        } catch {
            return;
        }

        // Expulser l'utilisateur visé
        try {
            await member.kick(reason);
        } catch {
            return;
        }

    },
};

export default kickCommand;

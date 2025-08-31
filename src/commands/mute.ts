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

const muteCommand: Command = {
    name: "mute",
    description: "Réduire au silence un utilisateur du serveur",
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
            name: "duree",
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
        let duration = interaction.options.getString("duree"); if (!duration) { return; }
        let reason = interaction.options.getString("raison") || "Aucune raison n’a été précisée.";
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

        // Vérifier si c'est l'utilisateur lui-même qui essaye de s'appliquer l'exclusion
        if (userTargeted?.id === interaction.user.id) {
            await interaction.reply(
                errorMessage(
                    bot,
                    "Tu ne peux pas t'exclure toi-même.",
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
                    "L’utilisateur que tu veux exclure n’est pas présent sur ce serveur.",
                    "Utilisateur introuvable",
                    "0x204",
                    false
                )
            );
            return;
        }

        // Vérifier si l'utilisateur peut reçevoir une exclusion
        if (!member?.moderatable) {
            await interaction.reply(
                errorMessage(
                    bot,
                    "Cet utilisateur ne peut pas recevoir d'exclusion.",
                    "Permission refusée",
                    "0x203",
                    false
                )
            );
            return;
        }

        // Vérifier si l'utilisateur qui tente d'exclure à un rôle plus élevé
        const targetMember = interaction.guild?.members.cache.get(userTargeted.id); if (!targetMember) { return; }
        const executorMember = interaction.guild?.members.cache.get(interaction.user.id); if (!executorMember) { return; }
        const targetHighestRole = targetMember?.roles.highest; if (!targetHighestRole) { return; }
        const executorHighestRole = executorMember?.roles.highest; if (!executorHighestRole) { return; }

        if (executorHighestRole.position <= targetHighestRole.position) {
            await interaction.reply(
                errorMessage(
                    bot,
                    "Cet utilisateur ne peut pas recevoir d'exclusion de ta part.",
                    "Permission refusée",
                    "0x203",
                    false
                )
            );
            return;
        }

        // Définir les unités de temps
        const durationMs = (() => {
            const match = duration.match(/(\d+)(s|m|h|j)/);
            if (!match) return null;

            const value = parseInt(match[1]);
            const unit = match[2];

            switch (unit) {
                case "s":
                    return value * 1000; // secondes
                case "m":
                    return value * 60 * 1000; // minutes
                case "h":
                    return value * 60 * 60 * 1000; // heures
                case "j":
                    return value * 24 * 60 * 60 * 1000; // jours
                default:
                    return null;
            }
        })();

        // Vérifier si la durée est valide
        if (!durationMs || durationMs <= 0) {
            await interaction.reply(
                errorMessage(
                    bot,
                    "La durée saisie n'est pas valide.",
                    "Arguments manquants",
                    "0x202",
                    false
                )
            );
            return;
        }

        // Vérifier si la durée excède 28 jours (limite de Discord)
        const maxTimeout = 28 * 24 * 60 * 60 * 1000;
        if (durationMs > maxTimeout) {
            await interaction.reply(
                errorMessage(
                    bot,
                    "La durée de l'exclusion ne peut pas dépasser ``28 jours``.",
                    "Arguments manquants",
                    "0x202",
                    false
                )
            );
            return;
        }

        // Formater la durée de l'exclusion
        function formatDuration(duration: string): string {
            const unit = duration.slice(-1);
            const value = parseInt(duration.slice(0, -1), 10);

            // Convertir tout en secondes
            let totalSeconds = 0;
            switch (unit) {
                case "s": totalSeconds = value; break;
                case "m": totalSeconds = value * 60; break;
                case "h": totalSeconds = value * 3600; break;
                case "j": totalSeconds = value * 86400; break;
                default: return duration;
            }

            // Extraire jours / heures / minutes / secondes
            const days = Math.floor(totalSeconds / 86400);
            totalSeconds %= 86400;

            const hours = Math.floor(totalSeconds / 3600);
            totalSeconds %= 3600;

            const minutes = Math.floor(totalSeconds / 60);
            const seconds = totalSeconds % 60;

            // Construire le texte avec pluriel
            const parts: string[] = [];
            if (days) parts.push(`${days} jour${days > 1 ? "s" : ""}`);
            if (hours) parts.push(`${hours} heure${hours > 1 ? "s" : ""}`);
            if (minutes) parts.push(`${minutes} minute${minutes > 1 ? "s" : ""}`);
            if (seconds) parts.push(`${seconds} seconde${seconds > 1 ? "s" : ""}`);

            // Gérer la ponctuation française (", " et "et")
            if (parts.length === 0) return "0 seconde";
            if (parts.length === 1) return parts[0];
            return parts.slice(0, -1).join(", ") + " et " + parts[parts.length - 1];
        }

        // Créér la sanction
        const timestamp = currentTimestamp();
        const sanctionId = generateID();

        // Enregistrer l'exclusion dans la base de données
        try {
            await db?.promise().query(`INSERT INTO sanctions (sanction_id, author_id, user_id, reason, timestamp, type, duration) VALUES (?, ?, ?, ?, ?, ?, ?)`, [sanctionId, interaction.user.id, userTargeted.id, reason, timestamp, "Exclusion", formatDuration(duration)]);
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
        const text = new TextDisplayBuilder().setContent(`## <@${userTargeted.id}> a été réduit au silence\n\n${process.env.RED_HAMMER} **Modérateur :** <@${interaction.user.id}>\n⌚ **Durée :** ${formatDuration(duration)}\n${process.env.RED_STAR} **Raison :** _${reason}_\n\n${process.env.GREEN_PAPILLON} **Référence de la sanction :** ${sanctionId}`);
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

        // Envoyer un DM à l'utilisateur exclu
        const text_dm = new TextDisplayBuilder().setContent(`## Tu as été réduit au silence\n\n${process.env.RED_HAMMER} **Modérateur :** <@${interaction.user.id}>\n⌚ **Durée :** ${formatDuration(duration)}\n${process.env.RED_STAR} **Raison :** _${reason}_\n\n${process.env.GREEN_PAPILLON} **Référence de la sanction :** ${sanctionId}`);
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

        // Exclure l'utilisateur visé
        try {
            await member.timeout(durationMs, reason);
        } catch {
            return;
        }

    },
};

export default muteCommand;

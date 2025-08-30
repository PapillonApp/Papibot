import {
    ChatInputCommandInteraction,
    GuildMember,
    MessageFlags,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    TextDisplayBuilder,
    ThumbnailBuilder,
    SectionBuilder,
    ContainerBuilder,
} from "discord.js";
import { Command } from "../types/Command";
import type { ExtendedClient } from "../types/ExtendedClient";
import { hasStaffRole } from "../utils/roleChecker";
import { errorMessage } from "../utils/errorMessage";
import "dotenv/config";
import { RowDataPacket } from "mysql2";
import {
    calculateRiskScore,
    getRiskLevel,
    SanctionRow,
} from "../utils/riskCalculator";
import { ensureDatabase } from "../utils/ensureDatabase";

const sanctionsCommand: Command = {
    name: "sanctions",
    description: "Visualiser les sanctions d'un utilisateur du serveur",
    dm: false,
    options: [
        {
            type: "user",
            name: "utilisateur",
            description: "—",
            required: true,
        },
    ],

    async run(bot: ExtendedClient, interaction: ChatInputCommandInteraction) {

        const ok = await ensureDatabase(bot);
        if (!ok) {
            await interaction.reply(
                errorMessage(
                    bot,
                    "Impossible de communiquer avec la base de données de Papillon",
                    "Service externe indisponible",
                    "0x304",
                    true
                )
            );
            return;
        }

        const db = bot.db;
        const userTargeted = interaction.options.getUser("utilisateur");
        if (!userTargeted) return;

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

        try {
            const [rows] = await db!
                .promise()
                .query<RowDataPacket[]>(
                    `SELECT * FROM sanctions WHERE user_id = ? ORDER BY timestamp DESC`,
                    [userTargeted.id]
                );

            if (rows.length === 0) {
                await interaction.reply(
                    errorMessage(
                        bot,
                        "Cet utilisateur n'a aucune sanction enregistrée sur Papillon.",
                        "Commande exécutée avec succès",
                        "0x101",
                        false
                    )
                );
                return;
            }

            const sanctions = rows as SanctionRow[];

            // Score et niveau de risque
            const riskScore = calculateRiskScore(sanctions);
            const { label, badge } = getRiskLevel(riskScore);

            // Pagination
            const sanctionsPerPage = 5;
            const totalPages = Math.ceil(sanctions.length / sanctionsPerPage);
            let currentPage = 0;

            // Fonction pour créer l’embed
            const createContainer = (page: number) => {
                const startIndex = page * sanctionsPerPage;
                const endIndex = Math.min(
                    startIndex + sanctionsPerPage,
                    sanctions.length
                );
                const pageRows = sanctions.slice(startIndex, endIndex);

                const sanctionsList = pageRows
                    .map((row, i) => {
                        const index = startIndex + i + 1;
                        return (
                            `### \`#${index}\` ${row.type}\n` +
                            `> 📅 **Date :** <t:${row.timestamp}:f>\n` +
                            `> ${process.env.RED_FLAG} **Modérateur :** <@${row.author_id}>\n` +
                            `> ⌚ **Durée :** ${row.duration ?? "—"}\n` +
                            `> ${process.env.GREEN_PAPILLON} **Référence de la sanction :** \`${row.sanction_id}\`\n` +
                            `> ${process.env.RED_STAR} **Raison :** ${row.reason?.length > 120
                                ? row.reason.substring(0, 120) + "..."
                                : row.reason
                            }\n`
                        );
                    })
                    .join("\n");

                const title = new TextDisplayBuilder().setContent(`## ${sanctions.length} sanction(s) trouvée(s)   \`\`${badge} ${label}\`\``);
                const description = new TextDisplayBuilder().setContent(sanctionsList);
                const footer = new TextDisplayBuilder().setContent(`‎ \n-# **Affichage de la page ${page + 1}/${totalPages}**`);
                const footer2 = new TextDisplayBuilder().setContent(`-# Commande exécutée avec succès | **0x101**`);
                const thumbnail = new ThumbnailBuilder().setURL(userTargeted.displayAvatarURL());

                const section = new SectionBuilder()
                    .addTextDisplayComponents(title, description, footer)
                    .setThumbnailAccessory(thumbnail);

                const container = new ContainerBuilder()
                    .addSectionComponents(section)
                    .addTextDisplayComponents(footer2);

                return container;
            };

            // Boutons de navigation
            const createButtons = (page: number) => {
                const row = new ActionRowBuilder<ButtonBuilder>();

                if (totalPages > 1) {
                    row.addComponents(
                        new ButtonBuilder()
                            .setCustomId("first_page")
                            .setLabel("⏮")
                            .setStyle(ButtonStyle.Secondary)
                            .setDisabled(page === 0),
                        new ButtonBuilder()
                            .setCustomId("prev_page")
                            .setLabel("◀")
                            .setStyle(ButtonStyle.Primary)
                            .setDisabled(page === 0),
                        new ButtonBuilder()
                            .setCustomId("next_page")
                            .setLabel("▶")
                            .setStyle(ButtonStyle.Primary)
                            .setDisabled(page === totalPages - 1),
                        new ButtonBuilder()
                            .setCustomId("last_page")
                            .setLabel("⏭")
                            .setStyle(ButtonStyle.Secondary)
                            .setDisabled(page === totalPages - 1)
                    );
                }

                return row.components.length > 0 ? [row] : [];
            };

            // Premier envoi
            const response = await interaction.reply({
                flags: [MessageFlags.IsComponentsV2],
                components: [createContainer(currentPage), ...createButtons(currentPage)],
            });

            // Collecteur pour gérer les boutons
            if (totalPages > 1) {
                const collector = response.createMessageComponentCollector({
                    time: 300000, // 5 minutes
                });

                collector.on("collect", async (buttonInteraction) => {
                    if (buttonInteraction.user.id !== interaction.user.id) {
                        await buttonInteraction.reply(
                            errorMessage(
                                bot,
                                "Désolé, tu n’as pas la permission d’intéragir avec ces boutons.",
                                "Permission refusée",
                                "0x203",
                                false
                            )
                        );
                        return;
                    }

                    switch (buttonInteraction.customId) {
                        case "first_page":
                            currentPage = 0;
                            break;
                        case "prev_page":
                            currentPage = Math.max(0, currentPage - 1);
                            break;
                        case "next_page":
                            currentPage = Math.min(
                                totalPages - 1,
                                currentPage + 1
                            );
                            break;
                        case "last_page":
                            currentPage = totalPages - 1;
                            break;
                    }

                    await buttonInteraction.update({
                        components: [createContainer(currentPage), ...createButtons(currentPage)],
                    });
                });

                collector.on("end", async () => {
                    try {
                        await response.edit({
                            components: [createContainer(currentPage)],
                        });
                    } catch {
                        return;
                    }
                });
            }
        } catch (err) {
            await interaction.reply(
                errorMessage(
                    bot,
                    "Impossible de récupérer les sanctions de cet utilisateur, veuillez réessayer.",
                    "Erreur base de données",
                    "0x302",
                    true
                )
            );
            console.log(err);
        }
    },
};

export default sanctionsCommand;

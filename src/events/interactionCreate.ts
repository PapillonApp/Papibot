import {
    Interaction,
    MessageFlags,
    TextDisplayBuilder,
    ContainerBuilder,
    ComponentType,
    ThumbnailBuilder,
    SectionBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    GuildMember,
    ModalBuilder,
    TextInputBuilder,
    TextInputStyle,
    ChannelType,
    PermissionsBitField,
    SeparatorBuilder,
    SeparatorSpacingSize,
    GuildTextBasedChannel,
    TextBasedChannel,
    GuildChannel,
} from "discord.js";
import type { ExtendedClient } from "../types/ExtendedClient";
import type { Command } from "../types/Command";
import { errorMessage } from "../utils/errorMessage";
import "dotenv/config";
import { hasAnyRole, hasStaffRole } from "../utils/roleChecker";

export default async function interactionCreate(
    bot: ExtendedClient,
    interaction: Interaction
): Promise<void> {

    // Slash commands
    if (interaction.isChatInputCommand()) {
        const command: Command | undefined = bot.commands.get(
            interaction.commandName
        );

        if (!command) {
            await interaction.reply(
                errorMessage(
                    bot,
                    "Je n’ai pas trouvé cette commande, vérifie l’orthographe ou utilise /help.",
                    "Commande inconnue",
                    "0x201",
                    true
                )
            );
            return;
        }

        try {
            if (command.run) {
                await command.run(bot, interaction);
            }
        } catch (err) {
            await interaction.reply(
                errorMessage(
                    bot,
                    "Oups ! Une erreur est survenue pendant l’exécution de la commande. Réessaie un peu plus tard.",
                    "Erreur interne du bot",
                    "0x300",
                    true
                )
            );
        }
    }

    // Button interactions
    if (interaction.isButton()) {

        // Gestion des erreurs
        if (interaction.customId.startsWith("reportError:")) {
            const [, errorId] = interaction.customId.split(":");

            const errorData = bot.errors.get(errorId);

            if (!errorData) {
                const description = new TextDisplayBuilder().setContent(
                    `**Étrange... je n’ai pas réussi à trouver cette erreur. Finalement, n’est-ce pas une bonne nouvelle ?** ${process.env.RED_STAR}`
                );

                const container = new ContainerBuilder().addTextDisplayComponents(description);

                await interaction.reply({
                    flags: [MessageFlags.Ephemeral, MessageFlags.IsComponentsV2],
                    components: [container],
                });
                return;
            }

            // Envoi dans le salon de logs d'erreurs
            const reportedErrorsChannel = interaction.guild?.channels.cache.get(
                `${process.env.CHANNEL_REPORTED_ERRORS}`
            );

            if (!reportedErrorsChannel || !reportedErrorsChannel.isTextBased()) {
                console.error("⚠️ Salon de logs d'erreurs introuvable ou non textuel.");
                return;
            }

            const title = new TextDisplayBuilder().setContent("# Une erreur a été signalée");
            const description2 = new TextDisplayBuilder().setContent(
                `**Utilisateur:** <@${interaction.user.id}>\n` +
                `**Description de l'erreur:** ${errorData.description}\n\n` +
                `**Code d'erreur:** ${errorData.errorCode}\n` +
                `**Description du code d'erreur:** ${errorData.errorText}\n\n` +
                `**Signalée le:** <t:${Math.floor(interaction.createdTimestamp / 1000)}:F>`
            );

            const thumbnail = new ThumbnailBuilder({
                media: { url: `https://raw.githubusercontent.com/ryzenixx/papillon-assets/refs/heads/main/Report_Message.png` },
            });

            const section = new SectionBuilder()
                .addTextDisplayComponents(title, description2)
                .setThumbnailAccessory(thumbnail);

            const actionrow = new ActionRowBuilder<ButtonBuilder>().addComponents(
                new ButtonBuilder()
                    .setCustomId("acquitError")
                    .setLabel("Marquer comme résolu")
                    .setStyle(ButtonStyle.Secondary)
                    .setEmoji(`${process.env.RED_UPVOTE}`)
            );

            const container2 = new ContainerBuilder()
                .addSectionComponents(section)
                .addActionRowComponents(actionrow);

            await reportedErrorsChannel.send({
                flags: [MessageFlags.IsComponentsV2],
                components: [container2],
                allowedMentions: {
                    parse: [],
                    roles: [],
                },
            });

            // Récupère le container (sans les boutons)
            const containerOnly = interaction.message.components.find(
                comp => comp.type === ComponentType.Container
            );

            // Mets à jour le message en retirant l'ActionRow (le bouton)
            if (containerOnly) {
                await interaction.update({
                    components: [containerOnly],
                });
            } else {
                // fallback si jamais le container n'est pas trouvé
                await interaction.update({
                    components: [],
                });
            }

            const confirmation = new TextDisplayBuilder().setContent(
                "**Parfait ! J’ai bien transmis ton signalement d’erreur. Merci pour le coup de main 🤝**"
            );

            const confirmationContainer = new ContainerBuilder().addTextDisplayComponents(confirmation);

            await interaction.followUp({
                flags: [MessageFlags.Ephemeral, MessageFlags.IsComponentsV2],
                components: [confirmationContainer],
            });
        }

        // Marquer comme résolu une erreur
        if (interaction.customId === "acquitError") {
            interaction.deferUpdate();
            interaction.message?.delete()
        }

        // Validation du règlement
        if (interaction.customId === "acceptRules") {
            if ((interaction.member as GuildMember).roles.cache.has(process.env.ROLE_UNVERIFIED || "")) {

                const title = new TextDisplayBuilder()
                    .setContent(`## Bienvenue parmis nous ! ${process.env.GREEN_PAPILLON}`);

                const description = new TextDisplayBuilder()
                    .setContent(`Tu as désormais accès à l'entièreté du serveur Discord de Papillon, bon séjour parmis nous ! 💚`);

                const thumbnail = new ThumbnailBuilder({
                    media: {
                        url: `https://raw.githubusercontent.com/ryzenixx/papillon-assets/refs/heads/main/Frame%202.png`,
                    },
                });

                const section = new SectionBuilder()
                    .addTextDisplayComponents(title, description)
                    .setThumbnailAccessory(thumbnail);

                const container = new ContainerBuilder()
                    .addSectionComponents(section);
                
                await (interaction.member as GuildMember).roles.remove(process.env.ROLE_UNVERIFIED!);

                await interaction.reply({
                    flags: [MessageFlags.IsComponentsV2, MessageFlags.Ephemeral],
                    components: [container]
                });

            } else {
                await interaction.reply(
                    errorMessage(
                        bot,
                        "Tu as déjà accepté le règlement du serveur Discord de Papillon 🦋",
                        "Demande invalide",
                        "0x200",
                        false
                    )
                );
                return;
            }
        }

        // Gestion de la prise en charge d'un ticket
        if (interaction.customId === "takeTicket") {
            if (!hasStaffRole(interaction.member as GuildMember) && !hasAnyRole(interaction.member as GuildMember, ["support"])) {

                await interaction.reply(
                    errorMessage(
                        bot,
                        "On dirait que tu n'es pas autorisé à prendre en charge un ticket.",
                        "Permission refusée",
                        "0x203",
                        false
                    )
                );
                return;

            }

            await interaction.deferUpdate();

            const newCircle = "🟢";
            const currentName = (interaction.channel as GuildTextBasedChannel).name;
            const newName = newCircle + currentName.slice(1);
            
            await (interaction.channel as GuildTextBasedChannel).setName(`${newName}`);

            const title = new TextDisplayBuilder()
                .setContent(`${process.env.GREEN_PAPILLON} **Bonne nouvelle, <@${(interaction.member as GuildMember).id}> prend maintenant en charge ton ticket !**`);

            const container = new ContainerBuilder()
                .addTextDisplayComponents(title);

            await (interaction.channel as GuildTextBasedChannel).send({
                flags: [MessageFlags.IsComponentsV2],
                components: [container]
            });
        }

        // Gestion de la fermeture d'un ticket
        if (interaction.customId === "preCloseTicket") {
            if (!hasStaffRole(interaction.member as GuildMember) && !hasAnyRole(interaction.member as GuildMember, ["support"])) {

                await interaction.reply(
                    errorMessage(
                        bot,
                        "On dirait que tu n'es pas autorisé à clôturer un ticket.",
                        "Permission refusée",
                        "0x203",
                        false
                    )
                );
                return;

            }

            const title = new TextDisplayBuilder()
                .setContent(`${process.env.YELLOW_ALERT} **Attention, tu es sur le point de clôturer ce ticket. Es-tu réellement sûr de vouloir faire ça ?**`);

            const button = new ButtonBuilder()
                .setCustomId("closeTicket")
                .setLabel("Je souhaite clôturer ce ticket")
                .setEmoji("🔐")
                .setStyle(ButtonStyle.Danger);

            const actionrow = new ActionRowBuilder<ButtonBuilder>()
                .addComponents(button);

            const container = new ContainerBuilder()
                .addTextDisplayComponents(title)
                .addActionRowComponents(actionrow);

            await interaction.reply({
                flags: [MessageFlags.IsComponentsV2, MessageFlags.Ephemeral],
                components: [container]
            });

        }

        if (interaction.customId === "closeTicket") {
            const member = interaction.member as GuildMember;
            const channel = interaction.channel as GuildTextBasedChannel;

            await interaction.deferUpdate();

            const newCircle = "🔴";
            const currentName = (interaction.channel as GuildTextBasedChannel).name;
            const newName = newCircle + currentName.slice(1);
            
            channel.setName(`${newName}`);
            (interaction.channel as GuildChannel).setParent(`${process.env.CATEGORY_CLOSED}`);

            const title = new TextDisplayBuilder()
                .setContent(`${process.env.GREEN_PAPILLON} **<@${(interaction.member as GuildMember).id}> a clôturé ce ticket !**`);

            const separator = new SeparatorBuilder()
                .setSpacing(SeparatorSpacingSize.Small);

            const button = new ButtonBuilder()
                .setCustomId("deleteTicket")
                .setEmoji("🗑️")
                .setLabel("Supprimer ce ticket")
                .setStyle(ButtonStyle.Danger);

            const actionrow = new ActionRowBuilder<ButtonBuilder>()
                .addComponents(button);

            const container = new ContainerBuilder()
                .addTextDisplayComponents(title)
                .addSeparatorComponents(separator)
                .addActionRowComponents(actionrow);

            await (interaction.channel as GuildTextBasedChannel).send({
                flags: [MessageFlags.IsComponentsV2],
                components: [container]
            });

        }

        if (interaction.customId === "deleteTicket") {
            (interaction.channel as GuildTextBasedChannel).delete();
        }

    }

    if(interaction.isStringSelectMenu()) {
        if (interaction.customId === "selectMenuTicket") {
            const selected = interaction.values[0];

            switch (selected) {

                case "ticketCategoryHelpWithApp":

                    const modalHelpWithApp = new ModalBuilder()
                        .setCustomId("ticketModalHelpWithApp")
                        .setTitle("⚠️ Problème sur l'application")

                    const modelNameInputHelpWithApp = new TextInputBuilder()
                        .setCustomId("modelNameInput")
                        .setLabel("Le modèle de ton appareil 📱")
                        .setStyle(TextInputStyle.Short)
                        .setPlaceholder("iPhone 15 Pro")
                        .setRequired(true);

                    const papillonVersionInputHelpWithApp = new TextInputBuilder()
                        .setCustomId("papillonVersionInput")
                        .setLabel("Ta version de Papillon 🦋")
                        .setStyle(TextInputStyle.Short)
                        .setPlaceholder("v8.0.1")
                        .setRequired(true);

                    const descriptionInputHelpWithApp = new TextInputBuilder()
                        .setCustomId("descriptionInput")
                        .setLabel("Quel est ton problème ? 🚨")
                        .setStyle(TextInputStyle.Paragraph)
                        .setPlaceholder("J'ai une erreur sur la connexion à mon compte PRONOTE...")
                        .setRequired(true);


                    const actionrowHelpWithApp = new ActionRowBuilder<TextInputBuilder>().addComponents(modelNameInputHelpWithApp);
                    const actionrow2HelpWithApp = new ActionRowBuilder<TextInputBuilder>().addComponents(papillonVersionInputHelpWithApp);
                    const actionrow3HelpWithApp = new ActionRowBuilder<TextInputBuilder>().addComponents(descriptionInputHelpWithApp);

                    modalHelpWithApp.addComponents(actionrowHelpWithApp, actionrow2HelpWithApp, actionrow3HelpWithApp);

                    await interaction.showModal(modalHelpWithApp);
                    break;


                case "ticketCategoryQuestionOnPapillon":

                    const modalQuestionOnPapillon = new ModalBuilder()
                        .setCustomId("ticketModalQuestionOnPapillon")
                        .setTitle("🦋 Question sur Papillon")

                    const descriptionInputQuestionOnPapillon = new TextInputBuilder()
                        .setCustomId("descriptionInput")
                        .setLabel("Quelle est ta question ? ✨")
                        .setStyle(TextInputStyle.Paragraph)
                        .setPlaceholder("Je voudrais savoir quand est la prochaine mise à jour ?")
                        .setRequired(true);


                    const actionrowQuestionOnPapillon = new ActionRowBuilder<TextInputBuilder>().addComponents(descriptionInputQuestionOnPapillon);

                    modalQuestionOnPapillon.addComponents(actionrowQuestionOnPapillon);

                    await interaction.showModal(modalQuestionOnPapillon);
                    break;
                    

                case "ticketCategoryOther":

                    const modalOther = new ModalBuilder()
                        .setCustomId("ticketModalOther")
                        .setTitle("📜 Autre demande")

                    const descriptionInputOther = new TextInputBuilder()
                        .setCustomId("descriptionInput")
                        .setLabel("Quelle est ta demande ? ✨")
                        .setStyle(TextInputStyle.Paragraph)
                        .setPlaceholder("")
                        .setRequired(true);


                    const actionrowOther = new ActionRowBuilder<TextInputBuilder>().addComponents(descriptionInputOther);

                    modalOther.addComponents(actionrowOther);

                    await interaction.showModal(modalOther);
                    break;

            }
        }
    }

    if(interaction.isModalSubmit()) {

        // ticketModalHelpWithApp
        if(interaction.customId === "ticketModalHelpWithApp") {

            const member = interaction.member as GuildMember;
            const guild = interaction.guild;

            const modelName = interaction.fields.getTextInputValue("modelNameInput") || "Non renseigné";
            const papillonVersion = interaction.fields.getTextInputValue("papillonVersionInput") || "Non renseigné";
            const description = interaction.fields.getTextInputValue("descriptionInput") || "Non renseigné";

            const servicesRoles = {
                [`<@&${process.env.ROLE_PRONOTE}>`]: process.env.ROLE_PRONOTE, // PRONOTE
                [`<@&${process.env.ROLE_SKOLENGO}>`]: process.env.ROLE_SKOLENGO, // Skolengo
                [`<@&${process.env.ROLE_ECOLEDIRECTE}>`]: process.env.ROLE_ECOLEDIRECTE, // Ecole Directe
            };

            const userRoles = Object.entries(servicesRoles)
                .filter(([name, roleId]) => member?.roles.cache.has(roleId ?? ""))
                .map(([name]) => name);

            const detectedRole = userRoles.length > 0 ? userRoles.join(", ") : "Aucun service scolaire détecté";

            const categoryHelpWithApp = await guild?.channels.fetch(process.env.CATEGORY_HELP_WITH_APP || "");

            const ticketChannel = await guild?.channels.create({
                name: `🟠${member.user.username}`,
                type: ChannelType.GuildText,
                parent: categoryHelpWithApp?.id,
                permissionOverwrites: [
                    {
                        id: guild.id,
                        deny: [PermissionsBitField.Flags.ViewChannel],
                    },
                    {
                        id: member.id,
                        allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages],
                    },
                    {
                        id: process.env.ROLE_SUPPORT || "",
                        allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages],
                    },
                ]
            }) as GuildTextBasedChannel;

            const title = new TextDisplayBuilder()
                .setContent(`## Bienvenue dans ton ticket, <@${member.user.id}> ! ${process.env.RED_STAR}`);

            const desc = new TextDisplayBuilder()
                .setContent(`-# Ton ticket est entre de bonnes mains, notre **équipe support** va le prendre en charge dans les plus brefs délais.`);
                
            const separator = new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large);

            const description2 = new TextDisplayBuilder()
                .setContent(`### Informations renseignées par l'utilisateur lors de l'ouverture de son ticket :\n${process.env.RED_UPVOTE} **Modèle de l'appareil:** ${modelName}\n${process.env.GREEN_PAPILLON} **Version utilisée de Papillon:** ${papillonVersion}\n${process.env.BLUE_DISCORD} **Service scolaire:** ${detectedRole}\n${process.env.RED_FLAG} **Description du problème:** ${description}`);

            const separator2 = new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large);

            const buttonTakeTicket = new ButtonBuilder()
                .setCustomId("takeTicket")
                .setLabel("✋")
                .setStyle(ButtonStyle.Secondary);

            const buttonCloseTicket = new ButtonBuilder()
                .setCustomId("preCloseTicket")
                .setLabel("🔒")
                .setStyle(ButtonStyle.Danger);

            const actionRow = new ActionRowBuilder<ButtonBuilder>().addComponents(buttonTakeTicket, buttonCloseTicket);

            const container = new ContainerBuilder()
                .addTextDisplayComponents(title, desc)
                .addSeparatorComponents(separator)
                .addTextDisplayComponents(description2)
                .addSeparatorComponents(separator2)
                .addActionRowComponents(actionRow);

            ticketChannel.send({
                flags: [MessageFlags.IsComponentsV2],
                components: [container],
                allowedMentions: {
                    parse: ["users"],
                    roles: [],
                }
            });

            const title2 = new TextDisplayBuilder()
                .setContent(`🎉 **Ton ticket a bien été créé dans le canal <#${ticketChannel.id}> !** Tu peux y accéder directement avec le bouton ci-dessous.`);

            const buttonLink = new ButtonBuilder()
                .setStyle(ButtonStyle.Link)
                .setURL(`https://discord.com/channels/${process.env.SERVER_ID}/${ticketChannel.id}`)
                .setLabel("Voir mon ticket")
                .setEmoji(`${process.env.BLUE_DISCORD}`)

            const actionRow2 = new ActionRowBuilder<ButtonBuilder>().addComponents(buttonLink);

            const container2 = new ContainerBuilder()
                .addTextDisplayComponents(title2)
                .addActionRowComponents(actionRow2);

            interaction.reply({
                flags: [MessageFlags.IsComponentsV2, MessageFlags.Ephemeral],
                components: [container2]
            });

        }


        // ticketCategoryQuestionOnPapillon
        if(interaction.customId === "ticketModalQuestionOnPapillon") {

            const member = interaction.member as GuildMember;
            const guild = interaction.guild;

            const description = interaction.fields.getTextInputValue("descriptionInput") || "Non renseigné";

            const categoryQuestionOnPapillon = await guild?.channels.fetch(process.env.CATEGORY_QUESTION_ON_PAPILLON || "");

            const ticketChannel = await guild?.channels.create({
                name: `🟠${member.user.username}`,
                type: ChannelType.GuildText,
                parent: categoryQuestionOnPapillon?.id,
                permissionOverwrites: [
                    {
                        id: guild.id,
                        deny: [PermissionsBitField.Flags.ViewChannel],
                    },
                    {
                        id: member.id,
                        allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages],
                    },
                    {
                        id: process.env.ROLE_SUPPORT || "",
                        allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages],
                    },
                ]
            }) as GuildTextBasedChannel;

            const title = new TextDisplayBuilder()
                .setContent(`## Bienvenue dans ton ticket, <@${member.user.id}> ! ${process.env.RED_STAR}`);

            const desc = new TextDisplayBuilder()
                .setContent(`-# Ton ticket est entre de bonnes mains, notre **équipe support** va le prendre en charge dans les plus brefs délais.`);
                
            const separator = new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large);

            const description2 = new TextDisplayBuilder()
                .setContent(`### Informations renseignées par l'utilisateur lors de l'ouverture de son ticket :\n${process.env.RED_FLAG} **Question posée:** ${description}`);

            const separator2 = new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large);

            const buttonTakeTicket = new ButtonBuilder()
                .setCustomId("takeTicket")
                .setLabel("✋")
                .setStyle(ButtonStyle.Secondary);

            const buttonCloseTicket = new ButtonBuilder()
                .setCustomId("preCloseTicket")
                .setLabel("🔒")
                .setStyle(ButtonStyle.Danger);

            const actionRow = new ActionRowBuilder<ButtonBuilder>().addComponents(buttonTakeTicket, buttonCloseTicket);

            const container = new ContainerBuilder()
                .addTextDisplayComponents(title, desc)
                .addSeparatorComponents(separator)
                .addTextDisplayComponents(description2)
                .addSeparatorComponents(separator2)
                .addActionRowComponents(actionRow);

            ticketChannel.send({
                flags: [MessageFlags.IsComponentsV2],
                components: [container],
                allowedMentions: {
                    parse: ["users"],
                    roles: [],
                }
            });

            const title2 = new TextDisplayBuilder()
                .setContent(`🎉 **Ton ticket a bien été créé dans le canal <#${ticketChannel.id}> !** Tu peux y accéder directement avec le bouton ci-dessous.`);

            const buttonLink = new ButtonBuilder()
                .setStyle(ButtonStyle.Link)
                .setURL(`https://discord.com/channels/${process.env.SERVER_ID}/${ticketChannel.id}`)
                .setLabel("Voir mon ticket")
                .setEmoji(`${process.env.BLUE_DISCORD}`)

            const actionRow2 = new ActionRowBuilder<ButtonBuilder>().addComponents(buttonLink);

            const container2 = new ContainerBuilder()
                .addTextDisplayComponents(title2)
                .addActionRowComponents(actionRow2);

            interaction.reply({
                flags: [MessageFlags.IsComponentsV2, MessageFlags.Ephemeral],
                components: [container2]
            });

        }

        // ticketCategoryOther
        if(interaction.customId === "ticketModalOther") {

            const member = interaction.member as GuildMember;
            const guild = interaction.guild;

            const description = interaction.fields.getTextInputValue("descriptionInput") || "Non renseigné";

            const categoryOther = await guild?.channels.fetch(process.env.CATEGORY_OTHER || "");

            const ticketChannel = await guild?.channels.create({
                name: `🟠${member.user.username}`,
                type: ChannelType.GuildText,
                parent: categoryOther?.id,
                permissionOverwrites: [
                    {
                        id: guild.id,
                        deny: [PermissionsBitField.Flags.ViewChannel],
                    },
                    {
                        id: member.id,
                        allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages],
                    },
                    {
                        id: process.env.ROLE_SUPPORT || "",
                        allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages],
                    },
                ]
            }) as GuildTextBasedChannel;

            const title = new TextDisplayBuilder()
                .setContent(`## Bienvenue dans ton ticket, <@${member.user.id}> ! ${process.env.RED_STAR}`);

            const desc = new TextDisplayBuilder()
                .setContent(`-# Ton ticket est entre de bonnes mains, notre **équipe support** va le prendre en charge dans les plus brefs délais.`);
                
            const separator = new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large);

            const description2 = new TextDisplayBuilder()
                .setContent(`### Informations renseignées par l'utilisateur lors de l'ouverture de son ticket :\n${process.env.RED_FLAG} **Demande:** ${description}`);

            const separator2 = new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large);

            const buttonTakeTicket = new ButtonBuilder()
                .setCustomId("takeTicket")
                .setLabel("✋")
                .setStyle(ButtonStyle.Secondary);

            const buttonCloseTicket = new ButtonBuilder()
                .setCustomId("preCloseTicket")
                .setLabel("🔒")
                .setStyle(ButtonStyle.Danger);

            const actionRow = new ActionRowBuilder<ButtonBuilder>().addComponents(buttonTakeTicket, buttonCloseTicket);

            const container = new ContainerBuilder()
                .addTextDisplayComponents(title, desc)
                .addSeparatorComponents(separator)
                .addTextDisplayComponents(description2)
                .addSeparatorComponents(separator2)
                .addActionRowComponents(actionRow);

            ticketChannel.send({
                flags: [MessageFlags.IsComponentsV2],
                components: [container],
                allowedMentions: {
                    parse: ["users"],
                    roles: [],
                }
            });

            const title2 = new TextDisplayBuilder()
                .setContent(`🎉 **Ton ticket a bien été créé dans le canal <#${ticketChannel.id}> !** Tu peux y accéder directement avec le bouton ci-dessous.`);

            const buttonLink = new ButtonBuilder()
                .setStyle(ButtonStyle.Link)
                .setURL(`https://discord.com/channels/${process.env.SERVER_ID}/${ticketChannel.id}`)
                .setLabel("Voir mon ticket")
                .setEmoji(`${process.env.BLUE_DISCORD}`)

            const actionRow2 = new ActionRowBuilder<ButtonBuilder>().addComponents(buttonLink);

            const container2 = new ContainerBuilder()
                .addTextDisplayComponents(title2)
                .addActionRowComponents(actionRow2);

            interaction.reply({
                flags: [MessageFlags.IsComponentsV2, MessageFlags.Ephemeral],
                components: [container2]
            });

        }

    }
}

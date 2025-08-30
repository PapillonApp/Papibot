import {
    MessageFlags,
    TextDisplayBuilder,
    ContainerBuilder,
    ChatInputCommandInteraction,
    ThumbnailBuilder,
    SectionBuilder,
    SeparatorBuilder,
    SeparatorSpacingSize,
    ButtonBuilder,
    ButtonStyle,
    GuildTextBasedChannel,
    GuildMember,
} from "discord.js";
import { Command } from "../types/Command";
import type { ExtendedClient } from "../types/ExtendedClient";
import { hasStaffRole } from "../utils/roleChecker";
import { errorMessage } from "../utils/errorMessage";

const msgRulesCommand: Command = {
    name: "msg-rules",
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

        const title = new TextDisplayBuilder().setContent(`## Bienvenue sur le Discord officiel de Papillon ${process.env.GREEN_PAPILLON}`);
        const description = new TextDisplayBuilder().setContent("Papillon est un client libre, open-source et développé par une communauté d’élèves pour l’ensemble de vos services de vie scolaire ! 😎")
        const thumbnail = new ThumbnailBuilder({
            media: {
                url: `https://raw.githubusercontent.com/ryzenixx/papillon-assets/refs/heads/main/logov8.png`,
            },
        });

        const separator = new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large);
        
        const title2 = new TextDisplayBuilder().setContent("### 🦋 Afin de garantir une expérience agréable et sécurisée pour tous et toutes, merci de lire attentivement et de respecter les règles suivantes :")

        const articles = new TextDisplayBuilder()
            .setContent("**I | Respect et courtoisie**\nSoyez respectueux envers les autres membres du serveur. Toute forme d'insulte(s), de discriminations ou de comportement jugé inapproprié sont strictements interdites.\nLes discussions doivent rester courtoises et respectueuses des opinions de chacun(s).\n\n**II | Confidentialité**\nNe partagez pas vos informations personnelles ou celles d'autrui sur le serveur. Il est strictement interdit de passer des comptes ou des informations à part à l'équipe Papillon.\nPapillon n'est pas tenu responsable si vos comptes ont été corrompus par n'importe quel moyen que ce soit.\n\n**III | Langues autorisées**\nSeul le français et l'anglais sont autorisés sur ce Discord. Utilisez exclusivement ces langues pour vos messages.\n\n**IV | Contenus et médias**\nNe partagez pas de contenus inappropriés, y compris mais sans s'y limiter: contenus à caractères pornographiques, violents, illégaux.\nLes spams, publicités et liens suspects sont interdits et sanctionnables.\n\n**V | Canaux de discussions**\nUtilisez les canaux de discussions appropriés pour chaque type de sujet. Les canaux ont été crées pour faciliter l'organisation des discussions, respectez donc leurs vocations.\nLisez les descriptions des différents canaux afin de savoir quel type de contenu et/ou de discussions y sont appropriés.\n\n**VI | Comportement en ligne**\nN'usurpez pas l'identité d'autrui.\nNe discutez pas de sujets illégaux ou inappropriés.\n\n**VII | Sécurité**\nNe cliquez pas sur des liens suspects ou envoyés par des utilisateurs non vérifiés.\nSignalez tout comportement suspect ou violation des règles à l'équipe Papillon et/ou aux modérateurs du serveur.\n\n**VIII | Publicité**\nLa publicité n'est pas autorisé sur le Discord de Papillon.\nSi vous avez quelquonque demande concernant ce sujet, nous vous invitons à nous contacter par ticket dans <#1015651919076790333>\n\n**IX | Respect des Conditions d'Utilisations de Discord**\nEn utilisant ce serveur, vous acceptez également de respect les [Conditions d'Utilisations de Discord](https://discord.com/terms). Toutes infractions à ces conditions pourront entraîner des sanctions.\n\n**X | Modifications du règlement**\nL'équipe Papillon peut à tout moment effectuer des modifications sur ce règlement. Il est de la responsabilité des membres de se tenir informé des changements.");

        const separator2 = new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large);

        const text1 = new TextDisplayBuilder().setContent("👋 Pour accéder au serveur Discord, appuie sur le bouton.");
        const text2 = new TextDisplayBuilder().setContent("**✨ En appuyant, tu confirmes avoir pris connaissance des règles du serveur.**")
        
        const button = new ButtonBuilder()
            .setCustomId("acceptRules")
            .setLabel("J'accepte les règles")
            .setEmoji(`${process.env.GREEN_PAPILLON}`)
            .setStyle(ButtonStyle.Secondary);

        const section = new SectionBuilder()
            .addTextDisplayComponents(title, description)
            .setThumbnailAccessory(thumbnail);

        const section2 = new SectionBuilder()
            .addTextDisplayComponents(text1, text2)
            .setButtonAccessory(button);

        const container = new ContainerBuilder()
            //.setAccentColor(0x98F5DF)
            .addSectionComponents(section)
            .addSeparatorComponents(separator)
            .addTextDisplayComponents(title2, articles)
            .addSeparatorComponents(separator2)
            .addSectionComponents(section2);

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

export default msgRulesCommand;

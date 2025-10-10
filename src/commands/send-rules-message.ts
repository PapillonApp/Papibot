import { PermissionFlagsBits, ChatInputCommandInteraction, TextDisplayBuilder, ThumbnailBuilder, SeparatorBuilder, ButtonBuilder, SectionBuilder, ContainerBuilder, SeparatorSpacingSize, ButtonStyle, GuildTextBasedChannel, MessageFlags } from "discord.js";
import { Command } from "../types/command";
import type { ExtendedClient } from "../types/extendedClient";
import config from '../../config.json';

const sendRulesMessageCommand: Command = {
    name: "send-rules-message",
    description: "Envoi du message contenant les règles",
    dm: false,
    permission: PermissionFlagsBits.ManageGuild,

    async run(bot: ExtendedClient, interaction: ChatInputCommandInteraction) {
        const title = new TextDisplayBuilder().setContent(`## Bienvenue sur le Discord officiel de Papillon ${config.emojis.papillon}`);
        const description = new TextDisplayBuilder().setContent("Papillon est un client libre, open-source et développé par une communauté d’élèves pour l’ensemble de vos services de vie scolaire ! 😎")
        const thumbnail = new ThumbnailBuilder({
            media: {
                url: `https://raw.githubusercontent.com/PapillonApp/Papibot/refs/heads/main/src/assets/icon_green.png`,
            },
        });
        const separator = new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large);
        const title2 = new TextDisplayBuilder().setContent("### 🦋 Afin de garantir une expérience agréable et sécurisée pour tous et toutes, merci de lire attentivement et de respecter les règles suivantes :")
        const description2 = new TextDisplayBuilder().setContent("**I | Respect et courtoisie**\nSoyez respectueux envers les autres membres du serveur. Toute forme d'insulte(s), de discriminations ou de comportement jugé inapproprié sont strictements interdites.\nLes discussions doivent rester courtoises et respectueuses des opinions de chacun(s).\n\n**II | Confidentialité**\nNe partagez pas vos informations personnelles ou celles d'autrui sur le serveur. Il est strictement interdit de passer des comptes ou des informations à part à l'équipe Papillon.\nPapillon n'est pas tenu responsable si vos comptes ont été corrompus par n'importe quel moyen que ce soit.\n\n**III | Langues autorisées**\nSeul le français est autorisé sur ce Discord. Utilisez exclusivement cette langue pour vos messages.\n\n**IV | Contenus et médias**\nNe partagez pas de contenus inappropriés, y compris mais sans s'y limiter: contenus à caractères pornographiques, violents, illégaux.\nLes spams, publicités et liens suspects sont interdits et sanctionnables.\n\n**V | Canaux de discussions**\nUtilisez les canaux de discussions appropriés pour chaque type de sujet. Les canaux ont été crées pour faciliter l'organisation des discussions, respectez donc leurs vocations.\nLisez les descriptions des différents canaux afin de savoir quel type de contenu et/ou de discussions y sont appropriés.\n\n**VI | Comportement en ligne**\nN'usurpez pas l'identité d'autrui.\nNe discutez pas de sujets illégaux ou inappropriés.\n\n**VII | Sécurité**\nNe cliquez pas sur des liens suspects ou envoyés par des utilisateurs non vérifiés.\nSignalez tout comportement suspect ou violation des règles à l'équipe Papillon et/ou aux modérateurs du serveur.\n\n**VIII | Publicité**\nLa publicité n'est pas autorisé sur le Discord de Papillon.\nSi vous avez quelquonque demande concernant ce sujet, nous vous invitons à nous contacter par ticket dans <#1015651919076790333>\n\n**IX | Respect des Conditions d'Utilisations de Discord**\nEn utilisant ce serveur, vous acceptez également de respect les [Conditions d'Utilisations de Discord](https://discord.com/terms). Toutes infractions à ces conditions pourront entraîner des sanctions.\n\n**X | Modifications du règlement**\nL'équipe Papillon peut à tout moment effectuer des modifications sur ce règlement. Il est de la responsabilité des membres de se tenir informé des changements.");
        const separator2 = new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large);
        const description3 = new TextDisplayBuilder().setContent("👋 Pour accéder au serveur Discord, appuie sur le bouton.");
        const description4 = new TextDisplayBuilder().setContent("**✨ En appuyant, tu confirmes avoir pris connaissance des règles du serveur.**")
        const button = new ButtonBuilder()
            .setCustomId("acceptRules")
            .setLabel("J'accepte les règles")
            .setEmoji(`${config.emojis.papillon}`)
            .setStyle(ButtonStyle.Secondary);
        const section = new SectionBuilder()
            .addTextDisplayComponents(title, description)
            .setThumbnailAccessory(thumbnail);
        const section2 = new SectionBuilder()
            .addTextDisplayComponents(description3, description4)
            .setButtonAccessory(button);
        const container = new ContainerBuilder()
            .addSectionComponents(section)
            .addSeparatorComponents(separator)
            .addTextDisplayComponents(title2, description2)
            .addSeparatorComponents(separator2)
            .addSectionComponents(section2);

        await interaction.deferReply();
        await (interaction.channel as GuildTextBasedChannel).send({
            flags: [MessageFlags.IsComponentsV2],
            components: [container]
        });
    }
};
export default sendRulesMessageCommand;
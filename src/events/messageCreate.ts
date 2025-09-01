import { 
    ContainerBuilder, 
    GuildTextBasedChannel, 
    Message, 
    MessageFlags, 
    SeparatorBuilder, 
    SeparatorSpacingSize, 
    TextDisplayBuilder 
} from "discord.js";
import { ExtendedClient } from "../types/ExtendedClient";

const Perspective = require('perspective-api-client');
const perspective = new Perspective({ apiKey: process.env.PERSPECTIVE_API_KEY });

export default async (bot: ExtendedClient, message: Message) => {
    if (message.author.bot) return;

    try {
        const result = await perspective.analyze({
            comment: { text: message.content },
            requestedAttributes: {
                TOXICITY: {},
                INSULT: {},
                THREAT: {},
                SEXUALLY_EXPLICIT: {},
                IDENTITY_ATTACK: {}
            },
            doNotStore: true
        });

        const scores = result.attributeScores;

        const toxicity = scores?.TOXICITY?.summaryScore?.value ?? 0;
        const insult = scores?.INSULT?.summaryScore?.value ?? 0;
        const threat = scores?.THREAT?.summaryScore?.value ?? 0;
        const sexual = scores?.SEXUALLY_EXPLICIT?.summaryScore?.value ?? 0;
        const identity = scores?.IDENTITY_ATTACK?.summaryScore?.value ?? 0;

        let deplace = false;
        let motif = "";

        if (insult >= 0.7 || toxicity >= 0.75) {
            deplace = true;
            motif = "Insultes / Toxicité";
        } else if (threat >= 0.7) {
            deplace = true;
            motif = "Menaces";
        } else if (sexual >= 0.7) {
            deplace = true;
            motif = "Contenu sexuel";
        } else if (identity >= 0.7) {
            deplace = true;
            motif = "Attaque identité";
        }

        if (deplace) {
            const moderationChannel = bot.channels.cache.get(`${process.env.CHANNEL_AI_MODERATION}`) as GuildTextBasedChannel;

            const title = new TextDisplayBuilder()
                .setContent(`## Message potentiellement déplacé ${process.env.RED_FLAG}`);

            const separator = new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large);

            const description = new TextDisplayBuilder()
                .setContent(`${process.env.BLUE_DISCORD} **Utilisateur :** <@${message.author.id}>\n${process.env.GREEN_PAPILLON} **Salon :** <#${message.channel.id}> - ${message.url}\n${process.env.RED_STAR} **Motif :** ${motif || "Non spécifié"}\n\n${process.env.RED_FLAG} **Message :** ${message.content}`);

            const container = new ContainerBuilder()
                .addTextDisplayComponents(title)
                .addSeparatorComponents(separator)
                .addTextDisplayComponents(description);

            await moderationChannel.send({
                flags: [MessageFlags.IsComponentsV2],
                components: [container]
            });
        }

    } catch (err) {
        console.error("Erreur lors de la modération avec Perspective API :", err);
    }
};

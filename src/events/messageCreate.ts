import { ContainerBuilder, GuildChannel, GuildMember, GuildTextBasedChannel, Message, MessageFlags, SectionBuilder, SeparatorBuilder, SeparatorSpacingSize, TextDisplayBuilder, ThumbnailBuilder } from "discord.js";
import { ExtendedClient } from "../types/ExtendedClient";
import OpenAI from "openai";

const openai = new OpenAI({
    apiKey: process.env.OPENROUTER_API_KEY,
    baseURL: "https://openrouter.ai/api/v1"
});

export default async (bot: ExtendedClient, message: Message) => {

    if (message.author.bot) return;

    try {

        const completion = await openai.chat.completions.create({
            model: "openai/gpt-4o",
            messages: [
                {
                    role: "system",
                    content: `
                    Tu es un modérateur.
                    Analyse le message et réponds STRICTEMENT au format JSON suivant :
                    {
                    "deplace": true/false,
                    "motif": "insultes" ou "déplacé" ou ""
                    }

                    Règles :
                    - "deplace" doit être true UNIQUEMENT si le message contient des insultes ou un langage déplacé.
                    - "motif" doit être EXACTEMENT "insultes" ou "déplacé". 
                    - Si "deplace" est false, alors "motif" doit être "" (vide).
                    - Ne renvoie JAMAIS de texte avant ou après le JSON.
                    - Ne mets JAMAIS de backticks ou de blocs de code (\`\`\`json).
                    Seulement le JSON brut.
                    `,
                },
                {
                    role: "user",
                    content: `${message.content}`,
                },
            ],
        });

        const output = completion.choices[0]?.message?.content ?? "{}";
        const parsed = JSON.parse(output);

        if (parsed.deplace) {
            const moderationChannel = bot.channels.cache.get(`${process.env.CHANNEL_AI_MODERATION}`) as GuildTextBasedChannel;

            const title = new TextDisplayBuilder()
                .setContent(`## Message potentiellement déplacé ${process.env.RED_FLAG}`);

            const separator = new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large);

            const description = new TextDisplayBuilder()
                .setContent(`${process.env.BLUE_DISCORD} **Utilisateur :** <@${message.author.id}>\n${process.env.RED_STAR} **Motif :** ${parsed.motif || "Non spécifiié"}\n\n${process.env.RED_FLAG} **Message :** ${message.content}`);

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
        console.log("Erreur lors de la modération d'un message :", err);
    }
    
};
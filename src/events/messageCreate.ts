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
                        Tu es un modérateur, analyse le message et réponds STRICTEMENT au format JSON :
                        {
                            "deplace": true/false,
                            "motif: "courte explication"
                        }
                        Réponds uniquement en JSON, rien d'autre.
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
                .setContent(`${process.env.BLUE_DISCORD} **Utilisateur :** <@${message.author.id}>\n\n${process.env.RED_STAR} **Motif :** ${parsed.motif || "Non spécifiié"}\n${process.env.RED_FLAG} **Message :** ${message.content}`);

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
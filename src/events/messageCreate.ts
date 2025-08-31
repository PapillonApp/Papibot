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
                        Tu es un modérateur strict et intelligent. 
                        Ton but est d'identifier UNIQUEMENT :
                        1. Les insultes grossières et offensantes dirigées vers quelqu'un.
                        2. Les messages de SCAM / phishing (ex : menaces de suspension de compte, liens suspects, demandes d'informations personnelles).

                        Réponds STRICTEMENT au format JSON suivant :
                        {
                        "deplace": true/false,
                        "motif": "Insultes" ou "Scam" ou ""
                        }

                        Règles précises :
                        - "deplace" = true UNIQUEMENT si :
                        a) Le message contient une insulte claire et grossière (exemples : "connard", "fdp", "va te faire foutre", "salope", "pute").
                        b) Le message ressemble à une tentative de scam/phishing (exemples : "votre compte sera suspendu", "cliquez sur ce lien", liens suspects imitant un site connu).
                        - Les critiques légères, remarques désobligeantes ou blagues (ex: "t'es nul", "t'es un chômeur", "je suis un message déplacé") NE SONT PAS considérées comme déplacées → retourne false.
                        - Pour les insultes → "motif" = "Insultes".
                        - Pour les scams → "motif" = "Scam".
                        - Si rien de problématique → "motif" = "".
                        - Le mot dans "motif" doit toujours commencer par une majuscule.
                        - Réponds uniquement en JSON brut. 
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
                .setContent(`${process.env.BLUE_DISCORD} **Utilisateur :** <@${message.author.id}>\n${process.env.GREEN_PAPILLON} **Salon :** <#${message.channel.id}> - ${message.url}\n${process.env.RED_STAR} **Motif :** ${parsed.motif || "Non spécifiié"}\n\n${process.env.RED_FLAG} **Message :** ${message.content}`);

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
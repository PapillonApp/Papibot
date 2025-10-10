import { Message } from "discord.js";
import { ExtendedClient } from "../types/extendedClient";
import config from '../../config.json';
import { OpenAI } from 'openai';

const openai = new OpenAI({
    apiKey: process.env.OPENROUTER_API_KEY,
    baseURL: 'https://openrouter.ai/api/v1'
});

export default async (bot: ExtendedClient, message: Message) => {
    if (message.author.bot) return;

    if (!message.reference) return;
    const repliedMessage = await message.fetchReference().catch(() => null);
    if (!repliedMessage) return;
    const member = message.member;
    if (!member) return;
    if (!member.roles.cache.has(config.server.roles.selectedadmin)) return;
    if (!bot.user || !message.mentions.users.has(bot.user.id)) return;
    const content = message.content.replace(new RegExp(`<@${bot.user.id}>`, 'g'), '').trim();
    const originalAuthor = repliedMessage.author.username;
    const prompt = `Réponds de manière blasée et très moqueuse envers ${originalAuthor}, en te basant sur le message suivant: "${repliedMessage.content}". La réponse doit être courte, maximum 3 lignes.`;

    try {
        const completion = await openai.chat.completions.create({
            model: 'gpt-3.5-turbo',
            messages: [{ role: 'user', content: prompt }],
            max_tokens: 150
        });

        const response = completion.choices[0].message.content;
        if (response) {
            await message.reply(response);
        }
    } catch (err) {
        console.error("Error generating response:", err);
        await message.reply("Error generating response");
    }
}
import { SlashCommandBuilder, InteractionContextType, Routes, Client, Collection } from "discord.js";
import { REST } from "@discordjs/rest";;
import { Command } from "../types/command";

interface BotClient extends Client {
    commands: Collection<string, Command>;
}

export default async function loadSlashCommands(bot: BotClient) {
    const commands: SlashCommandBuilder[] = [];
    bot.commands.forEach((command: Command) => {
        const slashcommand = new SlashCommandBuilder()
            .setName(command.name)
            .setDescription(command.description ?? "Aucune description")
            .setContexts(
                command.dm ? [
                    InteractionContextType.Guild,
                    InteractionContextType.BotDM,
                    InteractionContextType.PrivateChannel,
                ] : [InteractionContextType.Guild]
            )
            .setDefaultMemberPermissions(command.permission === "null" ? null : command.permission);

        if(command.options?.length) {
            for (const opt of command.options) {
                const optionMethod = `add${opt.type.charAt(0).toUpperCase()}${opt.type.slice(1).toLocaleLowerCase()}Option` as keyof SlashCommandBuilder;
                // @ts-expect-error
                slashcommand[optionMethod]((option: any) => {
                    option
                        .setName(opt.name)
                        .setDescription(opt.description)
                        .setRequired(opt.required ?? false);
                    
                    if(opt.type === "integer") {
                        if(typeof opt.minValue !== "undefined") {
                            option.setMinValue(opt.minValue);
                        }
                        if(typeof opt.maxValue !== "undefined") {
                            option.setMaxValue(opt.maxValue);
                        }
                    }

                    return option;
                });
            }
        }
        commands.push(slashcommand);
    });

    const rest = new REST({ version: "10" }).setToken(bot.token!);
    await rest.put(Routes.applicationCommands(bot.user!.id), {
        body: commands.map((c) => c.toJSON())
    });

    console.log("The slash commands have been loaded");
}
import { ExtendedClient } from "../types/extendedClient";
import { errorMessage } from "../functions/errorMessage";
import { Interaction } from "discord.js";
import { Command } from "../types/command";

export default async function interactionCreate(bot: ExtendedClient, interaction: Interaction): Promise<void> {
    if(interaction.isChatInputCommand()) {
        const command: Command | undefined = bot.commands.get(interaction.commandName);
        if(!command) {
            await interaction.reply(errorMessage("Commande introuvable. Vérifie le nom et réessaie."));
            return;
        }
        
        try {
            if(command.run) {
                await command.run(bot, interaction);
            }
        } catch (err) {
            await interaction.reply(errorMessage("Une erreur est survenue lors de l’exécution de la commande."));
            return console.error(err);
        }
    }
}
import {
    MessageFlags,
    TextDisplayBuilder,
    ContainerBuilder,
    ChatInputCommandInteraction,
} from "discord.js";
import { Command } from "../types/Command";
import type { ExtendedClient } from "../types/ExtendedClient";

const helpCommand: Command = {
    name: "aide",
    description: "Voir la liste complète des commandes d'Erya",
    dm: false,

    async run(bot: ExtendedClient, interaction: ChatInputCommandInteraction) {

        const title = new TextDisplayBuilder()
            .setContent(`# Centre d'aide d'Erya ${process.env.GREEN_PAPILLON}`);

        const description = new TextDisplayBuilder().setContent("> **Voici la liste des commandes disponibles, tu peux les consulter à tout moment** 🦋\n\n## ``✨ Utilitaire``\n``/aide`` ➩ _Voir la liste complète des commandes d'Erya_\n``/clear`` ➩ _Effacer d'un seul coup un nombre précis de message dans un salon_\n\n## ``🚨 Modération``\n``/avertir`` ➩ _Donner un avertissement à un utilisateur_\n``/bannir`` ➩ _Bannir un utilisateur du serveur_\n``/expulser`` ➩ _Expulser un utilisateur du serveur_\n``/mute`` ➩ _Réduire au silence un utilisateur du serveur_\n``/unmute`` ➩ _Redonner la parole a un utilisateur du serveur_\n``/sanctions`` ➩ _Visualiser les sanctions d'un utilisateur du serveur_\n\n\n-# Commande exécutée avec succès | **0x101**")


        const container = new ContainerBuilder()
            .addTextDisplayComponents(title, description);

        await interaction.reply({
            flags: [MessageFlags.IsComponentsV2, MessageFlags.Ephemeral],
            components: [container],
        });

    },
};

export default helpCommand;

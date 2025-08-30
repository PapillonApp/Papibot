import {
    TextDisplayBuilder,
    ThumbnailBuilder,
    SectionBuilder,
    ContainerBuilder,
    MessageFlags,
    InteractionReplyOptions,
    ButtonBuilder,
    ButtonStyle,
    ActionRowBuilder,
} from "discord.js";
import type { ExtendedClient } from "../types/ExtendedClient";

/**
 * Génère un message d'erreur formaté pour Discord et stocke les infos dans bot.errors
 * @param bot Instance du client étendu
 * @param description Description détaillée de l’erreur
 * @param errorText Texte court décrivant l’erreur
 * @param errorCode Code associé à l’erreur
 * @param withReportButton Active ou non le bouton de signalement
 */
export function errorMessage(
    bot: ExtendedClient,
    description: string,
    errorText: string,
    errorCode: string | number,
    withReportButton: boolean = true
): InteractionReplyOptions {
    // Génère un ID unique pour retrouver cette erreur plus tard
    const errorId = Date.now().toString();

    // Stocker l'erreur dans la map du bot
    bot.errors.set(errorId, { description, errorText, errorCode });

    // Construire le visuel de l'erreur
    const title = new TextDisplayBuilder().setContent(
        `# Une erreur inattendue est apparue`
    );

    const descriptionComponent = new TextDisplayBuilder().setContent(description);

    const errorComponent = new TextDisplayBuilder().setContent(
        `‎ \n-# ${errorText} | **${errorCode}**`
    );

    const thumbnail = new ThumbnailBuilder({
        media: {
            url: `https://raw.githubusercontent.com/ryzenixx/papillon-assets/refs/heads/main/sad.png`,
        },
    });

    const section = new SectionBuilder()
        .addTextDisplayComponents(title, descriptionComponent, errorComponent)
        .setThumbnailAccessory(thumbnail);

    const container = new ContainerBuilder().addSectionComponents(section);

    // On prépare la liste des components
    const components: (ContainerBuilder | ActionRowBuilder<ButtonBuilder>)[] = [container];

    // Bouton "Signaler" si activé
    if (withReportButton) {
        const actionrow = new ActionRowBuilder<ButtonBuilder>().addComponents(
            new ButtonBuilder()
                .setCustomId(`reportError:${errorId}`)
                .setLabel("Signaler cette erreur")
                .setEmoji(`${process.env.RED_FLAG}`)
                .setStyle(ButtonStyle.Secondary)
        );
        components.push(actionrow);
    }

    return {
        flags: [MessageFlags.IsComponentsV2, MessageFlags.Ephemeral],
        components,
    };
}

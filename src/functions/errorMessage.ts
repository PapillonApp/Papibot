import { ContainerBuilder, InteractionReplyOptions, MessageFlags, SectionBuilder, TextDisplayBuilder, ThumbnailBuilder } from "discord.js";

export function errorMessage(
    error: string
): InteractionReplyOptions {
    const title = new TextDisplayBuilder().setContent("# Oups, une erreur est survenue");
    const description = new TextDisplayBuilder().setContent(error);
    const thumbnail = new ThumbnailBuilder({ media: { url: "https://raw.githubusercontent.com/ryzenixx/papillon-assets/refs/heads/main/papillon_angry.png" } });
    const section = new SectionBuilder().addTextDisplayComponents(title, description).setThumbnailAccessory(thumbnail);
    const container = new ContainerBuilder().addSectionComponents(section);
    
    return {
        flags: [MessageFlags.IsComponentsV2, MessageFlags.Ephemeral],
        components: [container]
    }
}
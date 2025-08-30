import type { ExtendedClient } from "../types/ExtendedClient";
import loadDatabase from "../loaders/loadDatabase";

export async function ensureDatabase(bot: ExtendedClient): Promise<boolean> {
    if (bot.db) return true; // déjà connecté

    try {
        bot.db = loadDatabase();

        await new Promise<void>((resolve, reject) => {
            bot.db!.connect((err) => {
                if (err) return reject(err);
                console.log("🔄 Reconnexion DB réussie");
                resolve();
            });
        });

        return true;
    } catch (err) {
        console.error("❌ Impossible de se connecter à la DB:", err);
        bot.db = undefined;
        return false;
    }
}

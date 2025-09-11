import type { ExtendedClient } from "../types/ExtendedClient";
import loadDatabase from "../loaders/loadDatabase";

export async function ensureDatabase(bot: ExtendedClient): Promise<boolean> {
    if (bot.db) return true;

    try {
        bot.db = loadDatabase();

        await new Promise<void>((resolve, reject) => {
            bot.db!.query("SELECT 1", (err) => {
                if (err) return reject(err);
                console.log("🔄 Connexion DB OK");
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

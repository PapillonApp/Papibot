import { IntentsBitField } from "discord.js";
import "dotenv/config";
import { ExtendedClient } from "./types/extendedClient";
import loadCommands from "./loaders/loadCommands";
import loadEvents from "./loaders/loadEvents";

const intents = new IntentsBitField(3276799);
const bot = new ExtendedClient({ intents });

try {
    bot.login(process.env.BOT_TOKEN);
    loadCommands(bot);
    loadEvents(bot);
    console.log(`Connected to Discord with the user ${bot.user?.username}`);
} catch (error) {
    console.error("An error occurred while starting the bot:", error);
    process.exit(1);
}
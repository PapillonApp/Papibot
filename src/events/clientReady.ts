import { ActivityType } from "discord.js";
import loadSlashCommands from "../loaders/loadSlashCommands";
import loadDatabase from "../loaders/loadDatabase";
import express from "express";
import type { ExtendedClient } from "../types/extendedClient";
import config from '../../config.json';

export default async (bot: ExtendedClient) => {
    const database = loadDatabase()
    bot.db = database;

    function pingDatabase() {
        database.query("SELECT 1", (err) => {
            if(err) {
                console.error("Error connecting to MySQL: ", err);
            }
        });
    }
    pingDatabase();
    setInterval(pingDatabase, 1 * 60 * 60 * 1000);

    await loadSlashCommands(bot);

    function setPresence() {
        bot.user?.setPresence({
            status: "idle",
            activities: [
                {
                    name: `${config.bot.status}`,
                    type: ActivityType.Watching
                }
            ]
        });
    }
    setPresence();
    setInterval(setPresence, 1 * 60 * 60 * 1000);

    const app = express();
    app.get("/health", (_req, res) => {
        res.status(200).send("OK");
    });
    app.listen(8080, () => {
        console.log("Healthcheck server started")
    });
}
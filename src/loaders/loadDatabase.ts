import mysql, { Connection } from "mysql2";
import "dotenv/config";

let db: Connection;

function handleDisconnect() {
  db = mysql.createConnection({
    host: process.env.DB_HOST!,
    user: process.env.DB_USER!,
    password: process.env.DB_PASSWORD!,
    database: process.env.DB_NAME!,
  });

  db.connect((err) => {
    if (err) {
      console.error("Erreur connexion MySQL:", err);
      setTimeout(handleDisconnect, 2000); // retry après 2s
    } else {
      console.log("✅ MySQL connecté !");
    }
  });

  db.on("error", (err) => {
    console.error("Erreur DB:", err);
    if (err.code === "PROTOCOL_CONNECTION_LOST") {
      console.warn("🔄 Reconnexion MySQL...");
      handleDisconnect();
    } else {
      throw err;
    }
  });
}

export default function loadDatabase(): Connection {
  if (!db) handleDisconnect();
  return db;
}

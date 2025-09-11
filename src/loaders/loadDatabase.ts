import mysql, { Pool } from "mysql2";
import "dotenv/config";

let pool: Pool;

export default function ensureDatabase(): Pool {
  if (!pool) {
    pool = mysql.createPool({
      host: process.env.DB_HOST!,
      user: process.env.DB_USER!,
      password: process.env.DB_PASSWORD!,
      database: process.env.DB_NAME!,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
    });

    pool.on("connection", () => {
      console.log("✅ Nouvelle connexion MySQL établie au pool !");
    });

    pool.on("error", (err) => {
      console.error("Erreur pool MySQL:", err);
    });
    
    pool.query("SELECT 1", (err: mysql.QueryError | null) => {
      if (err) {
        console.error("Erreur de connexion à la BDD:", err);
      } else {
        console.log("Connexion BDD OK !");
      }
    });
  }
  return pool;
}
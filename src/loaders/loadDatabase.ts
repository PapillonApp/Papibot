import mysql, { Pool } from "mysql2";

let pool: Pool;

export default function ensureDatabase(): Pool {
    if(!pool) {
        pool = mysql.createPool({
            host: process.env.DB_HOST!,
            user: process.env.DB_USER!,
            password: process.env.DB_PASSWORD!,
            database: process.env.DB_NAME!,
            waitForConnections: true,
            connectionLimit: 10,
            queueLimit: 0
        });

        pool.on("error", (err) => {
            console.error("MySQL error:", err);
        });

        pool.query("SELECT 1", (err: mysql.QueryError | null) => {
            if(err) {
                console.error("Error connecting to MySQL:", err);
            }
            else
            {
                console.log("Connected to MySQL");
            }
        });
    }
    return pool;
}
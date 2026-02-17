import { Pool } from "pg"
import dotenv from "dotenv"

dotenv.config()

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // Fallback para variáveis individuais se DATABASE_URL não estiver definida
  user: process.env.DATABASE_URL ? undefined : process.env.DB_USER,
  password: process.env.DATABASE_URL ? undefined : process.env.DB_PASSWORD,
  host: process.env.DATABASE_URL ? undefined : process.env.DB_HOST,
  port: process.env.DATABASE_URL ? undefined : Number.parseInt(process.env.DB_PORT || "5432"),
  database: process.env.DATABASE_URL ? undefined : process.env.DB_NAME,
})

pool.on("error", (err) => {
  console.error("Unexpected error on idle client", err)
  process.exit(-1)
})

export default pool

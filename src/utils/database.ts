import { Pool } from "pg";
import dotenv from "dotenv";
import config from "../environment/config";


dotenv.config();

const dbConfig = config.db;

const pool = new Pool(dbConfig);

pool
  .connect()
  .then(() => console.log("Connected to PostgreSQL database"))
  .catch((err: Error) =>
    console.error("Error connecting to the database:", err),
  );

export default pool;  
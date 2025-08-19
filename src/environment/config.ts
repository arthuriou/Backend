import dotenv from "dotenv";

dotenv.config();

export  const config = {
  port: parseInt(process.env.PORT as string, 10),
  jwtSecret: process.env.JWT_SECRET as string,
  db: {
    user: process.env.DB_USER as string,
    password: process.env.DB_PASSWORD as string,
    host: process.env.DB_HOST as string,
    port: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 5432,
    database: process.env.DB_NAME as string,
    ssl: process.env.DB_SSLMODE === "require",
  },
  // sendgridApiKey: process.env.SENDGRID_API as string,
  // sendgridFrom: process.env.SENDGRID_FROM as string,
  // frontendUrl: process.env.FRONTEND_URL as string,
};

export default config;
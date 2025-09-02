import dotenv from "dotenv";
import app from "./app";

dotenv.config();

const PORT = process.env.PORT ? parseInt(process.env.PORT as string, 10) : 3000;

app.listen(PORT, () => {
  console.log(`le serveur est lancé sur l'url : http://localhost:${PORT}`);
});



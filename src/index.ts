import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { Request, Response } from "express";

dotenv.config();

const app = express();
const PORT = process.env.PORT;
const API_URL =  "http://localhost:3000";

app.use(express.json());
app.use(cors());


app.get("/", (req: Request, res: Response) => {
  res.send("Welcome to the Backend API");
});

app.listen(PORT, () => {
  console.log(`le serveur est lancé sur l'url : ${API_URL}`);
});



import express, { Request, Response } from "express";
import cors from "cors";
import { SUCCESS_MESSAGES, ERROR_MESSAGES, HTTP_STATUS } from "./shared/constants";

const app = express();

app.use(express.json());
app.use(cors());

// Root endpoint
app.get("/", (req: Request, res: Response) => {
  res.send("Welcome to the Backend API");
});

// Health check
app.get("/api/health", (req: Request, res: Response) => {
  res.status(HTTP_STATUS.OK).json({
    status: "ok",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

// Users (stub)
app.get("/api/users", (req: Request, res: Response) => {
  res.status(HTTP_STATUS.OK).json({ users: [] });
});

// Auth (stub)
app.post("/api/auth/login", (req: Request, res: Response) => {
  const { email, password } = (req.body || {}) as { email?: string; password?: string };

  if (!email || !password) {
    return res.status(HTTP_STATUS.BAD_REQUEST).json({
      message: ERROR_MESSAGES.REQUIRED_FIELD,
      errors: {
        email: !email ? ERROR_MESSAGES.REQUIRED_FIELD : undefined,
        password: !password ? ERROR_MESSAGES.REQUIRED_FIELD : undefined,
      },
    });
  }

  return res.status(HTTP_STATUS.OK).json({
    message: SUCCESS_MESSAGES.LOGIN_SUCCESS,
    token: "fake-token",
  });
});

export default app;


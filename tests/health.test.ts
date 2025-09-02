import request from "supertest";
import { describe, it, expect } from "vitest";
import app from "../src/app";

describe("GET /api/health", () => {
  it("returns health status", async () => {
    const res = await request(app).get("/api/health");
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("status", "ok");
    expect(typeof res.body.uptime).toBe("number");
    expect(typeof res.body.timestamp).toBe("string");
  });
});


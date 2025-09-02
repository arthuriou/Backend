import request from "supertest";
import { describe, it, expect } from "vitest";
import app from "../src/app";

describe("GET /api/users", () => {
  it("returns empty users array", async () => {
    const res = await request(app).get("/api/users");
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("users");
    expect(Array.isArray(res.body.users)).toBe(true);
  });
});


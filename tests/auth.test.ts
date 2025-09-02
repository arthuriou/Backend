import request from "supertest";
import { describe, it, expect } from "vitest";
import app from "../src/app";

describe("POST /api/auth/login", () => {
  it("fails with 400 when missing credentials", async () => {
    const res = await request(app).post("/api/auth/login").send({});
    expect(res.status).toBe(400);
  });

  it("succeeds with 200 when email and password provided", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: "a@b.com", password: "secret" });
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("message");
    expect(res.body).toHaveProperty("token");
  });
});


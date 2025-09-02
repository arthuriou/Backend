import request from "supertest";
import { describe, it, expect } from "vitest";
import app from "../src/app";

describe("GET /", () => {
  it("responds with welcome text", async () => {
    const res = await request(app).get("/");
    expect(res.status).toBe(200);
    expect(res.text).toBe("Welcome to the Backend API");
  });
});


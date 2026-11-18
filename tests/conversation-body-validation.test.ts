import assert from "node:assert/strict";
import test from "node:test";
import { createApp } from "../apps/server/src/app.ts";
import { browserFixture } from "./helpers/browser.ts";

test("PUT /api/conversation rejects null and primitive JSON bodies with 422 instead of 502", async (t) => {
  const { db, config } = await browserFixture(t, () => ({ data: {} }));
  const { app, auth, agent } = await createApp(db, config);
  t.after(() => agent.stop());
  const { token } = await auth.session();
  const headers = { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };

  for (const body of ["null", "123", '"hello"', "true", "[]"]) {
    const response = await app.request("/api/conversation", {
      method: "PUT",
      headers,
      body,
    });
    assert.equal(response.status, 422, `Expected 422 for body ${body}, got ${response.status}`);
  }
});

import assert from "node:assert/strict";
import test from "node:test";
import { createApp } from "../apps/server/src/app.ts";
import { browserFixture } from "./helpers/browser.ts";

const sessionId = "00000000-0000-4000-8000-000000000002";

test("browser API rejects non-HTTP(S) URLs with 422 without persisting sessions", async (t) => {
  const calls: string[] = [];
  const { db, config } = await browserFixture(t, (path) => {
    calls.push(path);
    return { data: {} };
  });
  const { app, auth, agent } = await createApp(db, config);
  t.after(() => agent.stop());
  const { token } = await auth.session();
  const headers = { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };

  await db.put("local-user", "browsers", {
    id: sessionId,
    title: "Saved",
    url: "https://example.com/",
    status: "active",
    updatedAt: "2026-09-15T00:00:00.000Z",
  });

  for (const badUrl of ["javascript:alert(1)", "file:///etc/passwd", "data:text/html,hi"]) {
    const created = await app.request("/api/browsers", {
      method: "POST",
      headers,
      body: JSON.stringify({ url: badUrl }),
    });
    assert.equal(created.status, 422);

    const navigated = await app.request(`/api/browsers/${sessionId}/navigate`, {
      method: "POST",
      headers,
      body: JSON.stringify({ url: badUrl }),
    });
    assert.equal(navigated.status, 422);

    const reopened = await app.request(`/api/browsers/${sessionId}/reopen`, {
      method: "POST",
      headers,
      body: JSON.stringify({ url: badUrl }),
    });
    assert.equal(reopened.status, 422);
  }

  assert.equal(calls.length, 0);
  const stored = await db.list("local-user", "browsers");
  assert.equal(stored.length, 1);
  assert.equal(stored[0].url, "https://example.com/");
});

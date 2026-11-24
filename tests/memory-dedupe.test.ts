import assert from "node:assert/strict";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test, { type TestContext } from "node:test";
import { createApp } from "../apps/server/src/app.ts";
import type { Config } from "../apps/server/src/config.ts";
import { createStore } from "../apps/server/src/db.ts";
import type { AgentMemory } from "../packages/domain/src/agent.ts";

async function fixture(t: TestContext) {
  const directory = await mkdtemp(join(tmpdir(), "openfuse-memory-"));
  const db = await createStore({ dataDir: join(directory, "db") });
  const config: Config = {
    mode: "sample",
    port: 8787,
    host: "127.0.0.1",
    publicUrl: "http://localhost:8787",
    dataDir: directory,
    agentBackend: "sample",
    intelligenceApiKey: "test-project-key-never-sent",
    googleRedirectUri: "http://localhost:8787/api/google/callback",
    allowedOrigins: [],
  };
  const server = await createApp(db, config);
  t.after(async () => {
    await server.agent.stop();
    await db.close();
    await rm(directory, { recursive: true, force: true });
  });
  return { db, server };
}

test("remembering the same fact in a later turn keeps one memory", async (t) => {
  const { db, server } = await fixture(t);
  const owner = "memory-dedupe-user";
  const first = await server.agent.rememberFact(
    owner,
    "  Likes oat milk  ",
    "User confirmed in chat",
  );
  const second = await server.agent.rememberFact(owner, "Likes oat milk", "User confirmed in chat");

  assert.equal(second.id, first.id);
  assert.equal(second.createdAt, first.createdAt);
  const memories = await db.list<AgentMemory>(owner, "memories");
  assert.deepEqual(
    memories.map((memory) => memory.text),
    ["Likes oat milk"],
  );
});

test("different facts remain separate memories", async (t) => {
  const { db, server } = await fixture(t);
  const owner = "memory-dedupe-user";
  await server.agent.rememberFact(owner, "Likes oat milk", "User confirmed in chat");
  await server.agent.rememberFact(owner, "Prefers window seats", "User confirmed in chat");

  const memories = await db.list<AgentMemory>(owner, "memories");
  assert.equal(memories.length, 2);
});

test("a fact saved before ids were stable is reused", async (t) => {
  const { db, server } = await fixture(t);
  const owner = "memory-dedupe-user";
  await db.put(owner, "memories", {
    id: "legacy-memory-id",
    text: "Likes oat milk",
    source: "User confirmed in chat",
    createdAt: "2026-01-01T00:00:00.000Z",
  });

  const memory = await server.agent.rememberFact(owner, "Likes oat milk", "User confirmed in chat");

  assert.equal(memory.id, "legacy-memory-id");
  assert.equal(memory.createdAt, "2026-01-01T00:00:00.000Z");
  assert.equal((await db.list<AgentMemory>(owner, "memories")).length, 1);
});

test("a remembered fact cannot be blank", async (t) => {
  const { server } = await fixture(t);
  await assert.rejects(
    server.agent.rememberFact("memory-dedupe-user", "   ", "User confirmed in chat"),
    /needs text/,
  );
});

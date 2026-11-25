import assert from "node:assert/strict";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test, { type TestContext } from "node:test";
import { createApp } from "../apps/server/src/app.ts";
import type { Config } from "../apps/server/src/config.ts";
import { createStore } from "../apps/server/src/db.ts";
import { createSamplePdf } from "../packages/integrations/src/pdf.ts";

async function fixture(t: TestContext) {
  const directory = await mkdtemp(join(tmpdir(), "openfuse-disposition-"));
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
  return server;
}

for (const [name, encoded] of [
  ["O'Brien (final).pdf", "O%27Brien%20%28final%29.pdf"],
  ["report.pdf", "report.pdf"],
  ["报告 2026.pdf", "%E6%8A%A5%E5%91%8A%202026.pdf"],
] as const) {
  test(`content disposition encodes ${JSON.stringify(name)} for RFC 5987`, async (t) => {
    const server = await fixture(t);
    const owner = "disposition-user";
    const file = await server.files.import(owner, name, await createSamplePdf(), "Test file");
    const url = new URL(file.url);

    const response = await server.app.request(`${url.pathname}${url.search}`);
    assert.equal(response.status, 200);
    assert.equal(
      response.headers.get("content-disposition"),
      `inline; filename*=UTF-8''${encoded}`,
    );
    await response.arrayBuffer();
  });
}

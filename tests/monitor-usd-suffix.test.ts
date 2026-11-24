import assert from "node:assert/strict";
import test from "node:test";
import { createApp } from "../apps/server/src/app.ts";
import type { AgentNotification } from "../packages/domain/src/agent.ts";
import { browserFixture } from "./helpers/browser.ts";

for (const [text, expected] of [
  ["Total: 9.99 USD", true],
  ["Total: 12.00 USD", false],
  ["Total: USD 9.99", true],
  ["Total: $9.99", true],
  ["Shipping: 4.99 USD, item: 19.99 USD", true],
  ["Currency: USD only", false],
] as const) {
  test(`price watch reads USD written after the amount: ${JSON.stringify(text)}`, async (t) => {
    const url = "https://example.com/product";
    const fixture = await browserFixture(t, (path, body) => ({
      data: path.endsWith("/read")
        ? { url, title: "Product", text, truncated: false }
        : {
            id: body.id,
            title: "Product",
            url,
            status: "active",
            updatedAt: new Date().toISOString(),
          },
    }));
    const server = await createApp(fixture.db, fixture.config);
    t.after(() => server.agent.stop());
    const owner = "price-suffix-user";
    const monitor = await server.agent.createMonitor(owner, {
      title: "Price watch",
      url,
      condition: "price_below",
      value: "10",
    });
    await server.agent.worker.tick();
    const task = await server.agent.getTask(owner, monitor.taskId);
    assert.equal(task.status, "scheduled");
    assert.equal(task.state.matched, expected);
    const notifications = await fixture.db.list<AgentNotification>(owner, "notifications");
    assert.equal(
      notifications.filter((entry) => entry.taskId === task.id).length,
      expected ? 1 : 0,
    );
  });
}

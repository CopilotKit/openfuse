import assert from "node:assert/strict";
import { createRequire } from "node:module";
import test from "node:test";

const require = createRequire(import.meta.url);

test("streaming fetch polyfill does not fail a 200 response when readyState jumps from 1 to 4", async () => {
  const { installStreamingFetch } =
    require("../node_modules/@copilotkit/react-native/dist/streaming-fetch-BTESzLKX.cjs") as {
      installStreamingFetch: () => void;
    };
  const originalFetch = globalThis.fetch;
  const originalResponse = globalThis.Response;
  const originalXhr = (globalThis as { XMLHttpRequest?: unknown }).XMLHttpRequest;
  const originalDev = (globalThis as { __DEV__?: boolean }).__DEV__;

  class FakeXHR {
    readyState = 0;
    status = 0;
    statusText = "";
    responseText = "";
    responseType = "";
    onreadystatechange: (() => void) | null = null;
    onload: (() => void) | null = null;
    onerror: (() => void) | null = null;
    ontimeout: (() => void) | null = null;
    onprogress: (() => void) | null = null;
    open() {}
    setRequestHeader() {}
    abort() {}
    getAllResponseHeaders() {
      return "content-type: application/json\r\n";
    }
    send() {
      this.readyState = 4;
      this.status = 200;
      this.statusText = "OK";
      this.responseText = '{"ok":true}';
      this.onreadystatechange?.();
      setTimeout(() => this.onload?.(), 10);
    }
  }

  try {
    (globalThis as { __DEV__?: boolean }).__DEV__ = false;
    (globalThis as { Response?: unknown }).Response = class {
      body = null;
    };
    (globalThis as { XMLHttpRequest?: unknown }).XMLHttpRequest = FakeXHR;
    (globalThis as { fetch: unknown }).fetch = () => {
      throw new TypeError("no Response.body");
    };
    installStreamingFetch();
    const res = await globalThis.fetch("https://example.test/api/workspace");
    assert.equal(res.status, 200);
    assert.equal(await res.text(), '{"ok":true}');
  } finally {
    globalThis.fetch = originalFetch;
    globalThis.Response = originalResponse;
    (globalThis as { XMLHttpRequest?: unknown }).XMLHttpRequest = originalXhr;
    (globalThis as { __DEV__?: boolean }).__DEV__ = originalDev;
  }
});

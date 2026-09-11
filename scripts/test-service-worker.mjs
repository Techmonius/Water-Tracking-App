import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";

// Exercise the actual worker with in-memory Cache/Client APIs; no network or browser needed.
export async function testServiceWorker() {
  const listeners = {},
    removed = [],
    navigated = [],
    network = [],
    entries = new Map();
  let rejectInstall = false,
    offline = false,
    skipped = 0,
    claimed = 0,
    core = [];
  const shell = new Response("<html>known-good shell</html>");
  const cache = {
    async addAll(assets) {
      if (rejectInstall) throw new Error("Offline");
      core = [...assets];
      entries.set("./index.html", shell);
    },
    async match(key) {
      return entries.get(typeof key === "string" ? key : key.url);
    },
    async put(key, response) {
      entries.set(typeof key === "string" ? key : key.url, response);
    },
  };
  const context = {
    URL,
    Response,
    console,
    self: {
      location: { origin: "https://example.test" },
      addEventListener: (name, fn) => (listeners[name] = fn),
      skipWaiting: () => skipped++,
      clients: {
        claim: async () => claimed++,
        matchAll: async () => [
          {
            url: "https://example.test/app/",
            navigate: async (url) => navigated.push(url),
          },
        ],
      },
    },
    caches: {
      open: async () => cache,
      keys: async () => [
        "unrelated-cache",
        "water-tracker-1.9.0",
        "water-tracker-1.9.1",
      ],
      delete: async (key) => removed.push(key),
      match: async (key) => entries.get(key),
    },
    fetch: async (request) => {
      network.push(request.url || request);
      if (offline) throw new Error("Offline");
      return new Response("network");
    },
  };
  vm.runInNewContext(fs.readFileSync("service-worker.js", "utf8"), context);
  async function lifecycle(name) {
    let work;
    listeners[name]({ waitUntil: (p) => (work = p) });
    await work;
  }
  rejectInstall = true;
  await assert.rejects(() => lifecycle("install"));
  assert.equal(skipped, 0);
  assert.equal(removed.length, 0);
  rejectInstall = false;
  await lifecycle("install");
  assert.equal(skipped, 0, "new release must wait for explicit activation");
  assert(core.includes("./v1/assets/plants/monstera/stage-8.png"));
  listeners.message({ data: { type: "SKIP_WAITING" } });
  assert.equal(skipped, 1);
  await lifecycle("activate");
  assert.deepEqual(removed, ["water-tracker-1.9.0"]);
  assert.equal(claimed, 1);
  assert.equal(navigated.length, 1);
  async function request(path, mode = "cors") {
    let response;
    listeners.fetch({
      request: { method: "GET", url: "https://example.test/app/" + path, mode },
      respondWith: (p) => (response = p),
    });
    return response;
  }
  offline = true;
  assert.equal(
    await (await request("", "navigate")).text(),
    "<html>known-good shell</html>",
  );
  entries.set("./v1-version.txt", new Response("1.9.1"));
  assert.equal(
    await (await request("v1-version.txt?check=123")).text(),
    "1.9.1",
  );
  assert(network.some((url) => url.includes("v1-version.txt?check=123")));
  assert(![...entries.keys()].some((key) => key.includes("?check=")));
  offline = false;
  const url = "https://example.test/app/v1/assets/plants/stage-1.webp";
  entries.set(url, new Response("cached art"));
  const before = network.length;
  assert.equal(
    await (await request("v1/assets/plants/stage-1.webp")).text(),
    "cached art",
  );
  assert.equal(network.length, before);
  console.log(
    "✓ Service worker: failed install safety, explicit activation, scoped cleanup, offline shell/assets and uncached version checks",
  );
}

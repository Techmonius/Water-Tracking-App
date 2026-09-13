import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";

export async function testUpdateFlow() {
  const source = fs.readFileSync("v1/js/ui-extras.js", "utf8");
  const block = source.slice(source.indexOf("  let checkingWorker"), source.indexOf("  window.addEventListener(\"wt-details-refresh\""));
  const windowEvents = {}, documentEvents = {}, workerEvents = {};
  const timers = [], button = {}, banner = {};
  let updates = 0, activations = 0, reloads = 0;
  const reg = {
    waiting: { state: "installed", postMessage: () => activations++ },
    update: async () => { updates++; },
  };
  const serviceWorker = {
    controller: {},
    getRegistration: async () => reg,
    addEventListener: (name, fn) => { (workerEvents[name] ||= []).push(fn); },
    removeEventListener: () => {},
  };
  const document = { visibilityState: "visible", addEventListener: (name, fn) => documentEvents[name] = fn };
  vm.runInNewContext(block, {
    navigator: { serviceWorker }, document,
    window: { addEventListener: (name, fn) => windowEvents[name] = fn },
    location: { reload: () => reloads++ },
    setTimeout: (fn) => { timers.push(fn); return timers.length; }, clearTimeout: () => {},
    $: (id) => id === "updateNow" ? button : banner,
    fetch: async () => ({ ok: false }), C: { appVersion: "test" }, alert: () => {},
  });
  await windowEvents.pageshow();
  await new Promise(setImmediate);
  assert.equal(updates, 1, "opening checks for an update");
  assert.equal(activations, 1, "opening applies an already downloaded update");
  document.visibilityState = "hidden";
  documentEvents.visibilitychange();
  await Promise.resolve();
  assert.equal(updates, 1, "backgrounding does not start a check");
  document.visibilityState = "visible";
  documentEvents.visibilitychange();
  await new Promise(setImmediate);
  assert.equal(updates, 2, "resuming checks again");
  workerEvents.controllerchange[0]();
  timers[0]();
  assert.equal(reloads, 1, "new controller refreshes page even without worker navigation");
  reg.waiting = null;
  await button.onclick();
  assert.equal(reloads, 2, "manual update with an already active worker reloads immediately");
  console.log("Update opening, resume, activation fallback, and manual reload checks passed.");
}

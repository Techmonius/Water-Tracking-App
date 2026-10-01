import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

export function testReporting() {
  const reports = [], data = new Map(), events = {};
  const state = {settings: {birthday: '1990-06-15'}, engagement: {}, plantProgress: {}};
  const sandbox = {
    console, Date, Intl, crypto: {randomUUID: () => 'stable-test-id'},
    navigator: {userAgent: 'Mozilla Windows', language: 'en-US'},
    localStorage: {getItem: k => data.get(k), setItem: (k,v) => data.set(k,v)},
    sessionStorage: {}, matchMedia: () => ({matches: true}),
    document: {addEventListener(){}, querySelector: () => ({id: 'homeView'})},
    fetch: (url, opts) => {reports.push(JSON.parse(opts.body)); return Promise.resolve({});},
    window: {
      addEventListener: (name,fn) => events[name] = fn,
      WT_V1_CONFIG: {appVersion:'1.9.6', telemetryInstallKey:'install'},
      WT_V1_DATE: {dayKey: () => '2026-10-01'},
      WT_V1_STORAGE: {load: () => state},
      WT_V1_HYDRATION: {createApi: () => ({totalFor: () => 24, goalFor: () => 120})},
      WT_V1_STATS: {calculate: () => ({lifetimeOz: 24})},
    }
  };
  vm.runInNewContext(fs.readFileSync('v1/js/telemetry.js','utf8'), sandbox);
  const T = sandbox.window.WT_V1_TELEMETRY;
  T.track('drink_logged', {source:'saved_cup',amountOz:24,date:'2026-09-30',cupName:'private cup name'});
  assert.equal(reports[0].data.featureDetail, 'Saved cup');
  assert.equal(reports[0].summary, 'Logged 24 oz using saved cup for 2026-09-30');
  assert.equal(reports[0].birthday, '1990-06-15');
  assert.equal(reports[0].data.cupName, undefined);
  assert.equal(reports[0].device, 'Windows');
  T.track('undo_used', {feature:'Undo last drink',summary:'Nothing to undo',outcome:'nothing_to_undo'});
  assert.equal(reports[1].data.outcome, 'nothing_to_undo');
  sandbox.localStorage.getItem = () => { throw Error('Storage unavailable'); };
  assert.doesNotThrow(() => T.track('drink_logged', {amountOz:8}));

  const storageContext = {window: {WT_V1_CONFIG: {defaultGoal:120, defaultWeekendGoal:100, maxGoal:400}}};
  vm.runInNewContext(fs.readFileSync('v1/js/storage.js','utf8'), storageContext);
  const settings = storageContext.window.WT_V1_STORAGE;
  assert.throws(() => settings.validateSettingsInput({birthday:''}), /required/);
  assert.throws(() => settings.validateSettingsInput({birthday:'2999-01-01'}), /valid birthday/);
  assert.throws(() => settings.validateSettingsInput({birthday:'2001-02-29'}), /valid birthday/);
  assert.equal(settings.validateSettingsInput({birthday:'2000-02-29'}).birthday, '2000-02-29');

  const backend = {};
  vm.createContext(backend);
  vm.runInContext(fs.readFileSync('backend/WaterTrackerBackend.gs','utf8'), backend);
  const described = backend.describe_(reports[0], reports[0].data);
  assert.equal(described.feature, 'Saved cup');
  assert.equal(described.summary, reports[0].summary);
  assert.equal(backend.describe_({event:'drink_logged'}, {amountOz:8}).feature, 'Water logging — source unspecified');
  assert.equal(backend.birthday_('2025-02-29'), '');
  assert.equal(backend.birthday_('02-29'), '02-29');
  assert.equal(backend.cell_('=HYPERLINK("bad")'), '\'=HYPERLINK("bad")');
  const rows = [];
  backend.PropertiesService = {getScriptProperties:()=>({getProperty:()=> 'sheet-test'})};
  backend.LockService = {getScriptLock:()=>({waitLock(){},releaseLock(){}})};
  backend.SpreadsheetApp = {flush(){},openById:()=>({getSheetByName:()=>({
    appendRow:r=>rows.push(r), getLastRow:()=>rows.length+1,
    getRange:()=>({setNumberFormat(){}})
  })})};
  backend.ContentService = {MimeType:{JSON:'json'},createTextOutput:s=>({setMimeType:()=>JSON.parse(s)})};
  assert.equal(backend.doPost({postData:{contents:JSON.stringify(reports[0])}}).ok,true);
  assert.equal(rows[0][4],24);assert.equal(rows[0][7],'1990-06-15');
  assert.equal(rows[0][9],'stable-test-id');
  assert.equal(backend.doPost({postData:{contents:'not JSON'}}).ok,false);
  assert.equal(rows.length,1);

  console.log('Reporting: specific sources, birthday, no cup names, failure isolation, backend compatibility passed.');
}

export function testBirthdayGate() {
  let birthday = '', failSave = false, sent = 0, refreshed = 0;
  const events = {};
  function element() { return {open:false, value:'', textContent:'', handlers:{},
    addEventListener(name,fn) {this.handlers[name]=fn;},
    showModal() {this.open=true;}, close() {this.open=false;this.handlers.close?.();},
    focus() {}, reportValidity() {return !!this.value;}}; }
  const ids = Object.fromEntries(['birthdayGate','requiredBirthday','birthdayGateError','birthdayGateForm','birthday'].map(k => [k,element()]));
  const S = {load:()=>({settings:{birthday}}),validBirthday:v=>/^\d{4}-\d{2}-\d{2}$/.test(v)?v:''};
  const context = {
    document:{getElementById:id=>ids[id],addEventListener(){},hidden:false},
    CustomEvent: class {constructor(type){this.type=type;}},
    window:{WT_V1_STORAGE:S,WT_V1_DATE:{dayKey:()=> '2026-10-01'},
      WT_V1_HYDRATION:{createApi:()=>({saveSettings({birthday:b}) {
        if(failSave)throw Error('Save failed');birthday=b; events['wt-data-changed']();
      }})}, WT_V1_TELEMETRY:{track(){sent++;}},
      addEventListener:(name,fn)=>events[name]=fn,
      dispatchEvent:()=>refreshed++}
  };
  vm.runInNewContext(fs.readFileSync('v1/js/birthday-prompt.js','utf8'),context);
  assert(ids.birthdayGate.open, 'missing birthday blocks the app');
  let prevented=false;ids.birthdayGate.handlers.cancel({preventDefault(){prevented=true;}});
  assert(prevented, 'Escape cannot bypass required birthday');
  ids.birthdayGate.close();assert(ids.birthdayGate.open, 'closing without birthday reopens gate');
  ids.requiredBirthday.value='1990-06-15';failSave=true;
  ids.birthdayGateForm.handlers.submit({preventDefault(){}});
  assert(ids.birthdayGate.open);assert.equal(sent,0);assert.match(ids.birthdayGateError.textContent,/Save failed/);
  failSave=false;ids.birthdayGateForm.handlers.submit({preventDefault(){}});
  assert(!ids.birthdayGate.open);assert.equal(sent,1);assert.equal(refreshed,1);
  events.pageshow();assert(!ids.birthdayGate.open, 'saved birthday is not requested again');
  birthday='';events['wt-data-changed']();assert(ids.birthdayGate.open, 'backup without birthday restores the gate');
  console.log('Birthday gate: required entry, cancellation, save failure, saved profile and import checks passed.');
}

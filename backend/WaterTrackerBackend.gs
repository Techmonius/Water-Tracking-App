/** Water Tracker backend — paste this entire file into the bound Apps Script.
 * Run setupWaterTracker() once, then update the EXISTING web-app deployment.
 * Preserves old Dashboard/events tabs as dated archives on first setup.
 * New reports are retained; counts start with this setup, excluding archives.
 */
const WT = {
  timezone: 'America/Chicago',
  headers: ['Timestamp', 'Event', 'Summary', 'Feature', 'Amount logged (oz)',
    'App version', 'Device', 'Birthday', 'Details', '_Installation ID', '_Received at'],
  schema: 'water-tracker-backend-v2'
};

function setupWaterTracker() {
  const lock = LockService.getScriptLock();
  lock.waitLock(30000);
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    if (!ss) throw new Error('Open this script from the backend spreadsheet: Extensions > Apps Script.');
    const props = PropertiesService.getScriptProperties();
    const key = WT.schema + ':' + ss.getId();
    if (!props.getProperty(key)) {
      const stamp = Utilities.formatDate(new Date(), WT.timezone, 'yyyyMMdd-HHmmss');
      ['Dashboard', 'events'].forEach(name => {
        const old = ss.getSheetByName(name);
        if (old) old.setName(name + ' archive ' + stamp);
      });
      const events = ss.insertSheet('events');
      events.getRange(1, 1, 1, WT.headers.length).setValues([WT.headers]);
      ss.insertSheet('Dashboard');
      props.setProperty(key, new Date().toISOString());
    }
    props.setProperty('WT_SPREADSHEET_ID', ss.getId());
    ss.setSpreadsheetTimeZone(WT.timezone);
    ss.setRecalculationInterval(SpreadsheetApp.RecalculationInterval.MINUTE);
    const events = ss.getSheetByName('events');
    if (!events || events.getRange(1, 1).getValue() !== 'Timestamp')
      throw new Error('Unexpected events structure. Restore the new events tab before continuing.');
    events.setFrozenRows(1);
    events.getRange(1, 1, 1, WT.headers.length)
      .setBackground('#183c43').setFontColor('#ffffff').setFontWeight('bold');
    events.setColumnWidth(1, 165);
    events.setColumnWidth(2, 170);
    events.setColumnWidth(3, 330);
    events.setColumnWidth(4, 230);
    events.setColumnWidths(5, 4, 135);
    events.setColumnWidth(9, 260);
    events.getRange('A2:A').setNumberFormat('yyyy-mm-dd hh:mm:ss');
    events.getRange('K2:K').setNumberFormat('yyyy-mm-dd hh:mm:ss');
    events.getRange('H2:H').setNumberFormat('@');
    events.hideColumns(10, 2);
    if (!events.getFilter()) events.getRange(1, 1, events.getMaxRows(), 9).createFilter();
    buildDashboard_(ss);
    ss.setActiveSheet(ss.getSheetByName('Dashboard'));
    ss.moveActiveSheet(1);
    SpreadsheetApp.flush();
  } finally { lock.releaseLock(); }
}

function buildDashboard_(ss) {
  const sh = ss.getSheetByName('Dashboard');
  sh.clear();
  sh.getRange('A1:B1').setValues([['WATER TRACKER', 'Live backend dashboard']]);
  sh.getRange('A3:A11').setValues([
    ['Last event received'], ['Stored events'], ['Unique installations'],
    ['Events today'], ['Active installations today'], ['Active installations — last 7 days'],
    ['Reports missing birthday'], ['Tracking started'], ['Time zone']
  ]);
  sh.getRange('B3:B9').setFormulas([
    ['=IF(COUNT(events!K2:K)=0,"No events yet",MAX(events!K2:K))'],
    ['=COUNTA(events!B2:B)'],
    ['=IFERROR(COUNTUNIQUE(FILTER(events!J2:J,events!J2:J<>"")),0)'],
    ['=COUNTIFS(events!A2:A,">="&TODAY(),events!A2:A,"<"&TODAY()+1)'],
    ['=IFERROR(COUNTUNIQUE(FILTER(events!J2:J,events!J2:J<>"",events!A2:A>=TODAY(),events!A2:A<TODAY()+1)),0)'],
    ['=IFERROR(COUNTUNIQUE(FILTER(events!J2:J,events!J2:J<>"",events!A2:A>=TODAY()-6,events!A2:A<TODAY()+1)),0)'],
    ['=COUNTIFS(events!B2:B,"<>",events!H2:H,"")']
  ]);
  sh.getRange('B3').setNumberFormat('yyyy-mm-dd hh:mm:ss');
  sh.getRange('B10').setValue(new Date(PropertiesService.getScriptProperties()
    .getProperty(WT.schema + ':' + ss.getId()))).setNumberFormat('yyyy-mm-dd hh:mm:ss');
  sh.getRange('B11').setValue(WT.timezone);
  sh.getRange('A13').setValue('Counts cover the new events tab only. Archived rows are preserved but excluded.');
  sh.getRange('A14').setValue('Unique installations are devices/browser profiles, not verified individual people.');
  sh.getRange('A15').setValue('All new events are retained. Hidden IDs support counts; they are not access controls.');
  sh.getRange('A17').setFormula('=IFERROR(QUERY(events!B1:B,"select B, count(B) where B is not null group by B order by count(B) desc label B \'Event type\', count(B) \'Events\'",1),"No events yet")');
  sh.getRange('D17').setFormula('=IFERROR(QUERY(events!D1:D,"select D, count(D) where D is not null group by D order by count(D) desc label D \'Feature used\', count(D) \'Events\'",1),"No events yet")');
  sh.getRange('G17').setFormula('=IFERROR(QUERY(events!F1:F,"select F, count(F) where F is not null group by F order by count(F) desc label F \'App version\', count(F) \'Reports\'",1),"No events yet")');
  sh.setColumnWidth(1, 320); sh.setColumnWidth(2, 210);
  sh.setColumnWidth(4, 280); sh.setColumnWidth(5, 100);
  sh.setColumnWidth(7, 150); sh.setColumnWidth(8, 100);
  sh.setFrozenRows(1);
  ['A1:H1', 'A17:B17', 'D17:E17', 'G17:H17'].forEach(r =>
    sh.getRange(r).setBackground('#183c43').setFontColor('#ffffff').setFontWeight('bold'));
  sh.getRange('A3:A11').setFontWeight('bold');
}

function doGet() {
  return json_({ok: true, service: 'Water Tracker', schema: WT.schema});
}

function doPost(e) {
  const body = e && e.postData && e.postData.contents;
  if (!body || body.length > 32000) return json_({ok: false, error: 'Invalid report'});
  let p;
  try { p = JSON.parse(body); } catch (_) { return json_({ok: false, error: 'Invalid JSON'}); }
  if (!p || typeof p !== 'object' || typeof p.event !== 'string' ||
      !/^[a-z][a-z0-9_]{0,79}$/.test(p.event)) return json_({ok: false, error: 'Invalid event'});
  const id = PropertiesService.getScriptProperties().getProperty('WT_SPREADSHEET_ID');
  if (!id) throw new Error('Run setupWaterTracker() before deploying.');
  const lock = LockService.getScriptLock();
  lock.waitLock(30000);
  try {
    const ss = SpreadsheetApp.openById(id);
    const sh = ss.getSheetByName('events');
    const received = new Date();
    let at = new Date(p.timestamp);
    if (!p.timestamp || !Number.isFinite(at.getTime()) || at.getTime() > received.getTime() + 300000)
      at = received;
    const d = p.data && typeof p.data === 'object' ? p.data : {};
    const info = describe_(p, d);
    const rawAmount = d.amountOz;
    const amount = p.event === 'drink_logged' && rawAmount !== '' && rawAmount != null &&
      Number.isFinite(Number(rawAmount)) && Number(rawAmount) > 0 ? Number(rawAmount) : '';
    const birthday = birthday_(p.birthday || d.birthday);
    const row = [at, p.event, info.summary, info.feature, amount,
      p.version || p.appVersion || '', p.device || 'Unknown', birthday, info.details,
      p.installId || '', received].map(cell_);
    sh.appendRow(row);
    const n = sh.getLastRow();
    sh.getRange(n, 1).setNumberFormat('yyyy-mm-dd hh:mm:ss');
    sh.getRange(n, 8).setNumberFormat('@');
    sh.getRange(n, 11).setNumberFormat('yyyy-mm-dd hh:mm:ss');
    SpreadsheetApp.flush();
    return json_({ok: true});
  } finally { lock.releaseLock(); }
}

function describe_(p, d) {
  const event = p.event;
  let feature = d.feature || 'Unspecified';
  let summary = event.replace(/_/g, ' ');
  const details = [];
  if (event === 'drink_logged') {
    const past = d.mode === 'previous_day';
    const sources = {quick_add: 'Quick-add button', custom: 'Custom amount',
      saved_cup: 'Saved cup', previous_day: 'Previous-day entry'};
    feature = sources[d.source] || (past ? 'Previous-day logging' : 'Water logging — source unspecified');
    summary = 'Logged ' + (Number(d.amountOz) || '?') + ' oz' + (past ? ' for a previous day' : ' for today');
    if (sources[d.source]) summary += ' using ' + sources[d.source].toLowerCase();
  } else if (event === 'app_opened') {
    feature = p.standalone ? 'App launch — home screen' : 'App launch — browser';
    summary = p.standalone ? 'Opened the installed app' : 'Opened the app in a browser';
  } else if (event === 'undo_used') {
    feature = 'Undo'; summary = 'Used Undo (older apps do not report whether a drink was removed)';
  } else if (event === 'profile_updated') {
    feature = 'Settings / birthday — legacy combined event'; summary = 'Saved settings or birthday';
  } else if (event === 'goal_celebration') {
    feature = 'Daily goal celebration'; summary = 'Triggered a goal celebration';
  } else if (event === 'developer_info_opened') {
    feature = 'Developer information'; summary = 'Opened developer information';
  }
  // Newer clients can provide precise labels. Never infer missing historical detail.
  if (typeof d.summary === 'string' && d.summary.trim()) summary = d.summary;
  if (typeof d.featureDetail === 'string' && d.featureDetail.trim()) feature = d.featureDetail;
  if (typeof d.date === 'string') details.push('Log date: ' + d.date);
  if (typeof d.action === 'string') details.push('Action: ' + d.action);
  if (typeof d.outcome === 'string') details.push('Result: ' + d.outcome);
  if (typeof p.timezone === 'string') details.push('User time zone: ' + p.timezone);
  return {feature: feature, summary: summary, details: details.join(' · ')};
}

function birthday_(value) {
  const s = typeof value === 'string' ? value : '';
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) {
    const d = new Date(s + 'T00:00:00Z');
    return Number.isFinite(d.getTime()) && d.toISOString().slice(0, 10) === s ? s : '';
  }
  if (/^\d{2}-\d{2}$/.test(s)) {
    const d = new Date('2000-' + s + 'T00:00:00Z');
    return Number.isFinite(d.getTime()) && d.toISOString().slice(5, 10) === s ? s : '';
  }
  return '';
}

function cell_(v) {
  if (v instanceof Date || typeof v === 'number') return v;
  const s = String(v == null ? '' : v).slice(0, 1000);
  return /^[\s]*[=+@-]/.test(s) ? "'" + s : s;
}
function json_(value) {
  return ContentService.createTextOutput(JSON.stringify(value)).setMimeType(ContentService.MimeType.JSON);
}

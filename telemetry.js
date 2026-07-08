const TELEMETRY = {
  endpoint: 'https://script.google.com/macros/s/AKfycbykCIKxRnB_gQC0IOHrl3X5wSfAdC6chsxeJQSlO1wsd762PlF_oWEvt5JDjH1xGIZb-A/exec',
  enabled: true,
  installKey: 'waterTracker_installId',
  sessionKey: 'waterTracker_sessionId'
};

const EVENT_LABELS = {
  app_opened: 'App opened',
  drink_logged: 'Drink logged',
  cup_logged: 'Saved cup logged',
  settings_opened: 'Settings opened',
  add_cup_opened: 'Add cup opened',
  undo_used: 'Undo used',
  timeline_toggled: 'Timeline toggled',
  custom_amount_added: 'Custom amount added',
  cup_saved: 'Cup saved',
  cup_deleted: 'Cup deleted',
  settings_saved: 'Settings saved',
  edit_cups_toggled: 'Edit cups toggled',
  restore_today_used: 'Restore today used',
  reset_today_used: 'Reset today used',
  clear_all_data_clicked: 'Clear all data clicked',
  export_used: 'Export used',
  import_used: 'Import used',
  update_clicked: 'Update clicked',
  previous_day_add_opened: 'Previous day add opened',
  previous_day_reset_clicked: 'Previous day reset clicked',
  previous_day_entry_delete_clicked: 'Previous day entry delete clicked',
  error: 'Error'
};

function telemetryInstallId() {
  let id = localStorage.getItem(TELEMETRY.installKey);
  if (!id) {
    id = uid();
    localStorage.setItem(TELEMETRY.installKey, id);
  }
  return id;
}

function telemetrySessionId() {
  let id = sessionStorage.getItem(TELEMETRY.sessionKey);
  if (!id) {
    id = uid();
    sessionStorage.setItem(TELEMETRY.sessionKey, id);
  }
  return id;
}

function deviceKind() {
  const ua = navigator.userAgent || '';
  if (/iPhone|iPad|iPod/i.test(ua)) return 'iOS';
  if (/Android/i.test(ua)) return 'Android';
  return 'Other';
}

function telemetrySummary(eventName, data = {}) {
  const label = EVENT_LABELS[eventName] || eventName.replaceAll('_', ' ');
  const useful = Object.entries(data)
    .filter(([, value]) => value !== undefined && value !== null && value !== '')
    .map(([key, value]) => `${key}: ${String(value).slice(0, 60)}`)
    .join(', ');
  return useful ? `${label} — ${useful}` : label;
}

function trackEvent(eventName, data = {}) {
  if (!TELEMETRY.enabled || !TELEMETRY.endpoint) return;
  const now = new Date();
  const payload = {
    event: eventName,
    label: EVENT_LABELS[eventName] || eventName.replaceAll('_', ' '),
    summary: telemetrySummary(eventName, data),
    data,
    installId: telemetryInstallId(),
    sessionId: telemetrySessionId(),
    version: window.WATER_TRACKER_BUILD?.version || 'unknown',
    device: deviceKind(),
    screen: `${window.innerWidth}x${window.innerHeight}`,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || '',
    standalone: Boolean(window.matchMedia && window.matchMedia('(display-mode: standalone)').matches),
    localDate: now.toLocaleDateString(),
    localTime: now.toLocaleTimeString(),
    timestamp: now.toISOString()
  };
  try {
    fetch(TELEMETRY.endpoint, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(payload),
      keepalive: true
    }).catch(() => undefined);
  } catch {}
}

function trackError(error, context = '') {
  trackEvent('error', {
    context,
    message: String(error?.message || error || 'unknown'),
    stack: String(error?.stack || '').slice(0, 500)
  });
}

window.addEventListener('error', event => trackError(event.error || event.message, 'window_error'));
window.addEventListener('unhandledrejection', event => trackError(event.reason, 'unhandled_rejection'));

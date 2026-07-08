const TELEMETRY = {
  endpoint: 'https://script.google.com/macros/s/AKfycbykCIKxRnB_gQC0IOHrl3X5wSfAdC6chsxeJQSlO1wsd762PlF_oWEvt5JDjH1xGIZb-A/exec',
  enabled: true,
  installKey: 'waterTracker_installId',
  sessionKey: 'waterTracker_sessionId'
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

function trackEvent(eventName, data = {}) {
  if (!TELEMETRY.enabled || !TELEMETRY.endpoint) return;
  const payload = {
    event: eventName,
    data,
    installId: telemetryInstallId(),
    sessionId: telemetrySessionId(),
    version: window.WATER_TRACKER_BUILD?.version || 'unknown',
    device: deviceKind(),
    screen: `${window.innerWidth}x${window.innerHeight}`,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || '',
    timestamp: new Date().toISOString()
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

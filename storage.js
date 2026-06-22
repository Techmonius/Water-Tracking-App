const defaultState = {
  goal: window.WATER_TRACKER_BUILD.defaultGoal,
  weekdayGoal: window.WATER_TRACKER_BUILD.defaultGoal,
  weekendGoal: 100,
  goalMode: 'daily',
  theme: 'system',
  cups: [
    { id: 'owala', name: 'Owala', oz: 24 },
    { id: 'mug', name: 'Mug', oz: 12 },
    { id: 'stanley', name: 'Stanley', oz: 40 }
  ],
  days: {},
  backups: {}
};

function uid() {
  if (window.crypto && crypto.randomUUID) return crypto.randomUUID();
  return String(Date.now() + Math.random());
}

function deepClone(value) {
  return JSON.parse(JSON.stringify(value));
}

function loadState() {
  try {
    const raw = localStorage.getItem(window.WATER_TRACKER_BUILD.storageKey);
    const parsed = raw ? JSON.parse(raw) : {};
    const state = {
      ...deepClone(defaultState),
      ...parsed,
      cups: Array.isArray(parsed.cups) && parsed.cups.length ? parsed.cups : deepClone(defaultState.cups),
      days: parsed.days || {},
      backups: parsed.backups || {}
    };
    state.cups = state.cups.map(cup => ({ ...cup, id: cup.id || uid() }));
    return state;
  } catch {
    return deepClone(defaultState);
  }
}

function saveState(state) {
  localStorage.setItem(window.WATER_TRACKER_BUILD.storageKey, JSON.stringify(state));
}

function exportState(state) {
  const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = 'water-tracker-backup.json';
  link.click();
  URL.revokeObjectURL(link.href);
}

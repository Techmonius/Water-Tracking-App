const build = window.WATER_TRACKER_BUILD;
let state = loadState();
let editingCupId = null;
let editingCups = false;
let timelineOpen = false;
let selectedDayKey = null;
let modalScrollY = 0;

function goalFor(key = dayKey()) {
  if (state.goalMode === 'weekdayWeekend') {
    const day = dateFromKey(key).getDay();
    return day === 0 || day === 6 ? Number(state.weekendGoal || state.goal) : Number(state.weekdayGoal || state.goal);
  }
  return Number(state.goal || build.defaultGoal);
}

function ensureDay(key = dayKey()) {
  if (!state.days[key]) state.days[key] = { drinks: [] };
  return state.days[key];
}

function drinksFor(key = dayKey()) {
  return state.days[key]?.drinks || [];
}

function totalFor(key = dayKey()) {
  return drinksFor(key).reduce((sum, drink) => sum + Number(drink.oz || 0), 0);
}

function isoForDay(key) {
  const [year, month, day] = key.split('-').map(Number);
  const now = new Date();
  return new Date(year, month - 1, day, now.getHours(), now.getMinutes(), now.getSeconds()).toISOString();
}

function backupDay(key = dayKey()) {
  state.backups = state.backups || {};
  state.backups[key] = deepClone(ensureDay(key));
  const keys = Object.keys(state.backups).sort();
  while (keys.length > 30) delete state.backups[keys.shift()];
}

function addDrink(oz, label = 'Quick add', key = dayKey()) {
  oz = Number(oz);
  if (!oz || oz < 1) return;
  const before = totalFor(key);
  const goal = goalFor(key);
  ensureDay(key).drinks.push({ id: uid(), oz, label, at: key === dayKey() ? new Date().toISOString() : isoForDay(key) });
  backupDay(key);
  saveState(state);
  render();
  if (key === dayKey()) animateWater();
  navigator.vibrate?.(20);
  const after = totalFor(key);
  if (key === dayKey() && before < goal && after >= goal) {
    toast(`Goal hit: ${after} oz`);
    celebrateGoal();
  } else {
    toast(key === dayKey() ? `Added ${oz} oz` : `Added ${oz} oz to that day`);
  }
}

function undoDrink() {
  const removed = ensureDay().drinks.pop();
  if (!removed) return;
  backupDay();
  saveState(state);
  render();
  toast(`Undid ${removed.oz} oz`);
}

function resetToday() {
  if (!confirm('Reset today to 0 oz? This only clears today on this device.')) return;
  backupDay();
  state.days[dayKey()] = { drinks: [] };
  saveState(state);
  render();
  toast('Today reset');
}

function resetDay(key) {
  if (!confirm('Reset this day to 0 oz?')) return;
  backupDay(key);
  state.days[key] = { drinks: [] };
  saveState(state);
  render();
  openDayDialog(key);
  toast('Day reset');
}

function restoreToday() {
  const key = dayKey();
  const backup = state.backups?.[key];
  if (!backup) {
    toast('No backup for today');
    return;
  }
  if (!confirm('Restore today from local backup? This replaces today’s current log.')) return;
  state.days[key] = deepClone(backup);
  saveState(state);
  render();
  toast('Today restored');
}

function clearAllData() {
  if (!confirm('Clear ALL water tracker data on this device? This deletes logs, cups, goals, backups, and settings.')) return;
  if (!confirm('Last chance: this cannot be undone unless you exported a backup. Clear everything?')) return;
  localStorage.removeItem(build.storageKey);
  location.reload();
}

function deleteDrinkFromDay(key, id) {
  const day = state.days[key];
  if (!day) return;
  if (!confirm('Delete this drink entry?')) return;
  backupDay(key);
  day.drinks = day.drinks.filter(drink => drink.id !== id);
  saveState(state);
  render();
  openDayDialog(key);
  toast('Entry deleted');
}

function streaks() {
  let current = 0;
  let best = 0;
  let run = 0;
  for (let i = 365; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = dayKey(d);
    const met = totalFor(key) >= goalFor(key);
    run = met ? run + 1 : 0;
    best = Math.max(best, run);
  }
  for (let i = 0; i < 365; i++) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = dayKey(d);
    if (totalFor(key) >= goalFor(key)) current++; else break;
  }
  return { current, best };
}

function render() {
  ensureDay();
  const goal = goalFor();
  const total = totalFor();
  const percentRaw = goal ? (total / goal) * 100 : 0;
  const percent = Math.min(100, Math.round(percentRaw));
  $('todayTotal').textContent = total;
  $('todayGoal').textContent = goal;
  $('statusText').textContent = `${Math.round(percentRaw)}% complete`;
  $('water').style.height = `${percent}%`;
  const s = streaks();
  $('currentStreak').textContent = s.current;
  $('bestStreak').textContent = s.best;
  $('goalModeLabel').textContent = state.goalMode === 'weekdayWeekend' ? 'Split' : 'Daily';
  $('versionText').textContent = `Version ${build.version} · local-only`;
  renderQuickButtons();
  renderCups();
  renderUndo();
  renderHistory();
  renderTimeline();
  hideUpdateBanner();
}

function renderQuickButtons() {
  const box = $('quickButtons');
  box.innerHTML = '';
  build.quickAmounts.forEach(oz => {
    const button = document.createElement('button');
    button.className = 'add';
    button.type = 'button';
    button.textContent = `+${oz}`;
    button.onclick = () => addDrink(oz);
    box.appendChild(button);
  });
  const custom = document.createElement('button');
  custom.className = 'add custom';
  custom.type = 'button';
  custom.textContent = '+ Custom';
  custom.onclick = openAmountDialog;
  box.appendChild(custom);
}

function renderCups() {
  const box = $('cupButtons');
  box.innerHTML = '';
  state.cups.forEach(cup => {
    const button = document.createElement('button');
    button.className = `cup${editingCups ? ' editmode' : ''}`;
    button.type = 'button';
    button.innerHTML = `${editingCups ? '✎ ' : ''}+${escapeHtml(cup.oz)}<span>${escapeHtml(cup.name)}</span>`;
    button.onclick = () => editingCups ? openCupDialog(cup.id) : addDrink(cup.oz, cup.name);
    box.appendChild(button);
  });
}

function renderUndo() {
  const last = ensureDay().drinks.at(-1);
  const button = $('undoButton');
  button.disabled = !last;
  button.textContent = last ? `↶ Undo +${last.oz} oz` : '↶ Undo last drink';
}

function renderHistory() {
  const box = $('historyGrid');
  box.innerHTML = '';
  let sum = 0;
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = dayKey(d);
    const oz = totalFor(key);
    const goal = goalFor(key);
    const percent = goal ? Math.round((oz / goal) * 100) : 0;
    sum += oz;
    const day = document.createElement('button');
    day.className = `day${oz >= goal ? ' met' : percent >= 80 ? ' close' : ''}${key === dayKey() ? ' today' : ''}`;
    day.type = 'button';
    day.innerHTML = `<div><div class="dow">${d.toLocaleDateString(undefined, { weekday: 'short' })}</div><div class="oz">${oz}</div><div class="pct">${percent}%</div></div>`;
    day.onclick = () => openDayDialog(key);
    box.appendChild(day);
  }
  $('weeklyAverage').textContent = `Avg ${Math.round(sum / 7)} oz`;
}

function renderTimeline() {
  const box = $('timeline');
  const button = $('toggleTimelineButton');
  box.className = `timeline${timelineOpen ? ' show' : ''}`;
  button.textContent = timelineOpen ? 'Hide' : 'Show';
  box.innerHTML = '';
  const list = [...drinksFor()].reverse();
  if (!list.length) {
    box.innerHTML = '<div class="drink">No drinks logged yet</div>';
    return;
  }
  list.forEach(drink => box.appendChild(drinkRow(drink)));
}

function drinkRow(drink, options = {}) {
  const row = document.createElement('div');
  row.className = 'drink';
  row.innerHTML = `<span>${formatTime(drink.at)} · ${escapeHtml(drink.label || 'Drink')}</span><strong>+${escapeHtml(drink.oz)} oz</strong>`;
  if (options.deleteKey && drink.id) {
    const del = document.createElement('button');
    del.className = 'ghost danger';
    del.type = 'button';
    del.textContent = 'Delete';
    del.style.flex = '0 0 auto';
    del.onclick = () => deleteDrinkFromDay(options.deleteKey, drink.id);
    row.appendChild(del);
  }
  return row;
}

function openAmountDialog() {
  $('amountInput').value = '';
  showDialog('amountDialog');
  setTimeout(() => $('amountInput').focus(), 50);
}

function saveAmount(event) {
  event.preventDefault();
  const oz = Number($('amountInput').value);
  if (!oz || oz < 1) {
    alert('Enter a valid ounce amount.');
    return;
  }
  closeDialog('amountDialog');
  addDrink(oz, 'Custom amount');
}

function openCupDialog(id = null) {
  editingCupId = id;
  const cup = state.cups.find(c => c.id === id);
  $('cupDialogTitle').textContent = cup ? 'Edit Cup' : 'Add Cup';
  $('cupNameInput').value = cup?.name || '';
  $('cupOzInput').value = cup?.oz || '';
  $('deleteCupButton').hidden = !cup;
  showDialog('cupDialog');
  setTimeout(() => $('cupNameInput').focus(), 50);
}

function saveCup(event) {
  event.preventDefault();
  const name = $('cupNameInput').value.trim();
  const oz = Number($('cupOzInput').value);
  if (!name || !oz || oz < 1) {
    alert('Enter a cup name and valid ounce amount.');
    return;
  }
  if (editingCupId) {
    const cup = state.cups.find(c => c.id === editingCupId);
    if (cup) Object.assign(cup, { name, oz });
    toast('Cup updated');
  } else {
    state.cups.push({ id: uid(), name, oz });
    toast('Cup added');
  }
  saveState(state);
  closeDialog('cupDialog');
  render();
}

function deleteCup() {
  const cup = state.cups.find(c => c.id === editingCupId);
  if (!cup) return;
  if (!confirm(`Delete ${cup.name}?`)) return;
  state.cups = state.cups.filter(c => c.id !== editingCupId);
  saveState(state);
  closeDialog('cupDialog');
  render();
  toast('Cup deleted');
}

function openSettings() {
  $('dailyGoalInput').value = state.goal;
  $('weekdayGoalInput').value = state.weekdayGoal || state.goal;
  $('weekendGoalInput').value = state.weekendGoal || state.goal;
  $('goalModeInput').value = state.goalMode || 'daily';
  $('themeInput').value = state.theme || 'system';
  $('versionText').textContent = `Version ${build.version} · local-only`;
  showDialog('settingsDialog');
}

function saveSettings(event) {
  event.preventDefault();
  const goal = Number($('dailyGoalInput').value);
  const weekdayGoal = Number($('weekdayGoalInput').value);
  const weekendGoal = Number($('weekendGoalInput').value);
  if (!goal || !weekdayGoal || !weekendGoal) {
    alert('Enter valid goals.');
    return;
  }
  Object.assign(state, {
    goal,
    weekdayGoal,
    weekendGoal,
    goalMode: $('goalModeInput').value,
    theme: $('themeInput').value
  });
  saveState(state);
  applyTheme(state.theme);
  closeDialog('settingsDialog');
  render();
  toast('Settings saved');
}

function openDayDialog(key) {
  selectedDayKey = key;
  const date = dateFromKey(key);
  const oz = totalFor(key);
  const goal = goalFor(key);
  $('dayTitle').textContent = `${date.toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })} · ${oz}/${goal} oz`;
  const box = $('dayDetails');
  box.innerHTML = '';
  const actions = document.createElement('div');
  actions.className = 'actions';
  const add = document.createElement('button');
  add.className = 'primary';
  add.type = 'button';
  add.textContent = '+ Drink to this day';
  add.onclick = () => addDrinkToSelectedDay(key);
  const reset = document.createElement('button');
  reset.className = 'ghost danger';
  reset.type = 'button';
  reset.textContent = 'Reset Day';
  reset.onclick = () => resetDay(key);
  actions.appendChild(add);
  actions.appendChild(reset);
  box.appendChild(actions);
  const list = [...drinksFor(key)].reverse();
  if (!list.length) box.insertAdjacentHTML('beforeend', '<div class="drink">No drinks logged</div>');
  list.forEach(drink => box.appendChild(drinkRow(drink, { deleteKey: key })));
  showDialog('dayDialog');
}

function addDrinkToSelectedDay(key) {
  const raw = prompt('Ounces to add to this day:');
  const oz = Number(raw);
  if (!oz || oz < 1) return;
  addDrink(oz, 'Manual edit', key);
  openDayDialog(key);
}

async function checkForUpdate() {
  hideUpdateBanner();
  try {
    const response = await fetch(`version.txt?check=${Date.now()}`, { cache: 'no-store' });
    const remote = (await response.text()).trim();
    if (remote && remote !== build.version) showUpdateBanner();
  } catch {
    hideUpdateBanner();
  }
}

async function updateApp() {
  hideUpdateBanner();
  $('updateNow').textContent = 'Updating...';
  try {
    if ('serviceWorker' in navigator) {
      const regs = await navigator.serviceWorker.getRegistrations();
      await Promise.all(regs.map(reg => reg.update().catch(() => undefined)));
    }
    if ('caches' in window) {
      const keys = await caches.keys();
      await Promise.all(keys.map(key => caches.delete(key)));
    }
  } catch {}
  const url = new URL(window.location.href);
  url.searchParams.set('refresh', Date.now());
  window.location.replace(url.toString());
}

function importState() {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = 'application/json';
  input.onchange = () => {
    const file = input.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const imported = JSON.parse(reader.result);
        if (!imported.days) throw new Error('Invalid backup');
        state = { ...deepClone(defaultState), ...imported };
        saveState(state);
        render();
        toast('Data imported');
      } catch {
        alert('That backup file was not valid.');
      }
    };
    reader.readAsText(file);
  };
  input.click();
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));
}

function showDialog(id) {
  lockPageScroll();
  $(id).showModal();
}

function closeDialog(id) {
  const dialog = $(id);
  if (dialog && dialog.open) dialog.close();
  unlockPageScrollIfReady();
}

function lockPageScroll() {
  if (document.body.dataset.locked === 'true') return;
  modalScrollY = window.scrollY || 0;
  document.body.dataset.locked = 'true';
  document.body.style.position = 'fixed';
  document.body.style.top = `-${modalScrollY}px`;
  document.body.style.left = '0';
  document.body.style.right = '0';
  document.body.style.width = '100%';
}

function unlockPageScrollIfReady() {
  setTimeout(() => {
    if (document.querySelector('dialog[open]')) return;
    document.body.dataset.locked = 'false';
    document.body.style.position = '';
    document.body.style.top = '';
    document.body.style.left = '';
    document.body.style.right = '';
    document.body.style.width = '';
    window.scrollTo(0, modalScrollY);
  }, 0);
}

function preventZoomGestures() {
  document.addEventListener('gesturestart', event => event.preventDefault());
  document.addEventListener('dblclick', event => event.preventDefault(), { passive: false });
}

function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('service-worker.js').then(reg => reg.update()).catch(() => undefined);
    });
  }
}

function wireEvents() {
  $('updateNow').onclick = updateApp;
  $('settingsButton').onclick = openSettings;
  $('addCupButton').onclick = () => openCupDialog();
  $('undoButton').onclick = undoDrink;
  $('toggleTimelineButton').onclick = () => { timelineOpen = !timelineOpen; renderTimeline(); };
  $('saveAmountButton').onclick = saveAmount;
  $('saveCupButton').onclick = saveCup;
  $('deleteCupButton').onclick = deleteCup;
  $('saveSettingsButton').onclick = saveSettings;
  $('editCupsButton').onclick = () => {
    editingCups = !editingCups;
    closeDialog('settingsDialog');
    render();
    toast(editingCups ? 'Cup edit mode on. Tap a cup to edit it; open Settings > Edit Cups again to turn it off.' : 'Cup edit mode off', 3800);
  };
  $('restoreTodayButton').onclick = restoreToday;
  $('resetTodayButton').onclick = resetToday;
  $('clearAllDataButton').onclick = clearAllData;
  $('exportDataButton').onclick = () => exportState(state);
  $('importDataButton').onclick = importState;
  document.querySelectorAll('[data-close-dialog]').forEach(button => {
    button.addEventListener('click', () => closeDialog(button.dataset.closeDialog));
  });
  document.querySelectorAll('dialog').forEach(dialog => dialog.addEventListener('close', unlockPageScrollIfReady));
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => applyTheme(state.theme));
}

preventZoomGestures();
wireEvents();
registerServiceWorker();
applyTheme(state.theme);
render();
checkForUpdate();
setInterval(checkForUpdate, 5 * 60 * 1000);

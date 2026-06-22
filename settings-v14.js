(function(){
  const build = window.WATER_TRACKER_BUILD;

  window.toast = function(message, duration = 2600) {
    const box = document.getElementById('toast');
    if (!box) return;
    box.textContent = message;
    box.classList.add('show');
    clearTimeout(window.__waterToastTimer);
    window.__waterToastTimer = setTimeout(() => box.classList.remove('show'), duration);
  };

  function addClearAllButton() {
    if (document.getElementById('clearAllDataButton')) return;
    const exportButton = document.getElementById('exportDataButton');
    if (!exportButton || !exportButton.parentElement) return;
    const button = document.createElement('button');
    button.className = 'ghost danger';
    button.id = 'clearAllDataButton';
    button.type = 'button';
    button.textContent = 'Clear All Data';
    button.onclick = function(event) {
      event.preventDefault();
      const first = confirm('Clear ALL water tracker data on this device? This deletes logs, cups, goals, backups, and settings.');
      if (!first) return;
      const second = confirm('Last chance: this cannot be undone unless you exported a backup. Clear everything?');
      if (!second) return;
      localStorage.removeItem(build.storageKey);
      location.reload();
    };
    exportButton.parentElement.appendChild(button);
  }

  function makeEditMessageLonger() {
    const edit = document.getElementById('editCupsButton');
    if (!edit || edit.dataset.v14LongMessage) return;
    edit.dataset.v14LongMessage = 'true';
    edit.addEventListener('click', function() {
      setTimeout(() => window.toast('Cup edit mode toggled. Tap a cup to edit it; open Settings > Edit Cups again to turn it off.', 3800), 50);
    }, true);
  }

  function patchSettings() {
    addClearAllButton();
    makeEditMessageLonger();
    const version = document.getElementById('versionText');
    if (version) version.textContent = 'Version ' + build.version + ' · local-only';
  }

  patchSettings();
  document.getElementById('settingsButton')?.addEventListener('click', function(){
    setTimeout(patchSettings, 0);
    setTimeout(patchSettings, 150);
  }, true);
})();

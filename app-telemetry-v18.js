(function(){
  if (typeof trackEvent !== 'function') return;

  function safeTrack(name, data) {
    try { trackEvent(name, data || {}); } catch {}
  }

  function numberFromText(text) {
    const match = String(text || '').match(/\d+(?:\.\d+)?/);
    return match ? Number(match[0]) : '';
  }

  function featureForEvent(name) {
    if (name.includes('drink') || name.includes('cup_logged') || name.includes('custom_amount')) return 'Logging';
    if (name.includes('settings')) return 'Settings';
    if (name.includes('previous_day')) return 'Previous Day Editing';
    if (name.includes('export') || name.includes('import')) return 'Backup';
    if (name.includes('reset') || name.includes('restore') || name.includes('clear')) return 'Data Management';
    if (name.includes('undo')) return 'Correction';
    if (name.includes('error')) return 'Error';
    return 'General';
  }

  function withFeature(name, data) {
    return Object.assign({ feature: featureForEvent(name) }, data || {});
  }

  safeTrack('app_opened', withFeature('app_opened', {
    path: location.pathname,
    mode: window.matchMedia && window.matchMedia('(display-mode: standalone)').matches ? 'Home Screen' : 'Browser'
  }));

  document.addEventListener('click', function(event){
    const target = event.target.closest('button');
    if (!target) return;

    const text = target.textContent.trim();

    if (target.classList.contains('add')) {
      const amount = numberFromText(text);
      safeTrack('drink_logged', withFeature('drink_logged', {
        source: text,
        quickButton: text.startsWith('+') ? text : '',
        amountOz: amount,
        mode: 'quick_button'
      }));
      return;
    }

    if (target.classList.contains('cup')) {
      const amount = numberFromText(text);
      safeTrack('cup_logged', withFeature('cup_logged', {
        amountOz: amount,
        mode: target.classList.contains('editmode') ? 'cup_edit' : 'saved_cup'
      }));
      return;
    }

    const id = target.id || '';
    const map = {
      settingsButton: 'settings_opened',
      addCupButton: 'add_cup_opened',
      undoButton: 'undo_used',
      toggleTimelineButton: 'timeline_toggled',
      saveAmountButton: 'custom_amount_added',
      saveCupButton: 'cup_saved',
      deleteCupButton: 'cup_deleted',
      saveSettingsButton: 'settings_saved',
      editCupsButton: 'edit_cups_toggled',
      restoreTodayButton: 'restore_today_used',
      resetTodayButton: 'reset_today_used',
      clearAllDataButton: 'clear_all_data_clicked',
      exportDataButton: 'export_used',
      importDataButton: 'import_used',
      updateNow: 'update_clicked'
    };

    if (map[id]) {
      safeTrack(map[id], withFeature(map[id], { control: id }));
    }

    if (text.includes('Drink to this day')) {
      safeTrack('previous_day_add_opened', withFeature('previous_day_add_opened', { control: 'day_add' }));
    }
    if (text.includes('Reset Day')) {
      safeTrack('previous_day_reset_clicked', withFeature('previous_day_reset_clicked', { control: 'day_reset' }));
    }
    if (text === 'Delete') {
      safeTrack('previous_day_entry_delete_clicked', withFeature('previous_day_entry_delete_clicked', { control: 'day_entry_delete' }));
    }
  }, true);
})();

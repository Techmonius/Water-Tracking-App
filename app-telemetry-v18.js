(function(){
  if (typeof trackEvent !== 'function') return;

  function safeTrack(name, data) {
    try { trackEvent(name, data || {}); } catch {}
  }

  safeTrack('app_opened', {
    path: location.pathname,
    standalone: window.matchMedia && window.matchMedia('(display-mode: standalone)').matches
  });

  document.addEventListener('click', function(event){
    const target = event.target.closest('button');
    if (!target) return;

    if (target.classList.contains('add')) {
      safeTrack('drink_logged', { source: target.textContent.trim() });
      return;
    }

    if (target.classList.contains('cup')) {
      safeTrack('cup_logged', { editMode: target.classList.contains('editmode') });
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

    if (map[id]) safeTrack(map[id]);

    if (target.textContent && target.textContent.includes('Drink to this day')) {
      safeTrack('previous_day_add_opened');
    }
    if (target.textContent && target.textContent.includes('Reset Day')) {
      safeTrack('previous_day_reset_clicked');
    }
    if (target.textContent && target.textContent.trim() === 'Delete') {
      safeTrack('previous_day_entry_delete_clicked');
    }
  }, true);
})();

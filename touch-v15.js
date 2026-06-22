(function(){
  document.addEventListener('gesturestart', function(e){ e.preventDefault(); });
  document.addEventListener('dblclick', function(e){ e.preventDefault(); }, { passive:false });

  let scrollY = 0;
  function lockPage(){
    if(document.body.dataset.locked === 'true') return;
    scrollY = window.scrollY || 0;
    document.body.dataset.locked = 'true';
    document.body.style.position = 'fixed';
    document.body.style.top = '-' + scrollY + 'px';
    document.body.style.left = '0';
    document.body.style.right = '0';
    document.body.style.width = '100%';
  }
  function unlockPage(){
    if(document.querySelector('dialog[open]')) return;
    document.body.dataset.locked = 'false';
    document.body.style.position = '';
    document.body.style.top = '';
    document.body.style.left = '';
    document.body.style.right = '';
    document.body.style.width = '';
    window.scrollTo(0, scrollY);
  }
  function wireDialogs(){
    document.querySelectorAll('dialog').forEach(function(dialog){
      if(dialog.dataset.v15Wired) return;
      dialog.dataset.v15Wired = 'true';
      dialog.addEventListener('close', unlockPage);
    });
  }
  const nativeShowModal = HTMLDialogElement.prototype.showModal;
  HTMLDialogElement.prototype.showModal = function(){ lockPage(); return nativeShowModal.call(this); };
  wireDialogs();
})();

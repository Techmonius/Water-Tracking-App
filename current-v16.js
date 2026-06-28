(function(){
  function hide(){
    var b=document.getElementById('updateBanner');
    if(b){b.hidden=true;b.classList.remove('show');}
    var v=document.getElementById('versionText');
    if(v){v.textContent='Version 2026-06-22.16 · local-only';}
  }
  hide();
  setTimeout(hide,500);
  setTimeout(hide,1500);
  document.getElementById('settingsButton')?.addEventListener('click',function(){setTimeout(hide,100);},true);
})();

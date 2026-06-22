(function(){
  var LOCAL_VERSION='2026-06-22.11';
  var banner=document.getElementById('updateBanner');
  var button=document.getElementById('updateNow');
  var versionText=document.getElementById('versionText');

  function hide(){if(banner){banner.classList.remove('show');banner.style.display='none';}}
  function show(){if(banner){banner.style.display='flex';banner.classList.add('show');}}
  function newer(remote,local){return String(remote||'').trim()!==String(local||'').trim();}

  hide();
  if(versionText){versionText.textContent='Version '+LOCAL_VERSION+' · local-only';}

  fetch('version.txt?check='+Date.now(),{cache:'no-store'})
    .then(function(r){return r.text();})
    .then(function(remote){if(newer(remote,LOCAL_VERSION)){show();}else{hide();}})
    .catch(hide);

  if(button){
    button.addEventListener('click',function(e){
      e.preventDefault();
      hide();
      button.textContent='Updating...';
      var url=new URL(window.location.href);
      url.searchParams.set('refresh',Date.now());
      window.location.replace(url.toString());
    },true);
  }

  function keepWaveGoing(){
    var water=document.getElementById('water');
    if(!water)return;
    setTimeout(function(){water.classList.remove('slosh');},650);
  }
  var oldSlosh=window.slosh;
  window.slosh=function(){
    if(typeof oldSlosh==='function'){oldSlosh();}
    keepWaveGoing();
  };
})();

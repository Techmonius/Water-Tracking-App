(function(){
  var script=document.currentScript;
  var params=new URL(script.src).searchParams;
  var LOCAL_VERSION=params.get('v')||'unknown';
  var banner=document.getElementById('updateBanner');
  var button=document.getElementById('updateNow');
  var settings=document.getElementById('settings');

  function hide(){if(banner){banner.classList.remove('show');banner.style.display='none';}}
  function show(){if(banner){banner.style.display='flex';banner.classList.add('show');}}
  function setVersionText(){
    var versionText=document.getElementById('versionText');
    if(versionText){versionText.textContent='Version '+LOCAL_VERSION+' · local-only';}
  }

  hide();
  setVersionText();
  if(settings){settings.addEventListener('click',function(){setTimeout(setVersionText,0);setTimeout(setVersionText,100);},true);}

  fetch('version.txt?check='+Date.now(),{cache:'no-store'})
    .then(function(r){return r.text();})
    .then(function(remote){remote=String(remote||'').trim();if(remote&&remote!==LOCAL_VERSION){show();}else{hide();}})
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

  var oldSlosh=window.slosh;
  window.slosh=function(){
    if(typeof oldSlosh==='function'){oldSlosh();}
    var water=document.getElementById('water');
    if(water){setTimeout(function(){water.classList.remove('slosh');},650);}
  };
})();

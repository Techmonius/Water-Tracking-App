(function(){
  var script=document.currentScript;
  var localVersion=new URL(script.src).searchParams.get('v')||'unknown';
  var banner=document.getElementById('updateBanner');
  var updateButton=document.getElementById('updateNow');
  var settingsButton=document.getElementById('settings');

  function hideUpdate(){if(banner){banner.classList.remove('show');banner.style.display='none';}}
  function showUpdate(){if(banner){banner.style.display='flex';banner.classList.add('show');}}
  function setVersion(){var el=document.getElementById('versionText');if(el){el.textContent='Version '+localVersion+' · local-only';}}

  async function clearRuntimeCaches(){
    try{
      if('serviceWorker' in navigator){
        var regs=await navigator.serviceWorker.getRegistrations();
        await Promise.all(regs.map(function(r){return r.update().catch(function(){});}));
      }
      if('caches' in window){
        var keys=await caches.keys();
        await Promise.all(keys.map(function(k){return caches.delete(k);}));
      }
    }catch(e){}
  }

  async function checkVersion(){
    hideUpdate();
    try{
      var res=await fetch('version.txt?check='+Date.now(),{cache:'no-store'});
      var remote=(await res.text()).trim();
      if(remote && remote!==localVersion){showUpdate();}else{hideUpdate();}
    }catch(e){hideUpdate();}
  }

  function wireUpdateButton(){
    if(!updateButton)return;
    updateButton.addEventListener('click',async function(e){
      e.preventDefault();
      hideUpdate();
      updateButton.textContent='Updating...';
      await clearRuntimeCaches();
      var url=new URL(window.location.href);
      url.searchParams.set('refresh',Date.now());
      window.location.replace(url.toString());
    },true);
  }

  function addResetToday(){
    if(document.getElementById('resetToday'))return;
    var importButton=document.getElementById('importData');
    if(!importButton||!importButton.parentElement)return;
    var btn=document.createElement('button');
    btn.className='ghost';
    btn.id='resetToday';
    btn.type='button';
    btn.textContent='Reset Today';
    btn.addEventListener('click',function(e){
      e.preventDefault();
      if(!confirm('Reset today to 0 oz? This only clears today on this device.'))return;
      try{
        var raw=localStorage.getItem('waterTracker_v1');
        var data=raw?JSON.parse(raw):{};
        var d=new Date();
        var local=new Date(d.getTime()-d.getTimezoneOffset()*60000);
        var key=local.toISOString().slice(0,10);
        data.days=data.days||{};
        data.days[key]={drinks:[]};
        localStorage.setItem('waterTracker_v1',JSON.stringify(data));
        window.location.reload();
      }catch(err){alert('Could not reset today.');}
    });
    importButton.parentElement.appendChild(btn);
  }

  function keepWaveAlive(){
    var water=document.getElementById('water');
    if(!water)return;
    water.classList.remove('slosh');
  }

  var oldSlosh=window.slosh;
  window.slosh=function(){
    if(typeof oldSlosh==='function'){oldSlosh();}
    setTimeout(keepWaveAlive,650);
  };

  hideUpdate();
  setVersion();
  wireUpdateButton();
  checkVersion();
  setInterval(checkVersion,300000);
  if(settingsButton){settingsButton.addEventListener('click',function(){setTimeout(setVersion,0);setTimeout(addResetToday,0);setTimeout(setVersion,120);setTimeout(addResetToday,120);},true);}
})();

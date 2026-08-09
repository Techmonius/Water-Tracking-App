(function(){
  const $=id=>document.getElementById(id),D=window.WT_V1_DATE,S=window.WT_V1_STORAGE,H=window.WT_V1_HYDRATION,ST=window.WT_V1_STATS,C=window.WT_V1_CONFIG;
  let timelineOpen=false,editCups=false,scrollY=0;
  function loadApi(){return H.createApi(S.load(),()=>{});}
  function refreshDetails(){
    const api=loadApi(),state=api.getState(),stats=ST.calculate(api),today=D.dayKey(),drinks=api.drinksFor(today),last=drinks.at(-1);
    if($('currentStreak'))$('currentStreak').textContent=stats.currentStreak;
    if($('bestStreak'))$('bestStreak').textContent=stats.bestStreak;
    if($('goalModeLabel'))$('goalModeLabel').textContent=state.settings.goalMode==='weekdayWeekend'?'Split':'Daily';
    const undo=$('undoButton');if(undo){undo.disabled=!last;undo.textContent=last?'↶ Undo +'+last.oz+' oz':'↶ Undo last drink';}
    document.querySelectorAll('#cupButtons .cup').forEach(b=>b.classList.toggle('editmode',editCups));
    renderCupEditPrompt();
  }
  $('toggleTimelineButton').onclick=()=>{timelineOpen=!timelineOpen;$('timeline').classList.toggle('show',timelineOpen);$('toggleTimelineButton').textContent=timelineOpen?'Hide':'Show';};
  function cupsCard(){return document.getElementById('cupButtons')?.closest('.card');}
  function renderCupEditPrompt(){
    const card=cupsCard();if(!card)return;let prompt=card.querySelector('.cupEditPrompt');
    if(!editCups){prompt?.remove();return;}
    if(!prompt){prompt=document.createElement('div');prompt.className='cupEditPrompt';prompt.innerHTML='<span>Choose a cup to edit</span><button type="button" class="small" id="cancelCupEdit">Cancel</button>';card.insertBefore(prompt,document.getElementById('cupButtons'));prompt.querySelector('#cancelCupEdit').onclick=endCupEdit;}
  }
  function startCupEdit(){editCups=true;$('settingsDialog').close();refreshDetails();setTimeout(()=>cupsCard()?.scrollIntoView({behavior:'smooth',block:'center'}),80);}
  function endCupEdit(){if(!editCups)return;editCups=false;refreshDetails();}
  $('editCupsButton').onclick=startCupEdit;
  document.addEventListener('click',e=>{if(!editCups)return;const cup=e.target.closest('#cupButtons .cup');if(!cup)return;e.preventDefault();e.stopImmediatePropagation();cup.dispatchEvent(new MouseEvent('contextmenu',{bubbles:true,cancelable:true,view:window}));},true);
  const cupDialog=$('cupDialog');if(cupDialog){cupDialog.addEventListener('close',endCupEdit);cupDialog.addEventListener('cancel',endCupEdit);}
  function lock(){if(document.body.dataset.locked==='true')return;scrollY=window.scrollY||0;document.body.dataset.locked='true';Object.assign(document.body.style,{position:'fixed',top:'-'+scrollY+'px',left:'0',right:'0',width:'100%'});}
  function unlock(){setTimeout(()=>{if(document.querySelector('dialog[open]'))return;document.body.dataset.locked='false';Object.assign(document.body.style,{position:'',top:'',left:'',right:'',width:''});window.scrollTo(0,scrollY);},0);}
  document.querySelectorAll('dialog').forEach(d=>{d.addEventListener('toggle',()=>d.open?lock():unlock());d.addEventListener('close',unlock);});
  async function checkUpdate(){const banner=$('updateBanner');if(!banner)return;banner.hidden=true;try{const r=await fetch('v1-version.txt?check='+Date.now(),{cache:'no-store'});const latest=(await r.text()).trim();if(latest&&latest!==C.appVersion)banner.hidden=false;}catch{}}
  $('updateNow').onclick=async()=>{const b=$('updateNow');b.textContent='Updating...';try{if('serviceWorker'in navigator){const regs=await navigator.serviceWorker.getRegistrations();await Promise.all(regs.map(r=>r.update().catch(()=>{})));}if('caches'in window){const keys=await caches.keys();await Promise.all(keys.map(k=>caches.delete(k)));}}catch{}const u=new URL(location.href);u.searchParams.set('refresh',Date.now());location.replace(u.toString());};
  window.addEventListener('wt-data-changed',refreshDetails);window.addEventListener('storage',refreshDetails);
  document.addEventListener('dblclick',e=>e.preventDefault(),{passive:false});document.addEventListener('gesturestart',e=>e.preventDefault());
  refreshDetails();checkUpdate();setInterval(checkUpdate,5*60*1000);
})();
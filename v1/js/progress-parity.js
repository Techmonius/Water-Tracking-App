(function(){
  const S=window.WT_V1_STORAGE,H=window.WT_V1_HYDRATION,ST=window.WT_V1_STATS,E=window.WT_V1_ENGAGEMENT;
  let painting=false,queued=false;
  function render(){
    if(painting)return;painting=true;
    const api=H.createApi(S.load(),()=>{}),stats=ST.calculate(api),level=E.level(api),wins=E.todayWins(api);
    const summary=document.getElementById('progressSummary');
    if(summary)summary.textContent=Math.round(stats.lifetimeOz)+' lifetime oz · '+stats.goalDays+' goal days · best streak '+stats.bestStreak;
    const levelText=document.getElementById('levelText');if(levelText)levelText.textContent='Level '+level.level;
    const levelFill=document.getElementById('levelFill');if(levelFill)levelFill.style.width=Math.round(level.progress/level.next*100)+'%';
    const box=document.getElementById('todayWins');
    if(box)box.innerHTML=wins.map(w=>'<div class="winBadge '+(w.earned?'earned':'locked')+'"><span class="winBadgeIcon">'+w.icon+'</span><span class="winBadgeName">'+w.name+'</span><span class="winBadgeState">'+(w.earned?'✓ Earned':'Not yet')+'</span></div>').join('');
    painting=false;
  }
  function queue(){if(queued)return;queued=true;requestAnimationFrame(()=>{queued=false;render();});}
  const root=document.querySelector('main.app');if(root)new MutationObserver(()=>{if(!painting)queue();}).observe(root,{subtree:true,childList:true,characterData:true});
  window.addEventListener('storage',queue);window.addEventListener('wt-data-changed',queue);
  setTimeout(render,0);setTimeout(render,250);
})();
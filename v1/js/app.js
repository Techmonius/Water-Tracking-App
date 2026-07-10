(function(){
  const D=window.WT_V1_DATE;
  let state=window.WT_V1_STORAGE.load();
  const api=window.WT_V1_HYDRATION.createApi(state,()=>render());

  const $=id=>document.getElementById(id);
  function esc(v){return String(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}

  function render(){
    const today=D.dayKey();
    const total=api.totalFor(today),goal=api.goalFor(today),pct=Math.min(100,Math.round(total/goal*100));
    $('todayTotal').textContent=total;
    $('todayGoal').textContent=goal;
    $('progressFill').style.width=pct+'%';
    $('progressText').textContent=Math.round(total/goal*100)+'% complete';
    renderQuick();renderCups();renderHistory();renderTimeline();renderStats();
  }

  function renderQuick(){
    $('quickButtons').innerHTML='';
    [8,12,16,20,30].forEach(oz=>{
      const b=document.createElement('button');b.className='quick';b.textContent='+'+oz+' oz';b.onclick=()=>add(oz,'Quick add');$('quickButtons').appendChild(b);
    });
    const custom=document.createElement('button');custom.className='quick';custom.textContent='+ Custom';custom.onclick=()=>{const oz=Number(prompt('Ounces:'));if(oz)add(oz,'Custom amount');};$('quickButtons').appendChild(custom);
  }

  function renderCups(){
    $('cupButtons').innerHTML='';
    api.getState().cups.forEach(c=>{const b=document.createElement('button');b.className='cup';b.innerHTML='+'+esc(c.oz)+' oz<br><small>'+esc(c.name)+'</small>';b.onclick=()=>add(c.oz,c.name);$('cupButtons').appendChild(b);});
  }

  function renderHistory(){
    $('history').innerHTML='';
    for(let i=6;i>=0;i--){const d=new Date();d.setDate(d.getDate()-i);const k=D.dayKey(d),oz=api.totalFor(k),g=api.goalFor(k);const x=document.createElement('div');x.className='day'+(oz>=g?' met':'');x.innerHTML='<strong>'+d.toLocaleDateString([], {weekday:'short'})+'</strong><br>'+oz+' oz';$('history').appendChild(x);}
  }

  function renderTimeline(){
    const list=[...api.drinksFor()].reverse();$('timeline').innerHTML=list.length?'':'<div class="drink">No drinks yet</div>';
    list.forEach(d=>{const r=document.createElement('div');r.className='drink';r.innerHTML='<span>'+D.formatTime(d.at)+' · '+esc(d.label)+'</span><strong>+'+esc(d.oz)+' oz</strong>';$('timeline').appendChild(r);});
  }

  function renderStats(){
    const s=window.WT_V1_STATS.calculate(api);
    const rows=[['Lifetime',Math.round(s.lifetimeOz)+' oz'],['Gallons',s.lifetimeGallons.toFixed(1)],['Days tracked',s.daysTracked],['Goal completion',Math.round(s.completionRate)+'%'],['Current streak',s.currentStreak],['Best streak',s.bestStreak],['Average/day',Math.round(s.averageDailyOz)+' oz'],['Average first drink',s.averageFirstDrinkTime],['Level',s.level],['Level progress',s.levelProgress+' / 500']];
    $('stats').innerHTML=rows.map(r=>'<div class="stat"><div class="muted">'+r[0]+'</div><strong>'+r[1]+'</strong></div>').join('');
  }

  function add(oz,label){try{api.addDrink(oz,label);navigator.vibrate?.(20);}catch(e){alert(e.message);}}

  $('undoButton').onclick=()=>api.undoToday();
  $('resetButton').onclick=()=>{if(confirm('Reset today?'))api.resetDay();};
  $('clearButton').onclick=()=>{if(confirm('Reset all Water Tracker data, including badges and plant progress?')){window.WT_V1_STORAGE.resetUserData();location.reload();}};
  $('exportButton').onclick=()=>window.WT_V1_STORAGE.exportData(api.getState());
  $('goalButton').onclick=()=>{const n=Number(prompt('Daily goal:',api.getState().settings.dailyGoal));if(n>0)api.saveSettings({dailyGoal:n});};
  render();
})();
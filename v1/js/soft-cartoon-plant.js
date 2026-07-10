(function(){
  const S=window.WT_V1_STORAGE,H=window.WT_V1_HYDRATION,E=window.WT_V1_ENGAGEMENT;
  let painting=false,queued=false,lastTotal=null,lastGoalMet=false;
  function api(){return H.createApi(S.load(),()=>{});}
  function leaf(x,y,scale,flip,alt){return '<g class="leafGroup '+(alt?'alt':'')+'" transform="translate('+x+' '+y+') scale('+(flip?-scale:scale)+' '+scale+')"><path d="M0 0 C16 -14 34 -10 42 2 C28 13 12 13 0 0Z" fill="url(#leafGrad)" stroke="#2d7d3b" stroke-width="1.4"/><path d="M3 0 C16 0 27 2 38 3" fill="none" stroke="#83cb65" stroke-width="1.2" opacity=".8"/></g>';}
  function flower(x,y,scale,small){let petals='';for(let i=0;i<8;i++){const a=i*45;petals+='<ellipse cx="0" cy="-12" rx="7" ry="12" fill="url(#petalGrad)" transform="rotate('+a+')"/>';};return '<g class="flowerGroup" transform="translate('+x+' '+y+') scale('+scale+')">'+petals+'<circle cx="0" cy="0" r="7" fill="#ffd34e" stroke="#e8a900" stroke-width="1.5"/>'+(small?'':'<circle cx="-2" cy="-2" r="2" fill="#fff4a8" opacity=".75"/>')+'</g>';}
  function bud(x,y,scale){return '<g class="flowerGroup" transform="translate('+x+' '+y+') scale('+scale+')"><path d="M0 0 C-8 -12 -7 -24 0 -29 C7 -24 8 -12 0 0Z" fill="url(#petalGrad)" stroke="#cf4f88" stroke-width="1.5"/><path d="M-7 -2 Q0 5 7 -2" fill="#4d9b42"/></g>';}
  function svg(p,react,goalPulse){
    const stage=p.stage,wet=p.moisture;
    const stemTop=[132,118,102,88,72,58,48,38][stage];
    const stem='<path d="M75 132 C73 112 77 90 75 '+stemTop+'" stroke="url(#stemGrad)" stroke-width="8" fill="none" stroke-linecap="round"/>';
    let leaves='';
    if(stage>=1)leaves+=leaf(73,111,.58,false,false);
    if(stage>=2)leaves+=leaf(76,104,.62,true,true);
    if(stage>=3){leaves+=leaf(73,91,.72,false,true)+leaf(77,83,.7,true,false);}
    if(stage>=4){leaves+=leaf(72,70,.68,false,false)+leaf(78,64,.64,true,true);}
    if(stage>=6){leaves+=leaf(71,53,.58,false,true)+leaf(79,49,.55,true,false);}
    let bloom='';
    if(stage===0)bloom='<ellipse cx="75" cy="127" rx="7" ry="10" fill="#b77a3b" transform="rotate(-18 75 127)"/>';
    if(stage===4)bloom=bud(75,60,.8);
    if(stage===5)bloom=flower(75,47,.92,false);
    if(stage===6)bloom=flower(75,39,.83,false)+flower(55,55,.55,true)+bud(94,52,.55);
    if(stage===7)bloom=flower(75,32,.82,false)+flower(50,48,.58,true)+flower(99,47,.58,true)+bud(60,67,.48)+bud(91,65,.48);
    const soil=p.moisture==='dry'?'#9a693d':p.moisture==='damp'?'#765035':p.moisture==='moist'?'#533928':'#37271f';
    const bodyClass='softPlantSvg '+wet+(react?' afterDrink':'')+(goalPulse?' goalPulse':'');
    return '<svg class="'+bodyClass+'" viewBox="0 0 150 170" role="img" aria-label="'+p.name+', '+p.moisture+'"><defs><linearGradient id="potGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f9d8ae"/><stop offset=".55" stop-color="#e9b77d"/><stop offset="1" stop-color="#c8874e"/></linearGradient><linearGradient id="leafGrad" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#8bd55e"/><stop offset=".55" stop-color="#4ba947"/><stop offset="1" stop-color="#277838"/></linearGradient><linearGradient id="petalGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffb4d0"/><stop offset=".55" stop-color="#f46da5"/><stop offset="1" stop-color="#d94e8a"/></linearGradient><linearGradient id="stemGrad" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#2e7c38"/><stop offset=".5" stop-color="#58aa48"/><stop offset="1" stop-color="#286b34"/></linearGradient></defs><ellipse cx="75" cy="157" rx="48" ry="9" fill="rgba(37,25,16,.16)"/><path d="M34 121 H116 L108 154 Q75 166 42 154Z" fill="url(#potGrad)" stroke="#b67542" stroke-width="2"/><ellipse cx="75" cy="121" rx="42" ry="13" fill="#d69a5d" stroke="#b67542" stroke-width="2"/><ellipse class="soil" cx="75" cy="120" rx="35" ry="9" fill="'+soil+'"/><path d="M69 144 Q75 151 81 144 Q86 138 81 134 Q75 132 69 134 Q64 138 69 144Z" fill="#d99c67" opacity=".75"/><g class="plantBody">'+stem+leaves+bloom+'</g></svg>';
  }
  function render(forceReaction){
    if(painting)return;painting=true;
    const A=api(),p=E.plant(A),box=document.getElementById('plantBox'),name=document.getElementById('plantName');
    if(!box){painting=false;return;}
    const total=p.today,react=forceReaction||lastTotal!==null&&total>lastTotal,goalPulse=!lastGoalMet&&total>=p.goal;
    const stageDefs=E.PLANT_STAGES||[],next=stageDefs[p.stage+1],min=stageDefs[p.stage]?.minGoalDays||0,max=next?.minGoalDays||Math.max(min+1,p.goalDays),progress=next?Math.max(0,Math.min(100,((p.goalDays-min)/(max-min))*100)):100;
    if(name)name.textContent=p.name;
    box.className='plant softCartoonPlant';
    box.innerHTML='<div class="softPlantScene"><div class="plantDrop '+(react?'show':'')+'">💧</div><div class="plantSparkles '+(goalPulse?'show':'')+'"><span>✨</span><span>✨</span><span>✨</span></div>'+svg(p,react,goalPulse)+'</div><div><p class="plantCondition">'+p.moistureText+'</p><p class="plantMeta">Today: '+p.today+' / '+p.goal+' oz</p><p class="plantMeta">'+p.goalDays+' goal days'+(next?' · next: '+next.name+' at '+next.minGoalDays:' · fully grown')+'</p><div class="plantGrowthTrack"><span style="width:'+progress+'%"></span></div></div>';
    lastTotal=total;lastGoalMet=total>=p.goal;painting=false;
  }
  function queue(){if(queued)return;queued=true;requestAnimationFrame(()=>{queued=false;render(false);});}
  const root=document.querySelector('main.app');if(root)new MutationObserver(m=>{if(painting)return;if(m.some(x=>x.target.id==='plantBox'||x.target.closest?.('#plantBox,#todayTotal')))queue();}).observe(root,{subtree:true,childList:true,characterData:true});
  document.addEventListener('click',e=>{if(e.target.closest('#quickButtons,#cupButtons,#saveAmountButton'))setTimeout(()=>render(true),80);},true);
  window.addEventListener('storage',queue);window.addEventListener('wt-data-changed',queue);
  setTimeout(()=>render(false),0);setTimeout(()=>render(false),300);
})();
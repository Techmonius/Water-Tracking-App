(function(){
  const S=window.WT_V1_STORAGE,H=window.WT_V1_HYDRATION,E=window.WT_V1_ENGAGEMENT;
  let painting=false,queued=false,lastTotal=null,lastGoalMet=false;
  function api(){return H.createApi(S.load(),()=>{});}

  function leaf(x,y,scale,side,alt,angle=0){
    return '<g class="leafAnchor" transform="translate('+x+' '+y+') rotate('+angle+')">'
      +'<g class="leafMotion '+(alt?'alt':'')+'" transform="scale('+(side<0?-scale:scale)+' '+scale+')">'
      +'<path class="petiole" d="M0 0 C3 -1 6 -1 10 0" fill="none" stroke="url(#stemGrad)" stroke-width="4" stroke-linecap="round"/>'
      +'<path d="M8 0 C20 -16 39 -16 49 -3 C37 13 20 15 8 0Z" fill="url(#leafGrad)" stroke="#2d7d3b" stroke-width="1.6"/>'
      +'<path d="M11 0 C24 0 35 -1 45 -3" fill="none" stroke="#9be378" stroke-width="1.35" opacity=".9"/>'
      +'<path d="M25 -2 Q29 -8 34 -11 M28 1 Q34 5 39 7" fill="none" stroke="#72c55b" stroke-width="1" opacity=".65"/>'
      +'</g></g>';
  }

  function topLeaf(x,y,scale,alt){
    return '<g class="leafAnchor" transform="translate('+x+' '+y+')">'
      +'<g class="leafMotion '+(alt?'alt':'')+'" transform="scale('+scale+')">'
      +'<path class="petiole" d="M0 8 L0 0" fill="none" stroke="url(#stemGrad)" stroke-width="4" stroke-linecap="round"/>'
      +'<path d="M0 1 C-13 -10 -12 -31 0 -43 C12 -31 13 -10 0 1Z" fill="url(#leafGrad)" stroke="#2d7d3b" stroke-width="1.6"/>'
      +'<path d="M0 -2 L0 -37" fill="none" stroke="#9be378" stroke-width="1.35" opacity=".9"/>'
      +'</g></g>';
  }

  function flower(x,y,scale,small){
    let petals='';
    for(let i=0;i<8;i++)petals+='<ellipse cx="0" cy="-13" rx="7.5" ry="13" fill="url(#petalGrad)" transform="rotate('+(i*45)+')"/>';
    return '<g class="flowerAnchor" transform="translate('+x+' '+y+') scale('+scale+')"><g class="flowerMotion">'
      +petals+'<circle cx="0" cy="0" r="7.5" fill="#ffd34e" stroke="#e8a900" stroke-width="1.5"/>'
      +(small?'':'<circle cx="-2" cy="-2" r="2.2" fill="#fff4a8" opacity=".8"/>')
      +'</g></g>';
  }

  function bud(x,y,scale){
    return '<g class="flowerAnchor" transform="translate('+x+' '+y+') scale('+scale+')"><g class="flowerMotion">'
      +'<path d="M0 0 C-9 -12 -8 -25 0 -31 C8 -25 9 -12 0 0Z" fill="url(#petalGrad)" stroke="#cf4f88" stroke-width="1.5"/>'
      +'<path d="M-8 -2 Q0 6 8 -2" fill="#4d9b42" stroke="#2d7d3b" stroke-width="1"/>'
      +'</g></g>';
  }

  function branches(stage){
    let out='';
    if(stage>=6){
      out+='<path d="M75 66 Q64 57 55 50" stroke="url(#stemGrad)" stroke-width="5" fill="none" stroke-linecap="round"/>';
      out+='<path d="M75 64 Q87 55 96 48" stroke="url(#stemGrad)" stroke-width="5" fill="none" stroke-linecap="round"/>';
    }
    if(stage>=7){
      out+='<path d="M75 82 Q60 74 48 67" stroke="url(#stemGrad)" stroke-width="4.5" fill="none" stroke-linecap="round"/>';
      out+='<path d="M75 80 Q91 72 103 65" stroke="url(#stemGrad)" stroke-width="4.5" fill="none" stroke-linecap="round"/>';
    }
    return out;
  }

  function plantParts(stage){
    if(stage===0)return '<ellipse cx="75" cy="126" rx="7" ry="10" fill="#b77a3b" stroke="#8e582b" stroke-width="1.3" transform="rotate(-18 75 126)"/>';

    const stemTop=[132,111,96,80,65,48,38,31][stage];
    let out='<path d="M75 132 C73 112 77 91 75 '+stemTop+'" stroke="url(#stemGrad)" stroke-width="8" fill="none" stroke-linecap="round"/>';
    out+=branches(stage);

    if(stage===1){
      out+=leaf(75,113,.5,-1,false,-8)+leaf(75,113,.5,1,true,8);
    }
    if(stage===2){
      out+=leaf(75,104,.62,-1,false,-7)+leaf(75,104,.62,1,true,7);
      out+=topLeaf(75,96,.48,false);
    }
    if(stage>=3){
      out+=leaf(75,112,.64,-1,false,-8)+leaf(75,110,.64,1,true,8);
      out+=leaf(75,91,.72,-1,true,-10)+leaf(75,88,.72,1,false,10);
      out+=topLeaf(75,80,.58,false);
    }
    if(stage>=4){
      out+=leaf(75,72,.63,-1,false,-10)+leaf(75,69,.63,1,true,10);
    }
    if(stage>=6){
      out+=leaf(64,58,.48,-1,true,-18)+leaf(87,56,.48,1,false,18);
    }

    if(stage===4)out+=bud(75,58,.78);
    if(stage===5)out+=flower(75,45,.9,false);
    if(stage===6)out+=flower(75,34,.82,false)+flower(54,48,.54,true)+bud(97,46,.52);
    if(stage===7)out+=flower(75,29,.8,false)+flower(52,47,.58,true)+flower(99,45,.58,true)+bud(47,65,.45)+bud(104,63,.45);
    return out;
  }

  function svg(p,react,goalPulse){
    const soil=p.moisture==='dry'?'#9a693d':p.moisture==='damp'?'#765035':p.moisture==='moist'?'#533928':'#37271f';
    const bodyClass='softPlantSvg '+p.moisture+(react?' afterDrink':'')+(goalPulse?' goalPulse':'');
    return '<svg class="'+bodyClass+'" viewBox="0 0 150 170" role="img" aria-label="'+p.name+', '+p.moisture+'">'
      +'<defs>'
      +'<linearGradient id="potGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f9d8ae"/><stop offset=".55" stop-color="#e9b77d"/><stop offset="1" stop-color="#c8874e"/></linearGradient>'
      +'<linearGradient id="leafGrad" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#a6e66d"/><stop offset=".48" stop-color="#58b84c"/><stop offset="1" stop-color="#277838"/></linearGradient>'
      +'<linearGradient id="petalGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffbdd6"/><stop offset=".52" stop-color="#f46da5"/><stop offset="1" stop-color="#d94e8a"/></linearGradient>'
      +'<linearGradient id="stemGrad" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#276b34"/><stop offset=".48" stop-color="#63ba4d"/><stop offset="1" stop-color="#286b34"/></linearGradient>'
      +'</defs>'
      +'<ellipse cx="75" cy="157" rx="48" ry="9" fill="rgba(37,25,16,.16)"/>'
      +'<path d="M34 121 H116 L108 154 Q75 166 42 154Z" fill="url(#potGrad)" stroke="#b67542" stroke-width="2"/>'
      +'<ellipse cx="75" cy="121" rx="42" ry="13" fill="#d69a5d" stroke="#b67542" stroke-width="2"/>'
      +'<ellipse class="soil" cx="75" cy="120" rx="35" ry="9" fill="'+soil+'"/>'
      +'<path d="M69 144 Q75 151 81 144 Q86 138 81 134 Q75 132 69 134 Q64 138 69 144Z" fill="#d99c67" opacity=".75"/>'
      +'<g class="plantBody">'+plantParts(p.stage)+'</g>'
      +'</svg>';
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
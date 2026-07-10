(function(){
  const S=window.WT_V1_STORAGE,H=window.WT_V1_HYDRATION,E=window.WT_V1_ENGAGEMENT;
  let painting=false,lastTotal=null,lastGoalMet=false,idleFrame=0,idleTimer=null;
  function api(){return H.createApi(S.load(),()=>{});}
  function rect(c,x,y,w,h,color){c.fillStyle=color;c.fillRect(x,y,w,h);}
  function line(c,x0,y0,x1,y1,color,w=1){c.strokeStyle=color;c.lineWidth=w;c.lineCap='square';c.beginPath();c.moveTo(x0+.5,y0+.5);c.lineTo(x1+.5,y1+.5);c.stroke();}
  function leaf(c,x,y,side,size,pal,frame,droop){
    const sway=frame?(side>0?1:-1):0,dy=droop?1:0,s=side>0?1:-1;
    line(c,x,y,x+s*(size+1),y-1+dy,pal.stem,2);
    rect(c,x+s*2,y-2+dy,Math.max(2,size-1),2,pal.leafDark);
    rect(c,x+s*3,y-3+dy,Math.max(2,size-2),1,pal.leaf);
    rect(c,x+s*(size+1)+sway,y-2+dy,2,2,pal.leafLight);
    rect(c,x+s*2,y+dy,Math.max(2,size),1,pal.leafDark);
  }
  function flower(c,x,y,small,pal,frame){
    const o=frame?1:0,r=small?1:2;
    rect(c,x-r,y-2-o,r*2+1,1,pal.petalLight);
    rect(c,x-r-1,y-1-o,r*2+3,2,pal.petal);
    rect(c,x-r,y+1-o,r*2+1,1,pal.petalDark);
    rect(c,x,y-o,1,1,pal.center);
  }
  function drawSprite(canvas,p,frame){
    const c=canvas.getContext('2d');
    c.imageSmoothingEnabled=false;
    c.setTransform(1,0,0,1,0,0);
    c.clearRect(0,0,64,64);
    c.scale(2,2);
    const sets={
      dry:{soil:'#8b552d',soilHi:'#b07038',leaf:'#8da83c',leafLight:'#b9ca54',leafDark:'#526b2a',stem:'#5f812c'},
      damp:{soil:'#704426',soilHi:'#936039',leaf:'#79b83f',leafLight:'#a9d45b',leafDark:'#3f772d',stem:'#4a8f32'},
      moist:{soil:'#55341f',soilHi:'#704b2e',leaf:'#5fbd3f',leafLight:'#96db58',leafDark:'#30762c',stem:'#398f30'},
      watered:{soil:'#38251b',soilHi:'#543a29',leaf:'#48c63e',leafLight:'#8be45b',leafDark:'#23742a',stem:'#2e9630'}
    };
    const q=sets[p.moisture]||sets.damp,pal={...q,petal:'#f06b9c',petalLight:'#ffb3cf',petalDark:'#c94c7f',center:'#ffd34d'};
    rect(c,7,28,18,2,'rgba(0,0,0,.22)');
    rect(c,7,21,18,2,'#8d4928');rect(c,6,20,20,2,'#d6793c');rect(c,7,19,18,1,'#f3a65c');
    rect(c,8,22,16,6,'#bd6030');rect(c,9,28,14,1,'#8d4928');
    rect(c,9,22,14,1,'#e68c48');rect(c,10,24,12,4,'#c96b35');
    rect(c,14,25,1,1,'#7a351f');rect(c,17,25,1,1,'#7a351f');rect(c,13,26,6,1,'#7a351f');rect(c,14,27,4,1,'#7a351f');rect(c,15,28,2,1,'#7a351f');
    rect(c,7,18,18,3,'#9c502a');rect(c,6,17,20,2,'#e28a49');rect(c,7,16,18,1,'#ffc070');
    rect(c,8,17,16,2,pal.soil);rect(c,10,17,3,1,pal.soilHi);rect(c,19,18,3,1,pal.soilHi);
    if(p.stage===0){rect(c,15,16,2,1,'#c78a47');rect(c,16,15,2,2,'#98602f');}
    const baseY=17,droop=p.moisture==='dry';
    if(p.stage>=1){const top=[16,13,11,8,6,4,3,2][p.stage];line(c,16,baseY,16,top,pal.stem,p.stage>=3?2:1);}
    if(p.stage===1){leaf(c,16,13,-1,3,pal,frame,droop);leaf(c,16,13,1,3,pal,frame,droop);}
    if(p.stage===2){leaf(c,16,13,-1,4,pal,frame,droop);leaf(c,16,13,1,4,pal,frame,droop);leaf(c,16,10,1,2,pal,frame,droop);}
    if(p.stage>=3){
      leaf(c,16,15,-1,4,pal,frame,droop);leaf(c,16,15,1,4,pal,frame,droop);
      leaf(c,16,11,-1,5,pal,frame,droop);leaf(c,16,10,1,5,pal,frame,droop);
      leaf(c,16,7,-1,4,pal,frame,droop);leaf(c,16,7,1,4,pal,frame,droop);
      rect(c,15,4+(droop?1:0),3,4,pal.leafDark);rect(c,16,3+(frame?0:1)+(droop?1:0),2,3,pal.leaf);rect(c,16,3+(droop?1:0),1,1,pal.leafLight);
    }
    if(p.stage>=4){leaf(c,16,5,-1,3,pal,frame,droop);leaf(c,16,5,1,3,pal,frame,droop);}
    if(p.stage===4){rect(c,15,2+(frame?0:1),3,3,pal.petalDark);rect(c,16,1+(frame?0:1),2,2,pal.petal);}
    if(p.stage===5){flower(c,16,3,false,pal,frame);}
    if(p.stage===6){line(c,16,7,11,5,pal.stem,1);line(c,16,7,22,5,pal.stem,1);flower(c,16,2,false,pal,frame);flower(c,11,5,true,pal,1-frame);flower(c,22,5,true,pal,frame);}
    if(p.stage===7){line(c,16,8,9,6,pal.stem,1);line(c,16,8,23,6,pal.stem,1);line(c,16,11,7,10,pal.stem,1);line(c,16,11,25,10,pal.stem,1);flower(c,16,2,false,pal,frame);flower(c,9,6,false,pal,1-frame);flower(c,23,6,false,pal,frame);flower(c,7,10,true,pal,frame);flower(c,25,10,true,pal,1-frame);}
    if(p.moisture==='watered'){
      const a=frame?[[4,8],[28,12],[25,4]]:[[5,12],[27,7],[3,5]];
      a.forEach(([x,y])=>{rect(c,x,y,1,1,'#fff6a8');rect(c,x-1,y,3,1,'rgba(255,246,168,.5)');rect(c,x,y-1,1,3,'rgba(255,246,168,.5)');});
    }
    c.setTransform(1,0,0,1,0,0);
  }
  function render(forceReaction){
    if(painting)return;painting=true;
    const A=api(),p=E.plant(A),box=document.getElementById('plantBox'),name=document.getElementById('plantName');
    if(!box){painting=false;return;}
    const total=p.today,react=forceReaction||lastTotal!==null&&total>lastTotal,goalPulse=!lastGoalMet&&total>=p.goal;
    const defs=E.PLANT_STAGES||[],next=defs[p.stage+1],min=defs[p.stage]?.minGoalDays||0,max=next?.minGoalDays||Math.max(min+1,p.goalDays),progress=next?Math.max(0,Math.min(100,((p.goalDays-min)/(max-min))*100)):100;
    if(name)name.textContent=p.name;
    box.className='plant gbaPlant';
    box.innerHTML='<div class="gbaScene"><div class="pixelDrop '+(react?'show':'')+'"></div><canvas class="gbaSprite '+p.moisture+(react?' afterDrink':'')+(goalPulse?' goalPulse':'')+'" width="64" height="64" aria-label="'+p.name+', '+p.moisture+'"></canvas></div><div><p class="plantCondition">'+p.moistureText+'</p><p class="plantMeta">Today: '+p.today+' / '+p.goal+' oz</p><p class="plantMeta">'+p.goalDays+' goal days'+(next?' · next: '+next.name+' at '+next.minGoalDays:' · fully grown')+'</p><div class="plantGrowthTrack"><span style="width:'+progress+'%"></span></div></div>';
    drawSprite(box.querySelector('canvas'),p,idleFrame);
    lastTotal=total;lastGoalMet=total>=p.goal;painting=false;
  }
  function tick(){idleFrame=1-idleFrame;const canvas=document.querySelector('#plantBox canvas');if(canvas){const p=E.plant(api());drawSprite(canvas,p,idleFrame);}}
  document.addEventListener('click',e=>{if(e.target.closest('#quickButtons,#cupButtons,#saveAmountButton'))setTimeout(()=>render(true),80);},true);
  window.addEventListener('storage',()=>render(false));
  window.addEventListener('wt-data-changed',()=>render(false));
  window.addEventListener('wt-plant-render',()=>render(false));
  render(false);setTimeout(()=>render(false),300);idleTimer=setInterval(tick,560);
})();
(function(){
const S=WT_V1_STORAGE,H=WT_V1_HYDRATION,E=WT_V1_ENGAGEMENT,M=window.WT_PLANT_MASKS;
let busy=false,lastTotal=null,lastGoalMet=false;
const api=()=>H.createApi(S.load(),()=>{});
const asset=stage=>'v1/assets/plants/stage-'+(stage+1)+'.webp';
function applyMask(el,url){el.style.webkitMaskImage='url("'+url+'")';el.style.maskImage='url("'+url+'")';}
function render(forceReaction=false){
  if(busy)return;busy=true;
  const A=api(),p=E.plant(A),box=document.getElementById('plantBox'),name=document.getElementById('plantName');
  if(!box){busy=false;return;}
  const react=forceReaction||(lastTotal!==null&&p.today>lastTotal),goalPulse=!lastGoalMet&&p.today>=p.goal;
  const stages=E.PLANT_STAGES||[],next=stages[p.stage+1],min=stages[p.stage]?.minGoalDays||0,max=next?.minGoalDays||Math.max(min+1,p.goalDays);
  const progress=next?Math.max(0,Math.min(100,((p.goalDays-min)/(max-min))*100)):100;
  const src=asset(p.stage),motion=(react?' afterDrink':'')+(goalPulse?' goalPulse':''),masks=M[String(p.stage+1)];
  if(name)name.textContent=p.name;
  box.className='plant spritePlant';
  box.innerHTML='<div class="spritePlantScene '+p.moisture+'">'+
    '<div class="pixelDrop '+(react?'show':'')+'"></div>'+
    '<div class="spriteLayerStack">'+
      '<img class="plantSpriteLayer plantSpritePot '+p.moisture+'" src="'+src+'" alt="" draggable="false">'+
      '<img class="plantSpriteLayer plantSpriteFoliage '+p.moisture+motion+'" src="'+src+'" alt="'+p.name+', '+p.moisture+'" draggable="false">'+
    '</div>'+
    '<div class="spriteSoil"></div>'+
    '<div class="spriteSparkles '+(p.moisture==='watered'?'show':'')+'"><i></i><i></i><i></i><i></i></div>'+
    '</div><div><p class="plantCondition">'+p.moistureText+'</p><p class="plantMeta">Today: '+p.today+' / '+p.goal+' oz</p><p class="plantMeta">'+p.goalDays+' goal days'+(next?' · next: '+next.name+' at '+next.minGoalDays:' · fully grown')+'</p><div class="plantGrowthTrack"><span style="width:'+progress+'%"></span></div></div>';
  const pot=box.querySelector('.plantSpritePot'),plant=box.querySelector('.plantSpriteFoliage');
  if(masks){applyMask(pot,masks.static);applyMask(plant,masks.plant);}
  lastTotal=p.today;lastGoalMet=p.today>=p.goal;busy=false;
}
document.addEventListener('click',e=>{if(e.target.closest('#quickButtons,#cupButtons,#saveAmountButton'))setTimeout(()=>render(true),80)},true);
['storage','wt-data-changed','wt-plant-render'].forEach(type=>window.addEventListener(type,()=>render(false)));
render();setTimeout(render,300);
})();
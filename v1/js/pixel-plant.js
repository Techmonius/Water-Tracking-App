(function(){
const S=WT_V1_STORAGE,H=WT_V1_HYDRATION,E=WT_V1_ENGAGEMENT;
const api=()=>H.createApi(S.load(),()=>{});
const asset=stage=>'v1/assets/plants/stage-'+(stage+1)+'.webp';
let busy=false;

async function render(){
  if(busy)return;
  busy=true;
  try{
    const A=api();
    const p=E.plant(A);
    const box=document.getElementById('plantBox');
    const name=document.getElementById('plantName');
    if(!box)return;

    const stages=E.PLANT_STAGES||[];
    const next=stages[p.stage+1];
    const min=stages[p.stage]?.minGoalDays||0;
    const max=next?.minGoalDays||Math.max(min+1,p.goalDays);
    const progress=next?Math.max(0,Math.min(100,((p.goalDays-min)/(max-min))*100)):100;

    if(name)name.textContent=p.name;
    box.className='plant spritePlant staticConceptPlant';
    box.innerHTML=
      '<div class="spritePlantScene staticConceptScene">'+
        '<img class="plantConceptArt" src="'+asset(p.stage)+'" alt="'+p.name+' plant">'+
      '</div>'+
      '<div>'+
        '<p class="plantCondition">'+p.moistureText+'</p>'+
        '<p class="plantMeta">Today: '+p.today+' / '+p.goal+' oz</p>'+
        '<p class="plantMeta">'+p.goalDays+' goal days'+(next?' · next: '+next.name+' at '+next.minGoalDays:' · fully grown')+'</p>'+
        '<div class="plantGrowthTrack"><span style="width:'+progress+'%"></span></div>'+
      '</div>';
  }finally{
    busy=false;
  }
}

['storage','wt-data-changed','wt-plant-render'].forEach(t=>window.addEventListener(t,render));
render();
setTimeout(render,300);
})();
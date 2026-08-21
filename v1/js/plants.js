(function(){
  const flowerLayer=(asset,cx,cy)=>Object.freeze({asset,cx,cy});
  const flowerAnimation=(layers)=>Object.freeze({layers:Object.freeze(layers)});
  const STARTER_STAGES=[
    {name:'Seed',minGoalDays:0,asset:'v1/assets/plants/stage-1.webp',flowerAnimation:null},
    {name:'Sprout',minGoalDays:3,asset:'v1/assets/plants/stage-2.webp',flowerAnimation:null},
    {name:'Two Leaves',minGoalDays:6,asset:'v1/assets/plants/stage-3.webp',flowerAnimation:null},
    {name:'Leafy Plant',minGoalDays:10,asset:'v1/assets/plants/stage-4.webp',flowerAnimation:null},
    {name:'Bud',minGoalDays:15,asset:'v1/assets/plants/stage-5.webp',flowerAnimation:null},
    {name:'First Flower',minGoalDays:21,asset:'v1/assets/plants/stage-6.webp',flowerAnimation:flowerAnimation([
      flowerLayer('v1/assets/plants/overlays/stage-6-flower-1.svg',50,27)
    ])},
    {name:'More Flowers',minGoalDays:30,asset:'v1/assets/plants/stage-7.webp',flowerAnimation:flowerAnimation([
      flowerLayer('v1/assets/plants/overlays/stage-7-flower-1.svg',32,34),
      flowerLayer('v1/assets/plants/overlays/stage-7-flower-2.svg',50,24),
      flowerLayer('v1/assets/plants/overlays/stage-7-flower-3.svg',68,31)
    ])},
    {name:'Full Bloom',minGoalDays:45,asset:'v1/assets/plants/stage-8.webp',flowerAnimation:flowerAnimation([
      flowerLayer('v1/assets/plants/overlays/stage-8-flower-1.svg',31,35),
      flowerLayer('v1/assets/plants/overlays/stage-8-flower-2.svg',43,23),
      flowerLayer('v1/assets/plants/overlays/stage-8-flower-3.svg',57,20),
      flowerLayer('v1/assets/plants/overlays/stage-8-flower-4.svg',70,31),
      flowerLayer('v1/assets/plants/overlays/stage-8-flower-5.svg',52,38)
    ])}
  ];
  const CATALOG=Object.freeze({starter_flower:Object.freeze({id:'starter_flower',name:'Starter Flower',durationGoalDays:45,stages:Object.freeze(STARTER_STAGES.map(Object.freeze))})});
  const DEFAULT_ID='starter_flower';
  function definition(id){return CATALOG[id]||CATALOG[DEFAULT_ID];}
  function stageFor(id,goalDays){const plant=definition(id),days=Math.max(0,Number(goalDays)||0);let index=0;for(let i=0;i<plant.stages.length;i++)if(days>=plant.stages[i].minGoalDays)index=i;return{index,stage:plant.stages[index],plant};}
  function progress(state,lifetimeGoalDays){const p=state?.plantProgress||{},plant=definition(p.currentPlantId),baseline=Math.max(0,Number(p.startedAtGoalDays)||0),days=Math.max(0,(Number(lifetimeGoalDays)||0)-baseline),current=stageFor(plant.id,days);return{plant,plantId:plant.id,baseline,goalDays:days,stageIndex:current.index,stage:current.stage,complete:days>=plant.durationGoalDays,completionPending:p.completionPending||null,completedPlants:Array.isArray(p.completedPlants)?p.completedPlants:[]};}
  function mysteryPool(completedIds=[]){const done=new Set(completedIds);return Object.values(CATALOG).filter(p=>p.id!==DEFAULT_ID&&!done.has(p.id));}
  window.WT_V1_PLANTS={CATALOG,DEFAULT_ID,definition,stageFor,progress,mysteryPool};
})();
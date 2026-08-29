(function(){
  const flowerLayer=(asset,cx,cy,box=null,scale=1.018)=>Object.freeze({asset,cx,cy,box,scale});
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
      flowerLayer('v1/assets/plants/overlays/stage-8-flower-1.webp',49.86,46.95,{x:35.15625,y:1.5625,w:26.5625,h:25},1.08),
      flowerLayer('v1/assets/plants/overlays/stage-8-flower-2.webp',46.92,46.8,{x:23.4375,y:12.5,w:26.5625,h:25},1.08),
      flowerLayer('v1/assets/plants/overlays/stage-8-flower-3.webp',47.08,45.03,{x:46.09375,y:21.09375,w:26.5625,h:24.21875},1.08),
      flowerLayer('v1/assets/plants/overlays/stage-8-flower-4.webp',54.86,51.61,{x:57.8125,y:28.90625,w:24.21875,h:22.65625},1.08),
      flowerLayer('v1/assets/plants/overlays/stage-8-flower-5.webp',48.25,51.88,{x:5.46875,y:35.15625,w:22.65625,h:21.09375},1.08)
    ])}
  ];
  const S=window.WT_V1_SUNFLOWER_ASSETS||{};
  const SUNFLOWER_STAGES=[
    {name:'Seed',minGoalDays:0,asset:S.stage1,flowerAnimation:null},
    {name:'Sprout',minGoalDays:4,asset:S.stage2,flowerAnimation:null},
    {name:'Young Plant',minGoalDays:8,asset:S.stage3,flowerAnimation:null},
    {name:'Taller Plant',minGoalDays:14,asset:S.stage4,flowerAnimation:null},
    {name:'Bud Forms',minGoalDays:20,asset:S.stage5,flowerAnimation:null},
    {name:'Flower Opening',minGoalDays:26,asset:S.stage6,flowerAnimation:flowerAnimation([
      flowerLayer(S.flower6,49.21,52.51,{x:35.15625,y:2.34375,w:32.03125,h:29.6875},1.06)
    ])},
    {name:'Full Sunflower',minGoalDays:32,asset:S.stage7,flowerAnimation:flowerAnimation([
      flowerLayer(S.flower7,48.07,51.85,{x:31.25,y:2.34375,w:42.1875,h:39.84375},1.07)
    ])},
    {name:'Sun Facing',minGoalDays:36,asset:S.stage8,flowerAnimation:flowerAnimation([
      flowerLayer(S.flower8,50.76,54.21,{x:27.34375,y:2.34375,w:46.09375,h:42.96875},1.08)
    ])}
  ];
  const CATALOG=Object.freeze({
    starter_flower:Object.freeze({id:'starter_flower',name:'Starter Flower',durationGoalDays:45,enabled:true,stages:Object.freeze(STARTER_STAGES.map(Object.freeze))}),
    sunflower:Object.freeze({id:'sunflower',name:'Sunflower',durationGoalDays:36,enabled:true,stages:Object.freeze(SUNFLOWER_STAGES.map(Object.freeze))})
  });
  const DEFAULT_ID='starter_flower';
  function definition(id){return CATALOG[id]||CATALOG[DEFAULT_ID];}
  function stageFor(id,goalDays){const plant=definition(id),days=Math.max(0,Number(goalDays)||0);let index=0;for(let i=0;i<plant.stages.length;i++)if(days>=plant.stages[i].minGoalDays)index=i;return{index,stage:plant.stages[index],plant};}
  function progress(state,lifetimeGoalDays){const p=state?.plantProgress||{},plant=definition(p.currentPlantId),baseline=Math.max(0,Number(p.startedAtGoalDays)||0),days=Math.max(0,(Number(lifetimeGoalDays)||0)-baseline),current=stageFor(plant.id,days);return{plant,plantId:plant.id,baseline,goalDays:days,stageIndex:current.index,stage:current.stage,complete:days>=plant.durationGoalDays,completionPending:p.completionPending||null,completedPlants:Array.isArray(p.completedPlants)?p.completedPlants:[]};}
  function mysteryPool(completedIds=[]){const done=new Set(completedIds);return Object.values(CATALOG).filter(p=>p.id!==DEFAULT_ID&&p.enabled!==false&&!done.has(p.id));}
  window.WT_V1_PLANTS={CATALOG,DEFAULT_ID,definition,stageFor,progress,mysteryPool};
})();
(function(){
  const S=window.WT_V1_STORAGE,P=window.WT_V1_PLANTS;
  if(!S||!P||document.getElementById('gardenView'))return;

  const home=document.getElementById('homeView'),main=document.querySelector('main.app');
  if(!home||!main)return;
  const plantCard=document.getElementById('plantBox')?.closest('.card');
  const plantHeader=plantCard?.querySelector('.row');
  if(plantHeader&&!document.getElementById('gardenButton')){
    const b=document.createElement('button');b.id='gardenButton';b.className='small';b.type='button';b.textContent='🌿 Garden';plantHeader.appendChild(b);
  }
  const view=document.createElement('section');view.id='gardenView';view.className='view';view.innerHTML='<section class="card"><div class="gardenHeader"><div><h2>My Garden</h2><span id="gardenCount" class="gardenCount"></span></div><button id="gardenDone" class="small" type="button">Done</button></div><p class="gardenIntro">Your completed plants live here. Tap one to visit it again.</p><div id="gardenGrid" class="gardenGrid"></div></section>';
  main.appendChild(view);
  const dialog=document.createElement('dialog');dialog.id='gardenPlantDialog';dialog.className='gardenDetail';dialog.innerHTML='<div class="gardenDetailBody"><img id="gardenDetailArt" class="gardenDetailArt" alt=""><h2 id="gardenDetailName"></h2><p id="gardenDetailMeta"></p><button id="gardenDetailClose" class="primary" type="button">Back to Garden</button></div>';
  document.body.appendChild(dialog);
  const $=id=>document.getElementById(id);
  function showView(id){document.querySelectorAll('.view').forEach(v=>v.classList.remove('active'));$(id)?.classList.add('active');window.scrollTo(0,0);}
  function completionRecord(raw){return typeof raw==='string'?{plantId:raw}:raw||{};}
  function render(){
    const state=S.load(),records=(state.plantProgress?.completedPlants||[]).map(completionRecord).filter(x=>x.plantId),grid=$('gardenGrid');
    $('gardenCount').textContent=records.length?(records.length+' completed'):'';
    if(!records.length){grid.innerHTML='<div class="gardenEmpty"><span>🌱</span><strong>Your garden is waiting</strong><div>Completed plants will appear here.</div></div>';return;}
    grid.innerHTML='';
    records.forEach(rec=>{
      const def=P.definition(rec.plantId);if(!def)return;const finalStage=def.stages[def.stages.length-1],date=rec.completedAt?new Date(rec.completedAt):null,when=date&&!Number.isNaN(date.getTime())?date.toLocaleDateString([],{month:'short',day:'numeric',year:'numeric'}):'Completed';
      const card=document.createElement('button');card.type='button';card.className='gardenPlantCard';
      const img=document.createElement('img');img.className='gardenPlantArt';img.alt=def.name;img.src=finalStage.asset;
      const strong=document.createElement('strong');strong.textContent=def.name;const small=document.createElement('small');small.textContent=when;
      card.append(img,strong,small);
      card.onclick=()=>{$('gardenDetailArt').src=finalStage.asset;$('gardenDetailArt').alt=def.name;$('gardenDetailName').textContent=def.name;$('gardenDetailMeta').textContent=(rec.completedAt?'Completed '+when+' · ':'')+def.durationGoalDays+' goal-day plant';dialog.showModal();};
      grid.appendChild(card);
    });
  }
  $('gardenButton').onclick=()=>{render();showView('gardenView');};
  $('gardenDone').onclick=()=>showView('homeView');
  $('gardenDetailClose').onclick=()=>dialog.close();
  dialog.addEventListener('click',e=>{if(e.target===dialog)dialog.close();});
  ['storage','wt-data-changed','wt-plant-render'].forEach(t=>window.addEventListener(t,render));
  render();
})();

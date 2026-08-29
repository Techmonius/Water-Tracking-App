(function(){
  const S=window.WT_V1_STORAGE,P=window.WT_V1_PLANTS;
  if(!S||!P||document.getElementById('gardenView'))return;
  const style=document.createElement('style');
  style.textContent=`
    .gardenHeader{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:8px}
    .gardenIntro{margin:0 0 14px;color:var(--muted);font-size:13px;line-height:1.45}
    .gardenGrid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}
    .gardenPlantCard{border:1px solid var(--line);background:var(--card);border-radius:18px;padding:12px;text-align:center;box-shadow:none;min-width:0}
    .gardenPlantCard:active{transform:scale(.985)}
    .gardenPlantArt{display:block;width:100%;height:142px;object-fit:contain;image-rendering:pixelated;image-rendering:crisp-edges;margin:auto}
    .gardenPlantCard strong{display:block;margin-top:6px;font-size:14px}
    .gardenPlantCard small{display:block;margin-top:3px;color:var(--muted);font-size:11px;line-height:1.35}
    .gardenEmpty{text-align:center;padding:30px 14px;color:var(--muted)}
    .gardenEmpty span{display:block;font-size:42px;margin-bottom:8px}
    .gardenDetail{max-width:360px;width:calc(100% - 28px);border:0;border-radius:22px;padding:0;background:var(--card);color:inherit}
    .gardenDetail::backdrop{background:rgba(0,0,0,.45)}
    .gardenDetailBody{padding:18px;text-align:center}
    .gardenDetailArt{display:block;width:220px;height:220px;max-width:100%;object-fit:contain;image-rendering:pixelated;image-rendering:crisp-edges;margin:0 auto 8px}
    .gardenDetailBody h2{margin:4px 0 2px}.gardenDetailBody p{margin:4px 0 14px;color:var(--muted);font-size:13px}
    .gardenCount{color:var(--muted);font-size:12px}
    @media(max-width:360px){.gardenGrid{grid-template-columns:1fr}}
  `;
  document.head.appendChild(style);

  const home=document.getElementById('homeView'),main=document.querySelector('main.app');
  if(!home||!main)return;
  const plantCard=document.getElementById('plantBox')?.closest('.card');
  const plantHeader=plantCard?.querySelector('.row');
  if(plantHeader&&!document.getElementById('gardenButton')){
    const b=document.createElement('button');b.id='gardenButton';b.className='small';b.type='button';b.textContent='🌿 Garden';plantHeader.appendChild(b);
  }
  const view=document.createElement('section');view.id='gardenView';view.className='view';view.innerHTML='<section class="card"><div class="gardenHeader"><div><h2 style="margin:0">My Garden</h2><span id="gardenCount" class="gardenCount"></span></div><button id="gardenDone" class="small" type="button">Done</button></div><p class="gardenIntro">Your completed plants live here. Tap one to visit it again.</p><div id="gardenGrid" class="gardenGrid"></div></section>';
  main.appendChild(view);
  const dialog=document.createElement('dialog');dialog.id='gardenPlantDialog';dialog.className='gardenDetail';dialog.innerHTML='<div class="gardenDetailBody"><img id="gardenDetailArt" class="gardenDetailArt" alt=""><h2 id="gardenDetailName"></h2><p id="gardenDetailMeta"></p><button id="gardenDetailClose" class="primary" type="button">Back to Garden</button></div>';
  document.body.appendChild(dialog);
  const $=id=>document.getElementById(id);
  function showView(id){document.querySelectorAll('.view').forEach(v=>v.classList.remove('active'));$(id)?.classList.add('active');window.scrollTo(0,0);}
  function completionRecord(raw){return typeof raw==='string'?{plantId:raw}:raw||{};}
  function render(){
    const state=S.load(),records=(state.plantProgress?.completedPlants||[]).map(completionRecord).filter(x=>x.plantId),grid=$('gardenGrid');
    $('gardenCount').textContent=records.length?(records.length+' completed'):'';
    if(!records.length){grid.innerHTML='<div class="gardenEmpty" style="grid-column:1/-1"><span>🌱</span><strong>Your garden is waiting</strong><div>Completed plants will appear here.</div></div>';return;}
    grid.innerHTML='';
    records.forEach((rec,index)=>{
      const def=P.definition(rec.plantId);if(!def)return;const finalStage=def.stages[def.stages.length-1],date=rec.completedAt?new Date(rec.completedAt):null,when=date&&!Number.isNaN(date.getTime())?date.toLocaleDateString([],{month:'short',day:'numeric',year:'numeric'}):'Completed';
      const card=document.createElement('button');card.type='button';card.className='gardenPlantCard';card.innerHTML='<img class="gardenPlantArt" alt="'+def.name+'" src="'+finalStage.asset+'"><strong>'+def.name+'</strong><small>'+when+'</small>';
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
(function(){
  function correctMoreFlowersPosition(){
    const box=document.getElementById('plantBox');
    const name=document.getElementById('plantName');
    if(!box||!name)return;
    const living=box.querySelector('.plantRasterLiving');
    if(!living)return;
    // Stage 7 (More Flowers) was extracted lower within its source sprite than
    // the surrounding growth stages. Keep the shared pot/soil fixed and raise
    // only the living foliage so its stem emerges from the same soil line.
    living.style.marginTop=name.textContent.trim()==='More Flowers'?'-16px':'0px';
  }

  window.addEventListener('wt-plant-render',()=>setTimeout(correctMoreFlowersPosition,0));
  window.addEventListener('wt-data-changed',()=>setTimeout(correctMoreFlowersPosition,0));
  window.addEventListener('load',()=>{
    setTimeout(correctMoreFlowersPosition,400);
    const box=document.getElementById('plantBox');
    if(box)new MutationObserver(()=>correctMoreFlowersPosition()).observe(box,{childList:true,subtree:true});
  },{once:true});
})();
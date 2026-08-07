(function(){
  function align(){
    const name=document.getElementById('plantName');
    const living=document.querySelector('#plantBox .plantRasterLiving');
    if(!name||!living)return;
    if(name.textContent.trim()==='More Flowers'){
      living.style.marginLeft='0px';
      living.style.marginTop='-16px';
      living.style.removeProperty('--plant-align-x');
      living.style.removeProperty('--plant-align-y');
    }else{
      living.style.marginLeft='0px';
      living.style.marginTop='0px';
    }
  }
  function schedule(){setTimeout(align,0);}
  window.addEventListener('wt-plant-render',schedule);
  window.addEventListener('wt-data-changed',schedule);
  window.addEventListener('resize',schedule);
  schedule();
  setTimeout(schedule,450);
})();
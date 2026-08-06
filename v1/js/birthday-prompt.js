(function(){
  const alignment=document.createElement('script');
  alignment.src='v1/js/plant-alignment.js';
  alignment.defer=true;
  document.head.appendChild(alignment);

  function promptForBirthday(){
    const S=window.WT_V1_STORAGE;
    if(!S)return;
    const state=S.load();
    if(state.settings?.birthday)return;
    const settingsButton=document.getElementById('settingsButton');
    const birthday=document.getElementById('birthday');
    if(!settingsButton||!birthday)return;
    settingsButton.click();
    setTimeout(()=>{
      birthday.focus();
      const toast=document.getElementById('toast');
      if(toast){
        toast.textContent='Add your birthday for birthday badges. It saves as soon as you select it.';
        toast.classList.add('show');
        clearTimeout(toast._birthdayTimer);
        toast._birthdayTimer=setTimeout(()=>toast.classList.remove('show'),4200);
      }
    },100);
  }
  window.addEventListener('load',()=>setTimeout(promptForBirthday,700),{once:true});
})();
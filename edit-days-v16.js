(function(){
  function makeIsoForDay(key){
    const [y,m,d]=key.split('-').map(Number);
    const now=new Date();
    return new Date(y,m-1,d,now.getHours(),now.getMinutes(),now.getSeconds()).toISOString();
  }

  function saveAndRefresh(){
    saveState(state);
    render();
  }

  function addDrinkToDay(key){
    const raw=prompt('Ounces to add to this day:');
    const oz=Number(raw);
    if(!oz||oz<1){return;}
    state.days[key]=state.days[key]||{drinks:[]};
    state.days[key].drinks.push({id:uid(),oz:oz,label:'Manual edit',at:makeIsoForDay(key)});
    saveAndRefresh();
    openDayDialog(key);
    toast('Added '+oz+' oz to that day');
  }

  function deleteDrinkFromDay(key,id){
    const day=state.days[key];
    if(!day)return;
    if(!confirm('Delete this drink entry?'))return;
    day.drinks=day.drinks.filter(function(drink){return drink.id!==id;});
    saveAndRefresh();
    openDayDialog(key);
    toast('Entry deleted');
  }

  function resetDay(key){
    if(!confirm('Reset this day to 0 oz?'))return;
    state.days[key]={drinks:[]};
    saveAndRefresh();
    openDayDialog(key);
    toast('Day reset');
  }

  const originalOpenDayDialog=window.openDayDialog||openDayDialog;
  window.openDayDialog=function(key){
    originalOpenDayDialog(key);
    setTimeout(function(){
      const box=document.getElementById('dayDetails');
      if(!box)return;
      const actions=document.createElement('div');
      actions.className='actions';
      const add=document.createElement('button');
      add.className='primary';
      add.type='button';
      add.textContent='+ Drink to this day';
      add.onclick=function(){addDrinkToDay(key);};
      const reset=document.createElement('button');
      reset.className='ghost danger';
      reset.type='button';
      reset.textContent='Reset Day';
      reset.onclick=function(){resetDay(key);};
      actions.appendChild(add);
      actions.appendChild(reset);
      box.prepend(actions);

      const drinks=[...(state.days[key]?.drinks||[])].reverse();
      const rows=box.querySelectorAll('.drink');
      rows.forEach(function(row,index){
        const drink=drinks[index];
        if(!drink||!drink.id)return;
        const del=document.createElement('button');
        del.className='ghost danger';
        del.type='button';
        del.textContent='Delete';
        del.style.flex='0 0 auto';
        del.onclick=function(){deleteDrinkFromDay(key,drink.id);};
        row.appendChild(del);
      });
    },0);
  };

  window.WATER_TRACKER_BUILD.version='2026-06-22.16';
})();

(function(){
  function dayKey(date=new Date()){
    const y=date.getFullYear();
    const m=String(date.getMonth()+1).padStart(2,'0');
    const d=String(date.getDate()).padStart(2,'0');
    return `${y}-${m}-${d}`;
  }

  function dateFromKey(key){
    const [y,m,d]=String(key).split('-').map(Number);
    return new Date(y,m-1,d);
  }

  function isoForDay(key,date=new Date()){
    const base=dateFromKey(key);
    base.setHours(date.getHours(),date.getMinutes(),date.getSeconds(),date.getMilliseconds());
    return base.toISOString();
  }

  function formatTime(value){
    const d=new Date(value);
    return Number.isNaN(d.getTime())?'Unknown time':d.toLocaleTimeString([], {hour:'numeric',minute:'2-digit'});
  }

  window.WT_V1_DATE={dayKey,dateFromKey,isoForDay,formatTime};
})();
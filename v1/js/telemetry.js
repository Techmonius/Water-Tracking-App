(function(){
  const ENDPOINT='https://script.google.com/macros/s/AKfycbykCIKxRnB_gQC0IOHrl3X5wSfAdC6chsxeJQSlO1wsd762PlF_oWEvt5JDjH1xGIZb-A/exec';
  const C=window.WT_V1_CONFIG;
  function uid(){return crypto?.randomUUID?.()||String(Date.now()+Math.random());}
  function installId(){let id=localStorage.getItem(C.telemetryInstallKey);if(!id){id=uid();localStorage.setItem(C.telemetryInstallKey,id);}return id;}
  function device(){const u=navigator.userAgent||'';return/iPhone|iPad|iPod/i.test(u)?'iOS':/Android/i.test(u)?'Android':'Other';}
  function birthday(){try{return window.WT_V1_STORAGE?.load?.().settings?.birthday||'';}catch{return'';}}
  function track(event,data={}){const now=new Date(),bday=birthday();const payload={event,label:event.replaceAll('_',' '),summary:event.replaceAll('_',' '),data:{...data,birthday:bday||null},installId:installId(),birthday:bday||null,sessionId:sessionStorage.wtV1Session||(sessionStorage.wtV1Session=uid()),version:C.appVersion,device:device(),standalone:Boolean(matchMedia?.('(display-mode: standalone)').matches),localDate:now.toLocaleDateString(),localTime:now.toLocaleTimeString(),timestamp:now.toISOString()};try{fetch(ENDPOINT,{method:'POST',mode:'no-cors',headers:{'Content-Type':'text/plain;charset=utf-8'},body:JSON.stringify(payload),keepalive:true}).catch(()=>{});}catch{}}
  window.WT_V1_TELEMETRY={track,installId};
})();
(function(){
  const D=window.WT_V1_DATE,S=window.WT_V1_STORAGE,H=window.WT_V1_HYDRATION;
  let painting=false,queued=false;
  function api(){return H.createApi(S.load(),()=>{});}
  function paint(){
    if(painting)return;painting=true;
    const A=api(),today=D.dayKey();
    const history=document.getElementById('history');
    if(history){
      const cells=[...history.querySelectorAll('.day')];let sum=0;
      for(let i=6;i>=0;i--){
        const index=6-i,d=new Date();d.setDate(d.getDate()-i);
        const key=D.dayKey(d),oz=A.totalFor(key),goal=A.goalFor(key),pct=goal?Math.round(oz/goal*100):0;
        sum+=oz;
        const b=cells[index];if(!b)continue;
        b.className='day'+(oz>=goal?' met':pct>=80?' close':'')+(key===today?' today':'');
        b.innerHTML='<div><div class="dow">'+d.toLocaleDateString(undefined,{weekday:'short'})+'</div><div class="oz">'+oz+'</div><div class="pct">'+pct+'%</div></div>';
      }
      const avg=document.getElementById('weeklyAverage');if(avg)avg.textContent='Avg '+Math.round(sum/7)+' oz';
    }
    const month=document.getElementById('monthGrid');
    if(month){
      const now=new Date(),year=now.getFullYear(),m=now.getMonth(),first=new Date(year,m,1),last=new Date(year,m+1,0);
      const buttons=[...month.querySelectorAll('.monthCell')];
      for(let n=1;n<=last.getDate();n++){
        const d=new Date(year,m,n),key=D.dayKey(d),oz=A.totalFor(key),goal=A.goalFor(key),b=buttons[n-1];if(!b)continue;
        b.className='monthCell'+(oz>=goal?' met':oz>0?' partial':'')+(key===today?' today':'');
        b.innerHTML='<span class="monthDay">'+n+'</span>';
        b.setAttribute('aria-label',d.toLocaleDateString()+' '+oz+' ounces');
      }
    }
    painting=false;
  }
  function queue(){if(queued)return;queued=true;requestAnimationFrame(()=>{queued=false;paint();});}
  const observer=new MutationObserver(m=>{if(painting)return;if(m.some(x=>x.target.id==='history'||x.target.id==='monthGrid'||x.target.closest?.('#history,#monthGrid')))queue();});
  const root=document.querySelector('main.app');if(root)observer.observe(root,{subtree:true,childList:true,characterData:true});
  window.addEventListener('storage',queue);window.addEventListener('wt-data-changed',queue);
  setTimeout(paint,0);setTimeout(paint,250);
})();
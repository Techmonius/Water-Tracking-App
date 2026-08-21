(function(){
const S=WT_V1_STORAGE,H=WT_V1_HYDRATION,E=WT_V1_ENGAGEMENT;
const api=()=>H.createApi(S.load(),()=>{});
const asset=stage=>'v1/assets/plants/stage-'+(stage+1)+'.webp';
const DROP_COUNTS={dry:0,damp:3,moist:6,watered:10};
let busy=false;

function dropletMarkup(moisture){
  const count=DROP_COUNTS[moisture]??0;
  let html='';
  for(let i=0;i<count;i++) html+='<i class="plantDrop plantDropSmall drop-'+(i+1)+'"></i>';
  for(let i=0;i<count;i++) html+='<i class="plantDrop plantDropLarge drop-'+(i+1)+'"></i>';
  return html;
}

function flowerPixel(r,g,b,a,y,h){
  if(a<40||y>h*.70)return false;
  const pink=r>140&&r>g*1.10&&b>65&&r-b<165;
  const yellow=r>170&&g>115&&b<135&&r>g*1.03;
  return pink||yellow;
}

function buildFlowerPulses(scene,img,stage,ratio){
  const layer=scene.querySelector('.flowerPulseLayer');
  if(!layer||stage<5||!img.naturalWidth||!img.naturalHeight)return;
  const w=img.naturalWidth,h=img.naturalHeight;
  const src=document.createElement('canvas');src.width=w;src.height=h;
  const sctx=src.getContext('2d',{willReadFrequently:true});
  sctx.drawImage(img,0,0,w,h);
  const data=sctx.getImageData(0,0,w,h),px=data.data;
  const mask=new Uint8Array(w*h);
  for(let y=0;y<h;y++)for(let x=0;x<w;x++){
    const k=(y*w+x)*4;
    if(flowerPixel(px[k],px[k+1],px[k+2],px[k+3],y,h))mask[y*w+x]=1;
  }
  const seen=new Uint8Array(w*h),components=[];
  for(let y=0;y<h;y++)for(let x=0;x<w;x++){
    const start=y*w+x;if(!mask[start]||seen[start])continue;
    const q=[start];seen[start]=1;let minX=x,maxX=x,minY=y,maxY=y,count=0;
    for(let qi=0;qi<q.length;qi++){
      const p=q[qi],cy=Math.floor(p/w),cx=p-cy*w;count++;
      if(cx<minX)minX=cx;if(cx>maxX)maxX=cx;if(cy<minY)minY=cy;if(cy>maxY)maxY=cy;
      for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){
        if(!dx&&!dy)continue;const nx=cx+dx,ny=cy+dy;if(nx<0||ny<0||nx>=w||ny>=h)continue;
        const n=ny*w+nx;if(mask[n]&&!seen[n]){seen[n]=1;q.push(n);}
      }
    }
    if(count>=3)components.push({minX,maxX,minY,maxY,count});
  }
  const hydration=Math.max(0,Math.min(1,Number(ratio)||0));
  const period=hydration>0?1/hydration:0;
  components.forEach((c,i)=>{
    const pad=1,x0=Math.max(0,c.minX-pad),y0=Math.max(0,c.minY-pad),x1=Math.min(w-1,c.maxX+pad),y1=Math.min(h-1,c.maxY+pad);
    const cw=x1-x0+1,ch=y1-y0+1,canvas=document.createElement('canvas');canvas.width=cw;canvas.height=ch;canvas.className='flowerPulse';
    const ctx=canvas.getContext('2d'),out=ctx.createImageData(cw,ch),op=out.data;
    for(let yy=y0;yy<=y1;yy++)for(let xx=x0;xx<=x1;xx++){
      const idx=yy*w+xx;if(!mask[idx])continue;
      const k=idx*4,d=((yy-y0)*cw+(xx-x0))*4;
      op[d]=px[k];op[d+1]=px[k+1];op[d+2]=px[k+2];op[d+3]=px[k+3];
    }
    ctx.putImageData(out,0,0);
    canvas.style.left=(x0/w*100)+'%';canvas.style.top=(y0/h*100)+'%';canvas.style.width=(cw/w*100)+'%';canvas.style.height=(ch/h*100)+'%';
    const displayedWidth=Math.max(8,cw/w*174),scale=1+2/displayedWidth;
    canvas.style.setProperty('--flower-scale',scale.toFixed(4));
    if(period>0){canvas.style.setProperty('--flower-period',period.toFixed(3)+'s');canvas.style.animationDelay=(-period*(i/(Math.max(1,components.length)*2))).toFixed(3)+'s';}
    else canvas.classList.add('flowerStill');
    layer.appendChild(canvas);
  });
}

async function render(){
  if(busy)return;
  busy=true;
  try{
    const A=api();
    const p=E.plant(A);
    const box=document.getElementById('plantBox');
    const name=document.getElementById('plantName');
    if(!box)return;
    const stages=E.PLANT_STAGES||[];
    const next=stages[p.stage+1];
    const min=stages[p.stage]?.minGoalDays||0;
    const max=next?.minGoalDays||Math.max(min+1,p.goalDays);
    const progress=next?Math.max(0,Math.min(100,((p.goalDays-min)/(max-min))*100)):100;
    const moisture=String(p.moisture||'dry').replace(/[^a-z0-9_-]/gi,'');
    if(name)name.textContent=p.name;
    box.className='plant spritePlant staticConceptPlant moisture-'+moisture;
    box.dataset.moisture=moisture;
    box.dataset.stage=String(p.stage);
    box.innerHTML='<div class="spritePlantScene staticConceptScene moisture-'+moisture+'" data-moisture="'+moisture+'"><img class="plantConceptArt" src="'+asset(p.stage)+'" alt="'+p.name+' plant"><div class="flowerPulseLayer" aria-hidden="true"></div><div class="plantEffectLayer" aria-hidden="true">'+dropletMarkup(moisture)+'</div></div><div><p class="plantCondition">'+p.moistureText+'</p><p class="plantMeta">Today: '+p.today+' / '+p.goal+' oz</p><p class="plantMeta">'+p.goalDays+' goal days'+(next?' · next: '+next.name+' at '+next.minGoalDays:' · fully grown')+'</p><div class="plantGrowthTrack"><span style="width:'+progress+'%"></span></div></div>';
    const scene=box.querySelector('.spritePlantScene'),img=box.querySelector('.plantConceptArt');
    const makeFlowers=()=>buildFlowerPulses(scene,img,p.stage,p.ratio);
    if(img.complete)requestAnimationFrame(makeFlowers);else img.addEventListener('load',makeFlowers,{once:true});
  }finally{busy=false;}
}
['storage','wt-data-changed','wt-plant-render'].forEach(t=>window.addEventListener(t,render));
render();setTimeout(render,300);
})();
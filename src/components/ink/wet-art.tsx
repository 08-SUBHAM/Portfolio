import { useEffect, useRef, useState } from 'react';
import { wetSurface } from './wet-surface';
/** Image-only lens; captions, button labels and focus rings remain ordinary DOM. */
export function WetArt({ src, alt, className = '' }: { src: string; alt: string; className?: string }) {
  const root=useRef<HTMLDivElement>(null), canvas=useRef<HTMLCanvasElement>(null);
  const [ready,setReady]=useState(false);
  useEffect(()=>{
    const scope=root.current, output=canvas.current;
    if(!scope||!output||window.matchMedia('(prefers-reduced-motion: reduce)').matches)return;
    // Pixels are only read from same-origin hosted copies; anything else stays a plain image.
    if(new URL(src,window.location.href).origin!==window.location.origin)return;
    let cancelled=false,dispose=()=>{};
    const image=new Image();image.src=src;
    void image.decode().then(()=>{
      if(cancelled)return;
      const source=document.createElement('canvas');
      // Untransformed layout box (a tilt or entry transform must not shrink the copy), at screen density.
      const width=scope.offsetWidth||scope.getBoundingClientRect().width, height=scope.offsetHeight||scope.getBoundingClientRect().height, aspect=width/Math.max(1,height);
      source.width=Math.min(1800,image.naturalWidth,Math.round(width*Math.min(2,window.devicePixelRatio||1)));source.height=Math.round(source.width/aspect);output.dataset['source']=`${source.width}x${source.height}`;
      const ctx=source.getContext('2d');if(!ctx)return;
      const scale=Math.max(source.width/image.naturalWidth,source.height/image.naturalHeight);
      ctx.drawImage(image,(source.width-image.naturalWidth*scale)/2,(source.height-image.naturalHeight*scale)/2,image.naturalWidth*scale,image.naturalHeight*scale);
      // Source and output share exactly the same aspect ratio as the original image.
      dispose=wetSurface(source,output,scope,undefined,{fade:true});setReady(true);
    }).catch(()=>{});
    return()=>{cancelled=true;dispose();};
  },[src]);
  return <div ref={root} className={`wet-art faded ${className}`} data-wet-art={ready?'ready':'static'}><img src={src} alt={alt} loading="lazy" className="h-full w-full object-cover"/><canvas ref={canvas} className="wet-output" aria-hidden="true"/></div>;
}

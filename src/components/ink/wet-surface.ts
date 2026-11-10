import { onInkFrame } from './ink-clock';
import { washStamps } from './watercolor-stamps';
import brushUrl from '@/assets/pigment-brush.png';
let brushImage: HTMLImageElement | null = null;
/** The real hand-painted pigment stroke, sampled slice by slice as the loaded brush body. */
const pigmentBrush = () => { if (!brushImage) { brushImage = new Image(); brushImage.src = brushUrl; } return brushImage.complete && brushImage.naturalWidth ? brushImage : null; };
import { settle, clampVelocity, TRAIL_DECAY, pointerMoved } from './wet-math';

const vertex = `attribute vec2 position; varying vec2 uv; void main(){uv=position*.5+.5;gl_Position=vec4(position,0.,1.);}`;
const fragment = `precision mediump float;
varying vec2 uv; uniform sampler2D art; uniform sampler2D brush; uniform vec2 size; uniform float time; uniform vec2 velocity; uniform vec2 lean; uniform float press; uniform float fade;
float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float noise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(hash(i),hash(i+vec2(1.,0.)),f.x),mix(hash(i+vec2(0.,1.)),hash(i+1.),f.x),f.y);}
void main(){
 vec2 q=vec2(uv.x,1.-uv.y); vec4 base=texture2D(art,q);
 float density=1.-dot(base.rgb,vec3(.299,.587,.114));
 float depth=.12+.88*smoothstep(.12,.85,density);
 vec2 field=vec2(noise(q*4.+vec2(time*.018,0.)),noise(q*4.+vec2(8.,time*.014)))-.5;
 vec2 px=1./size;
 float wet=texture2D(brush,q).a;
 float around=(texture2D(brush,q+vec2(4.,0.)*px).a+texture2D(brush,q-vec2(4.,0.)*px).a+texture2D(brush,q+vec2(0.,4.)*px).a+texture2D(brush,q-vec2(0.,4.)*px).a)*.25;
 float rim=clamp((wet-around)*2.6,0.,1.);
 vec2 fibres=vec2(noise(q*size*.065+time*.12),noise(q*size*.049+7.))-.5;
 vec2 offset=wet*(fibres*12.*px+velocity*.004)*(1.+press*.3)+field*wet*6.*px;
 vec4 pigment=texture2D(art,clamp(q+offset,vec2(.001),vec2(.999)));
 float grey=dot(pigment.rgb,vec3(.299,.587,.114));
 pigment.rgb=mix(vec3(grey),pigment.rgb,1.+wet*.35);
 pigment.rgb=mix(pigment.rgb,(pigment.rgb-.5)*1.45+.5,wet*.55);
 float load=clamp(wet*.62+rim*.38,0.,.82);
 // Sumi deepens light passages; over near-black rock the same stroke reads as a translucent warm-grey wash.
 float dark=smoothstep(.62,.9,density);
 vec3 inkTone=mix(vec3(.08,.07,.06)+pigment.rgb*.3,vec3(.50,.46,.41)-rim*.32,dark);
 pigment.rgb=mix(pigment.rgb,inkTone,load);
 if(fade>.5){
  vec3 c=base.rgb; float l=dot(c,vec3(.2126,.7152,.0722)); c=mix(vec3(l),c,.35);
  float a=.18; c=vec3(dot(c,vec3(.393+.607*(1.-a),.769*a,.189*a)),dot(c,vec3(.349*a,.686+.314*(1.-a),.168*a)),dot(c,vec3(.272*a,.534*a,.131+.869*(1.-a))));
  c=((c-.5)*.8+.5)*1.06;
  vec4 raw=texture2D(art,clamp(q+offset,vec2(.001),vec2(.999)));
  float deep=step(1.5,fade); vec3 rich=(raw.rgb-.5)*(1.14+.3*deep)+.5-.08*deep; float rl=dot(rich,vec3(.299,.587,.114)); rich=mix(vec3(rl),rich,.9)*.97;
  float gran=noise(q*size*.11)*.6+noise(q*size*.023+3.)*.4; float paint=smoothstep(.02,.4,wet*(.7+.6*gran));
  // On the open washi of the mural the wash also lays down translucent sumi, mottled by paper grain.
  rich=mix(rich,rich*vec3(.6,.57,.54),deep*(.25+.35*gran)*smoothstep(.0,.8,wet));
  rich=mix(rich,vec3(.12,.10,.09),rim*.16); rich=mix(rich,vec3(.72,.28,.18),rim*.03*step(.5,fibres.x+.5));
  pigment.rgb=mix(c,rich,paint); pigment.a=mix(base.a,min(1.,raw.a*(1.15+.7*deep)),paint);
  // Over bare washi (transparent mural pixels) the wash itself is the pigment: mottled, granular sumi with darker dried edges.
  float wa=deep*smoothstep(.0,.55,wet)*(.14+.3*gran+.3*rim); float na=pigment.a+wa*(1.-pigment.a);
  pigment.rgb=(pigment.rgb*pigment.a+vec3(.22,.2,.19)*wa*(1.-pigment.a))/max(na,.001); pigment.a=na;
 }
 pigment.rgb=clamp(pigment.rgb,0.,1.);
 gl_FragColor=pigment;
}`;

export interface WetMotion { x: number; y: number; scroll: number; time: number }
/** The source stays a Canvas2D/static fallback; only this pigment sibling is processed. */
export function wetSurface(source: HTMLCanvasElement, output: HTMLCanvasElement, scope: HTMLElement, before?: (motion: WetMotion) => void, options: { trail?: boolean; fade?: boolean; hold?: () => boolean; ignore?: (target: EventTarget | null) => boolean; attach?: boolean } = {}) {
  const trail = options.trail ?? true;
  const media = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (media.matches) { output.dataset['renderer'] = 'static'; return () => {}; }
  const gl = output.getContext('webgl', { alpha: true, premultipliedAlpha: false, antialias: false, preserveDrawingBuffer: false });
  if (!gl) { output.dataset['renderer'] = 'canvas2d'; return () => {}; }
  const compile = (type: number, text: string) => { const shader = gl.createShader(type); if (!shader) return null; gl.shaderSource(shader,text); gl.compileShader(shader); if (!gl.getShaderParameter(shader,gl.COMPILE_STATUS)) { gl.deleteShader(shader); return null; } return shader; };
  const vs=compile(gl.VERTEX_SHADER,vertex), fs=compile(gl.FRAGMENT_SHADER,fragment), program=gl.createProgram();
  if (!vs || !fs || !program) return () => {};
  gl.attachShader(program,vs);gl.attachShader(program,fs);gl.linkProgram(program);
  if (!gl.getProgramParameter(program,gl.LINK_STATUS)) return () => {};
  gl.useProgram(program);
  const buffer=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buffer);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]),gl.STATIC_DRAW);
  const pos=gl.getAttribLocation(program,'position');gl.enableVertexAttribArray(pos);gl.vertexAttribPointer(pos,2,gl.FLOAT,false,0,0);
  const texture=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,texture);
  gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);
  const brushTexture=gl.createTexture();gl.activeTexture(gl.TEXTURE1);gl.bindTexture(gl.TEXTURE_2D,brushTexture);
  gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);
  gl.uniform1i(gl.getUniformLocation(program,'brush'),1);gl.uniform1i(gl.getUniformLocation(program,'art'),0);
  const ink=document.createElement('canvas');const inkCtx=ink.getContext('2d',{willReadFrequently:true});
  if(!inkCtx)return()=>{};
  const uniforms = Object.fromEntries(['size','time','velocity','lean','press','fade'].map(k=>[k,gl.getUniformLocation(program,k)]));
  let tx=.5,ty=.5,x=.5,y=.5,vx=0,vy=0,strength=0,target=0,pressed=0,visible=true,last=0,revision='',frames=0,clock=0;
  let drawing=false,first=true,stamp=0,inkAt=-1e9,lastCX=NaN,lastCY=NaN,travel=0,carry=0,pendingDy=0,lastSY=window.scrollY;
  const scratch=document.createElement('canvas');
  const move=(e: PointerEvent) => {
    if(e.pointerType!=='mouse' && !e.buttons && e.type!=='pointerdown') return;
    // Browsers re-send pointer events at an unchanged screen position after scrolling; those never paint.
    const moved=e.type==='pointerdown'||pointerMoved(lastCX,lastCY,e.clientX,e.clientY);lastCX=e.clientX;lastCY=e.clientY;
    if(!moved)return; if(options.ignore?.(e.target)){target=0;drawing=false;first=true;return;} const b=scope.getBoundingClientRect(); if(e.clientX<b.left||e.clientX>b.right||e.clientY<b.top||e.clientY>b.bottom){target=0;drawing=false;first=true;return;} tx=(e.clientX-b.left)/b.width;ty=(e.clientY-b.top)/b.height;if(first){x=tx;y=ty;carry=0;first=false;}target=1;drawing=true;pressed=e.buttons?1:0; };
  const leave=()=>{target=0;pressed=0;drawing=false;first=true;};
  // Scrolling moves the art under a resting cursor: break the stroke so nothing is drawn by scroll alone.
  const scrolled=()=>{if(options.attach){pendingDy+=window.scrollY-lastSY;lastSY=window.scrollY;drawing=false;}x=tx;y=ty;first=true;};window.addEventListener('scroll',scrolled,{passive:true});
  const observer=new IntersectionObserver(entries=>{visible=entries.some(e=>e.isIntersecting);if(!visible)leave();},{rootMargin:'80px'}); observer.observe(scope);
  window.addEventListener('pointermove',move,{passive:true});window.addEventListener('pointerdown',move,{passive:true});window.addEventListener('pointerup',leave,{passive:true});window.addEventListener('pointercancel',leave,{passive:true});document.addEventListener('pointerleave',leave);
  const stop=onInkFrame(({now,dt})=>{
    if(media.matches || !visible){output.dataset['loop']='paused';if(media.matches){source.style.visibility='';output.style.visibility='hidden';}return;}
    if(now-last<(window.innerWidth<768?33:16))return;
    const step=Math.min(.05,(now-(last||now))/1000)||dt;last=now;clock+=step;
    const ox=x,oy=y;x=settle(x,tx,step,18);y=settle(y,ty,step,18);
    vx=settle(vx,clampVelocity((x-ox)/Math.max(step,.001)),step,8);vy=settle(vy,clampVelocity((y-oy)/Math.max(step,.001)),step,8);
    strength=settle(strength,target,step,target?5:1.4);
    before?.({x:(x-.5)*strength,y:(y-.5)*strength,scroll:0,time:clock});
    // Layout size, not the tilted on-screen box: a hover tilt must never resize (and wipe) the brush layer.
    const b={width:output.offsetWidth||output.getBoundingClientRect().width,height:output.offsetHeight||output.getBoundingClientRect().height};
    const ratio=Math.min(window.devicePixelRatio||1,2,Math.sqrt((trail&&!options.attach?1100000:520000)/Math.max(1,b.width*b.height)));
    const w=Math.max(1,Math.round(b.width*ratio)),h=Math.max(1,Math.round(b.height*ratio));
    if(output.width!==w||output.height!==h){output.width=w;output.height=h;ink.width=w;ink.height=h;revision='';}
    if(ink.width!==w||ink.height!==h){ink.width=w;ink.height=h;}
    // A page-attached brush layer travels with the artwork, so trails never smear into bands on scroll.
    if(pendingDy&&ink.width&&ink.height){scratch.width=w;scratch.height=h;const sc=scratch.getContext('2d');if(sc){sc.drawImage(ink,0,0);inkCtx.clearRect(0,0,w,h);inkCtx.drawImage(scratch,0,-pendingDy*h/Math.max(1,b.height));}pendingDy=0;}
    inkCtx.globalCompositeOperation='destination-out';inkCtx.globalAlpha=1-Math.exp(-TRAIL_DECAY*step);inkCtx.fillStyle='white';inkCtx.fillRect(0,0,w,h);
    inkCtx.globalCompositeOperation='source-over';
    if(trail && drawing && Math.hypot((x-ox)*w,(y-oy)*h)>.3){
      // A loaded watercolour brush: overlapping irregular wash blotches, a dry-brush texture pass and pigment pools.
      const angle=Math.atan2((y-oy)*h,(x-ox)*w), seg=Math.hypot((x-ox)*w,(y-oy)*h);
      const speed=Math.min(1,seg/(step*Math.max(w,h)*1.2+1e-3));
      const width=Math.max(34,b.height*(.13+.07*Math.sin(travel*.004+1)))*ratio*(1+pressed*.2);
      const stamps=washStamps(), tex=pigmentBrush(), spacing=width*.2;
      carry+=seg; let t0=0;
      while(carry>=spacing){
        carry-=spacing; t0=Math.min(1,t0+spacing/seg); stamp++;inkAt=clock;travel+=spacing;
        const px0=ox*w+(x-ox)*w*t0, py0=oy*h+(y-oy)*h*t0, n=stamp*.37;
        // Low-frequency wander of pressure, offset and rotation keeps repeats invisible; slow strokes carry more pigment.
        const load=(.75+.25*Math.sin(n*.9))*(1.05-.55*speed), size=width*(.75+.35*Math.sin(n*.53+2)+.15*Math.sin(n*1.9));
        const off=width*.22*Math.sin(n*.71), nx=-Math.sin(angle)*off, ny=Math.cos(angle)*off;
        if(stamps.length){
          inkCtx.save();inkCtx.translate(px0+nx,py0+ny);inkCtx.rotate(angle+.5*Math.sin(n*1.3));
          inkCtx.globalAlpha=.42*load;inkCtx.drawImage(stamps[stamp%6]!,-size*.95,-size*.65,size*1.9,size*1.3);
          inkCtx.restore();
        }
        // Every few marks, the whole painted stroke texture drags dry-brush streaks through the wash.
        if(tex&&stamp%5===0){
          inkCtx.save();inkCtx.translate(px0,py0);inkCtx.rotate(angle+.12*Math.sin(n));inkCtx.scale(stamp%10?1:-1,Math.sin(n*2.3)>0?1:-1);
          inkCtx.globalAlpha=.2*(.6+.4*speed);inkCtx.drawImage(tex,40,180,1470,620,-width*.9,-width*.38,width*1.8,width*.76);
          inkCtx.restore();
        }
        // Where the brush lingers, pigment pools into darker irregular blooms.
        if(stamps.length>6&&((speed<.25&&stamp%4===0)||Math.sin(stamp*12.9898)>.93)){
          const r=width*(.18+.3*Math.abs(Math.sin(n*3.1))), side=width*.3*Math.sin(n*2.7);
          inkCtx.globalAlpha=.4*load;inkCtx.drawImage(stamps[6+stamp%3]!,px0-Math.sin(angle)*side-r/2,py0+Math.cos(angle)*side-r/2,r,r);
        }
      }
    }
    inkCtx.globalAlpha=1;
    output.dataset['brush']=`${stamp}`;
    if(!source.width||!source.height)return;
    // While the page is scrolling the caller's own synchronously drawn source is shown, so no stale GL frame can lag behind as a band.
    if(options.hold?.()&&clock-inkAt>6){source.style.visibility='';output.style.visibility='hidden';output.dataset['loop']='held';return;}
    // Once a trail has fully bled away, show the untouched original image instead of a resampled copy.
    if(trail && clock-inkAt>6){if(output.style.visibility!=='hidden'){inkCtx.clearRect(0,0,w,h);source.style.visibility='';output.style.visibility='hidden';}output.dataset['loop']='idle';return;}
    gl.viewport(0,0,w,h);
    const next=source.dataset['revision']||'initial';
    gl.activeTexture(gl.TEXTURE0);
    if(next!==revision){gl.bindTexture(gl.TEXTURE_2D,texture);gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL,false);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,source);revision=next;}
    gl.activeTexture(gl.TEXTURE1);gl.bindTexture(gl.TEXTURE_2D,brushTexture);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,ink);
    gl.uniform2f(uniforms['size']??null,w,h);gl.uniform1f(uniforms['time']??null,clock);gl.uniform2f(uniforms['velocity']??null,vx,vy);gl.uniform2f(uniforms['lean']??null,0,0);gl.uniform1f(uniforms['press']??null,pressed);gl.uniform1f(uniforms['fade']??null,options.fade?(options.attach?2:1):0);
    gl.drawArrays(gl.TRIANGLES,0,6);source.style.visibility='hidden';output.style.visibility='visible';output.dataset['renderer']='webgl';output.dataset['loop']='running';output.dataset['frames']=String(++frames);output.dataset['lean']=`${((x-.5)*strength).toFixed(3)},${((y-.5)*strength).toFixed(3)}`;
  });
  const lost=(e:Event)=>{e.preventDefault();source.style.visibility='';output.style.visibility='hidden';stop();output.dataset['renderer']='canvas2d';};output.addEventListener('webglcontextlost',lost);
  return ()=>{stop();observer.disconnect();window.removeEventListener('scroll',scrolled);window.removeEventListener('pointermove',move);window.removeEventListener('pointerdown',move);window.removeEventListener('pointerup',leave);window.removeEventListener('pointercancel',leave);document.removeEventListener('pointerleave',leave);output.removeEventListener('webglcontextlost',lost);gl.deleteTexture(texture);gl.deleteTexture(brushTexture);gl.deleteBuffer(buffer);gl.deleteProgram(program);gl.deleteShader(vs);gl.deleteShader(fs);source.style.visibility='';};
}

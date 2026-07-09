/**
 * Premium Birthday Website — script.js
 * Pure Vanilla JS | No frameworks | 60fps animations
 */

/* ─────────────── UTILS ─────────────── */
const $ = id => document.getElementById(id);
const rand = (a,b) => Math.random()*(b-a)+a;
const randInt = (a,b) => Math.floor(rand(a,b));
const wait = ms => new Promise(r => setTimeout(r,ms));
const prefersReducedMotion = () => window.matchMedia('(prefers-reduced-motion:reduce)').matches;

/* ─────────────── RAF LOOP ─────────────── */
const RAF_CALLBACKS = new Set();
function addRAF(fn){ RAF_CALLBACKS.add(fn) }
function removeRAF(fn){ RAF_CALLBACKS.delete(fn) }
let _rafRunning = false;
function startRAF(){
  if(_rafRunning) return; _rafRunning = true;
  function loop(ts){ requestAnimationFrame(loop); RAF_CALLBACKS.forEach(fn=>fn(ts)); }
  requestAnimationFrame(loop);
}
startRAF();

/* ─────────────── CANVAS SETUP ─────────────── */
const particleCanvas = $('particleCanvas');
const confettiCanvas = $('confettiCanvas');
const cursorCanvas   = $('cursorCanvas');
const pCtx  = particleCanvas.getContext('2d');
const cCtx  = confettiCanvas.getContext('2d');
const curCtx= cursorCanvas.getContext('2d');

function resizeAll(){
  [particleCanvas,confettiCanvas,cursorCanvas].forEach(c=>{
    c.width = window.innerWidth; c.height = window.innerHeight;
  });
}
resizeAll();
window.addEventListener('resize', resizeAll);

/* ─────────────── CURSOR TRAIL ─────────────── */
const trailHearts = [];
let mouseX=0,mouseY=0;
window.addEventListener('mousemove',e=>{
  mouseX=e.clientX; mouseY=e.clientY;
  if(Math.random()<.35) spawnTrailHeart(e.clientX,e.clientY);
});

function spawnTrailHeart(x,y){
  trailHearts.push({x,y,alpha:1,size:rand(8,16),vy:rand(-1.5,-0.5),vx:rand(-.5,.5),char:['💖','💕','✨','🌸'][randInt(0,4)]});
  if(trailHearts.length>60) trailHearts.shift();
}

addRAF(()=>{
  curCtx.clearRect(0,0,cursorCanvas.width,cursorCanvas.height);
  // custom cursor dot
  curCtx.beginPath();
  curCtx.arc(mouseX,mouseY,6,0,Math.PI*2);
  curCtx.fillStyle='rgba(230,57,80,.8)';
  curCtx.fill();
  curCtx.beginPath();
  curCtx.arc(mouseX,mouseY,10,0,Math.PI*2);
  curCtx.strokeStyle='rgba(212,175,55,.5)';
  curCtx.lineWidth=1.5;
  curCtx.stroke();
  // trail
  trailHearts.forEach((h,i)=>{
    h.x+=h.vx; h.y+=h.vy; h.alpha-=.025;
    curCtx.globalAlpha=Math.max(0,h.alpha);
    curCtx.font=`${h.size}px serif`;
    curCtx.fillText(h.char,h.x,h.y);
  });
  for(let i=trailHearts.length-1;i>=0;i--) if(trailHearts[i].alpha<=0) trailHearts.splice(i,1);
  curCtx.globalAlpha=1;
});

/* ─────────────── PARTICLES ─────────────── */
const particles=[];
let particlesOn=false;

function initParticles(){
  particles.length=0;
  const W=particleCanvas.width,H=particleCanvas.height;
  for(let i=0;i<120;i++){
    particles.push({x:rand(0,W),y:rand(0,H),r:rand(.8,2.5),alpha:rand(.2,.8),
      speed:rand(.002,.01),phase:rand(0,Math.PI*2),
      color:['#D4AF37','#e63950','#FFD6E0','#fff','#F5E6A3'][randInt(0,5)]});
  }
}
initParticles();

addRAF(ts=>{
  pCtx.clearRect(0,0,particleCanvas.width,particleCanvas.height);
  if(!particlesOn) return;
  const t=ts*.001;
  particles.forEach(p=>{
    const a=(Math.sin(t*p.speed*60+p.phase)*.5+.5)*p.alpha;
    pCtx.beginPath(); pCtx.arc(p.x,p.y,p.r,0,Math.PI*2);
    pCtx.fillStyle=p.color; pCtx.globalAlpha=a; pCtx.fill();
  });
  // ambient floating hearts
  if(Math.random()<.008) spawnAmbientHeart();
  ambientHearts.forEach(h=>{ h.x+=h.vx; h.y+=h.vy; h.alpha-=.003;
    pCtx.globalAlpha=Math.max(0,h.alpha); pCtx.font=`${h.size}px serif`; pCtx.fillText(h.char,h.x,h.y);
  });
  for(let i=ambientHearts.length-1;i>=0;i--) if(ambientHearts[i].alpha<=0) ambientHearts.splice(i,1);
  pCtx.globalAlpha=1;
});
const ambientHearts=[];
function spawnAmbientHeart(){
  const W=particleCanvas.width,H=particleCanvas.height;
  ambientHearts.push({x:rand(0,W),y:H+10,vx:rand(-.3,.3),vy:rand(-1,-0.4),
    size:rand(12,22),alpha:.7,char:['💖','💕','💗','🌸'][randInt(0,4)]});
}

/* ─────────────── CONFETTI ─────────────── */
const confettis=[];
let confettiOn=false;
const CONF_COLORS=['#D4AF37','#e63950','#FFD6E0','#c9184a','#fff','#F5E6A3','#ffb3c6'];

function spawnConfettiBurst(count=15){
  const W=confettiCanvas.width;
  for(let i=0;i<count;i++){
    confettis.push({x:rand(0,W),y:rand(-10,0),vx:rand(-2.5,2.5),vy:rand(4,9),
      rot:rand(0,Math.PI*2),rotV:rand(-.12,.12),w:rand(8,16),h:rand(5,10),
      color:CONF_COLORS[randInt(0,CONF_COLORS.length)],alpha:1});
  }
}

addRAF(()=>{
  const W=confettiCanvas.width,H=confettiCanvas.height;
  cCtx.clearRect(0,0,W,H);
  if(confettiOn && Math.random()<.6) spawnConfettiBurst(8);
  confettis.forEach(c=>{
    c.x+=c.vx; c.y+=c.vy; c.rot+=c.rotV;
    if(c.y>H*.85) c.alpha-=.018;
    cCtx.save(); cCtx.translate(c.x,c.y); cCtx.rotate(c.rot);
    cCtx.globalAlpha=Math.max(0,c.alpha); cCtx.fillStyle=c.color;
    cCtx.fillRect(-c.w/2,-c.h/2,c.w,c.h); cCtx.restore();
  });
  for(let i=confettis.length-1;i>=0;i--)
    if(confettis[i].alpha<=0||confettis[i].y>H+20) confettis.splice(i,1);
});

/* ─────────────── FIREWORKS ─────────────── */
function launchFirework(container){
  const W=window.innerWidth,H=window.innerHeight;
  const x=rand(W*.1,W*.9), y=rand(H*.05,H*.5);
  const colors=['#D4AF37','#e63950','#FFD6E0','#fff','#ffb3c6','#F5E6A3'];
  const burst=document.createElement('div');
  burst.style.cssText=`position:absolute;left:${x}px;top:${y}px`;
  const n=randInt(18,30);
  for(let i=0;i<n;i++){
    const angle=(i/n)*Math.PI*2, dist=rand(60,140);
    const s=document.createElement('div');
    const col=colors[randInt(0,colors.length)];
    s.style.cssText=`position:absolute;width:5px;height:5px;border-radius:50%;
      background:${col};box-shadow:0 0 6px 2px ${col};
      --tx:${Math.cos(angle)*dist}px;--ty:${Math.sin(angle)*dist}px;--dur:${rand(.8,1.4)}s;
      animation:sparkFly var(--dur) ease-out forwards`;
    burst.appendChild(s);
  }
  // add keyframe if not present
  if(!document.querySelector('#sparkStyle')){
    const st=document.createElement('style'); st.id='sparkStyle';
    st.textContent=`@keyframes sparkFly{0%{transform:translate(0,0) scale(1);opacity:1}100%{transform:translate(var(--tx),var(--ty)) scale(.2);opacity:0}}`;
    document.head.appendChild(st);
  }
  container.appendChild(burst);
  setTimeout(()=>burst.remove(),1500);
}

function startFireworks(container,count=25){
  let n=0;
  const id=setInterval(()=>{ launchFirework(container); if(++n>=count) clearInterval(id); },200);
}

/* ─────────────── CLICK BURST ─────────────── */
document.addEventListener('click',e=>{
  if(e.target.closest('button')||e.target.closest('#musicPlayer')) return;
  createClickBurst(e.clientX,e.clientY);
});
function createClickBurst(x,y){
  const container=$('clickBurst');
  const items=['💖','💕','✨','🌸','💗'];
  for(let i=0;i<7;i++){
    const el=document.createElement('div');
    el.className='burst-heart';
    const angle=rand(0,Math.PI*2), dist=rand(30,70);
    el.textContent=items[randInt(0,items.length)];
    el.style.cssText=`left:${x}px;top:${y}px;--tx:${Math.cos(angle)*dist}px;--ty:${Math.sin(angle)*dist-30}px;--dur:${rand(.6,.9)}s;animation-delay:${i*.04}s`;
    container.appendChild(el);
    setTimeout(()=>el.remove(),900);
  }
}

/* ─────────────── BUTTON HELPERS ─────────────── */
function addRipple(btn){
  btn.addEventListener('click',function(e){
    const r=document.createElement('span'); r.className='ripple';
    const rect=this.getBoundingClientRect(), sz=Math.max(rect.width,rect.height);
    r.style.cssText=`width:${sz}px;height:${sz}px;left:${e.clientX-rect.left-sz/2}px;top:${e.clientY-rect.top-sz/2}px`;
    this.appendChild(r); setTimeout(()=>r.remove(),700);
  });
}

function showBtn(btn){
  btn.style.display='';
  btn.classList.remove('hidden');
  void btn.offsetWidth;
  btn.classList.add('btn-enter');
}
function hideBtn(btn){ btn.style.display='none'; btn.classList.add('hidden'); }

/* ─────────────── TYPEWRITER ─────────────── */
function typewrite(el,text,delay=60){
  return new Promise(res=>{
    el.innerHTML=''; let i=0;
    function next(){
      if(i>=text.length){ setTimeout(res,300); return; }
      const sp=document.createElement('span');
      sp.className='char';
      sp.textContent=text[i]===' '?'\u00A0':text[i];
      sp.style.animationDelay='0ms';
      el.appendChild(sp); i++;
      setTimeout(next,text[i-1]===' '?delay*.4:delay);
    }
    next();
  });
}

function fadeOut(el,duration=600){
  return new Promise(res=>{
    el.style.transition=`opacity ${duration}ms ease, transform ${duration}ms ease`;
    el.style.opacity='0'; el.style.transform='translateY(-16px)';
    setTimeout(()=>{ el.style.opacity=''; el.style.transform=''; el.innerHTML=''; res(); },duration);
  });
}

/* ─────────────── SCROLL PROGRESS ─────────────── */
window.addEventListener('scroll',()=>{
  const el=$('scrollBar'), rose=$('scrollRose');
  if(!el) return;
  const pct=window.scrollY/(document.documentElement.scrollHeight-window.innerHeight);
  el.style.height=(pct*100)+'%';
  rose.style.top=(pct*(document.documentElement.scrollHeight-window.innerHeight-20))+'px';
},{passive:true});

/* ─────────────── INTERSECTION OBSERVER (timeline) ─────────────── */
const tlObserver=new IntersectionObserver(entries=>{
  entries.forEach(e=>{ if(e.isIntersecting) e.target.classList.add('visible'); });
},{threshold:.2});

/* ─────────────── MUSIC ─────────────── */
const bgMusic=$('bgMusic');
const musicBtn=$('musicBtn');
const musicIcon=$('musicIcon');
let musicStarted=false;

/* ─────────────── UNIFIED PLAYER ─────────────── */
// Tracks which audio element is the "active" one in the background bar
let activeAudio = bgMusic;

function setActiveAudio(audio, label){
  // pause whatever was playing
  if(activeAudio !== audio && !activeAudio.paused){
    activeAudio.pause();
  }
  activeAudio = audio;
  $('musicLabel').textContent = label;
  updatePlayerBar();
}

function updatePlayerBar(){
  musicIcon.textContent = activeAudio.paused ? '▶' : '⏸';
  const pct = activeAudio.duration
    ? (activeAudio.currentTime / activeAudio.duration) * 100 : 0;
  $('musicBar').style.width = pct + '%';
}

// Progress bar updates for whichever is active
function onTimeUpdate(){
  if(!activeAudio.duration) return;
  const pct = (activeAudio.currentTime / activeAudio.duration) * 100;
  $('musicBar').style.width = pct + '%';
}
bgMusic.addEventListener('timeupdate', onTimeUpdate);
$('dedicatedSong').addEventListener('timeupdate', onTimeUpdate);

// Seek by clicking the progress bar in the music player
$('musicProgress').addEventListener('click', function(e){
  if(!activeAudio.duration) return;
  const rect = this.getBoundingClientRect();
  const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
  activeAudio.currentTime = ratio * activeAudio.duration;
});

// Main play/pause button controls whichever song is active
musicBtn.addEventListener('click', ()=>{
  if(activeAudio.paused){
    activeAudio.play().catch(()=>{});
    musicIcon.textContent = '⏸';
  } else {
    activeAudio.pause();
    musicIcon.textContent = '▶';
  }
});
bgMusic.addEventListener('play',  ()=>{ if(activeAudio===bgMusic) musicIcon.textContent='⏸'; });
bgMusic.addEventListener('pause', ()=>{ if(activeAudio===bgMusic) musicIcon.textContent='▶'; });
addRipple(musicBtn);

function startMusic(){
  if(musicStarted) return;
  musicStarted = true;
  setActiveAudio(bgMusic, 'Birthday Song 🎂');
  bgMusic.volume = 0;
  bgMusic.play().catch(()=>{});
  let v = 0;
  const fadeId = setInterval(()=>{
    v = Math.min(.75, v + .025); bgMusic.volume = v;
    if(v >= .75) clearInterval(fadeId);
  }, 150);
  $('musicPlayer').classList.remove('hidden');
}

// When birthday song ends → show card
bgMusic.addEventListener('ended', ()=>{
  musicIcon.textContent = '▶';
  setTimeout(openSongCard, 1200);
});

// Dedicated song button on music player
$('dedicateSongBtn').addEventListener('click', openSongCard);

/* ─────────────── DEDICATED SONG ─────────────── */
const dedicatedSong = $('dedicatedSong');
const songPlayBtn   = $('songPlayBtn');
const songPlayIcon  = $('songPlayIcon');
const vinylDisc     = $('vinylDisc');

function openSongCard(){
  const card = $('songRevealCard');
  card.classList.remove('hidden');
  void card.offsetWidth;
  card.classList.add('visible');
  spawnSongHearts();
  // sync card UI with current playback state
  syncCardUI();
}

function closeSongCard(){
  const card = $('songRevealCard');
  card.classList.remove('visible');
  setTimeout(()=> card.classList.add('hidden'), 600);
  // song keeps playing in background — do NOT pause
}

function syncCardUI(){
  // keep card progress in sync
  if(dedicatedSong.duration){
    const pct = (dedicatedSong.currentTime / dedicatedSong.duration) * 100;
    $('songProgFill').style.width = pct + '%';
    $('songCurrent').textContent = formatTime(dedicatedSong.currentTime);
    $('songDuration').textContent = formatTime(dedicatedSong.duration);
  }
  if(!dedicatedSong.paused){
    songPlayIcon.textContent = '⏸';
    vinylDisc.classList.add('spinning');
  } else {
    songPlayIcon.textContent = '▶';
    vinylDisc.classList.remove('spinning');
  }
}

$('songCardClose').addEventListener('click', closeSongCard);

// Play button inside card
songPlayBtn.addEventListener('click', ()=>{
  if(dedicatedSong.paused){
    // hand off to dedicated song in background player
    setActiveAudio(dedicatedSong, 'Laakhau Hajarau 🎵');
    dedicatedSong.volume = 0.8;
    dedicatedSong.play().catch(()=>{});
    songPlayIcon.textContent = '⏸';
    vinylDisc.classList.add('spinning');
    musicIcon.textContent = '⏸';
  } else {
    dedicatedSong.pause();
    songPlayIcon.textContent = '▶';
    vinylDisc.classList.remove('spinning');
    musicIcon.textContent = '▶';
  }
});

// Keep card progress bar live while open
dedicatedSong.addEventListener('timeupdate', ()=>{
  if(!dedicatedSong.duration) return;
  const pct = (dedicatedSong.currentTime / dedicatedSong.duration) * 100;
  $('songProgFill').style.width = pct + '%';
  $('songCurrent').textContent = formatTime(dedicatedSong.currentTime);
});
dedicatedSong.addEventListener('loadedmetadata', ()=>{
  $('songDuration').textContent = formatTime(dedicatedSong.duration);
});
dedicatedSong.addEventListener('ended', ()=>{
  songPlayIcon.textContent = '▶';
  vinylDisc.classList.remove('spinning');
  $('songProgFill').style.width = '0%';
  dedicatedSong.currentTime = 0;
  musicIcon.textContent = '▶';
  $('musicLabel').textContent = 'Birthday Song 🎂';
});
dedicatedSong.addEventListener('play',  ()=>{ if(activeAudio===dedicatedSong) musicIcon.textContent='⏸'; });
dedicatedSong.addEventListener('pause', ()=>{ if(activeAudio===dedicatedSong) musicIcon.textContent='▶'; });

// Seek inside the card progress bar
document.querySelector('.song-prog-bar')?.addEventListener('click', function(e){
  if(!dedicatedSong.duration) return;
  const rect = this.getBoundingClientRect();
  const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
  dedicatedSong.currentTime = ratio * dedicatedSong.duration;
});

function formatTime(s){
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60).toString().padStart(2, '0');
  return `${m}:${sec}`;
}

function spawnSongHearts(){
  const c = $('songHearts');
  c.innerHTML = '';
  const items = ['💖','💕','🌸','✨','💗','🌹','💝'];
  for(let i = 0; i < 12; i++){
    const el = document.createElement('div');
    el.className = 'sh-heart';
    el.textContent = items[i % items.length];
    el.style.cssText = `left:${rand(5,90)}%;--dur:${rand(3,6)}s;--delay:${rand(0,4)}s;font-size:${rand(.8,1.3)}rem`;
    c.appendChild(el);
  }
}

/* ─────────────── SCENE TRANSITION ─────────────── */
function transitionToScene(nextId){
  return new Promise(res=>{
    const next=$(nextId);
    if(!next) return res();
    next.style.display='flex';
    next.classList.remove('hidden-scene');
    next.style.opacity='0';
    next.style.transform='translateY(30px)';
    next.style.transition='opacity .9s ease, transform .9s ease';
    requestAnimationFrame(()=>{
      requestAnimationFrame(()=>{
        next.style.opacity='1'; next.style.transform='translateY(0)';
        next.scrollIntoView({behavior:'smooth',block:'start'});
        setTimeout(res,950);
      });
    });
  });
}

/* ─────────────── SCENE 1: OPENING ─────────────── */
async function runScene1(){
  particlesOn=true;
  buildFloatingHeartsBg();
  buildGoldenParticles();
  await wait(500);
  await typewrite($('op1'),'Hey Cutie ❤️',80);
  await wait(2000);
  await fadeOut($('op1'));
  await wait(300);
  await typewrite($('op2'),'Today isn\'t just another day...',40);
  await wait(1000);
  await typewrite($('op3'),'It\'s the day the most beautiful girl came into this world.',30);
  await wait(800);
  await typewrite($('op4'),'I made something special just for you.',30);
  await wait(800);
  const wrap=$('beginBtnWrap');
  wrap.classList.remove('hidden');
  wrap.classList.add('shown');
}

function buildFloatingHeartsBg(){
  const bg=$('floatingHeartsBg');
  const items=['💖','💕','💗','🌸','💞','✨','🌹','💝'];
  for(let i=0;i<30;i++){
    const el=document.createElement('div');
    el.className='fheart';
    el.textContent=items[randInt(0,items.length)];
    const left=rand(2,96), dur=rand(8,18), delay=rand(0,12), rot=rand(-20,20);
    el.style.cssText=`left:${left}%;bottom:0;--dur:${dur}s;--delay:${delay}s;--rot:${rot}deg;font-size:${rand(.8,1.6)}rem`;
    bg.appendChild(el);
  }
}

function buildGoldenParticles(){
  const gp=$('goldenParticles');
  for(let i=0;i<40;i++){
    const el=document.createElement('div');
    el.className='gparticle';
    const s=rand(3,8);
    el.style.cssText=`left:${rand(5,95)}%;top:${rand(10,90)}%;width:${s}px;height:${s}px;--dur:${rand(3,7)}s;--delay:${rand(0,5)}s`;
    gp.appendChild(el);
  }
}

$('beginBtn').addEventListener('click',async()=>{
  addRipple($('beginBtn'));
  startMusic();
  createClickBurst(mouseX,mouseY);
  await wait(200);
  await transitionToScene('scene2');
  runScene2();
});
addRipple($('beginBtn'));

/* ─────────────── SCENE 2: LIGHTS ─────────────── */
function runScene2(){
  buildBulbs();
}

function buildBulbs(){
  const row=$('bulbsRow');
  row.innerHTML='';
  const count=Math.max(10,Math.floor(window.innerWidth/80));
  const wireHts=[40,60,50,75,45,65,55,48,70,42];
  const tints=['#D4AF37','#e63950','#FFD6E0','#F5E6A3','#c9184a'];
  for(let i=0;i<count;i++){
    const ht=wireHts[i%wireHts.length];
    const unit=document.createElement('div');
    unit.className='bulb-unit';
    unit.id=`bu-${i}`;
    const tint=tints[i%tints.length];
    unit.innerHTML=`<div class="bulb-wire-line" style="height:${ht}px"></div><div class="bulb-globe" style="background:radial-gradient(circle at 40% 35%,#fff5e0,${tint} 60%,#a07c20)"></div>`;
    row.appendChild(unit);
  }
}

$('lightsBtn').addEventListener('click',async()=>{
  addRipple($('lightsBtn'));
  // light up bulbs one by one
  const bulbs=document.querySelectorAll('.bulb-unit');
  bulbs.forEach((b,i)=>setTimeout(()=>b.classList.add('on'), i*100));
  // brighten scene
  setTimeout(()=>{ $('scene2').classList.add('lit'); },bulbs.length*100+300);
  // sparkle burst
  setTimeout(()=>{ spawnConfettiBurst(30); confettiOn=true; setTimeout(()=>confettiOn=false,3000); },bulbs.length*100+800);
  await wait(bulbs.length*100+1200);
  hideBtn($('lightsBtn'));
  await transitionToScene('scene3');
  runScene3();
});
addRipple($('lightsBtn'));

/* ─────────────── SCENE 3: DECORATIONS ─────────────── */
function runScene3(){
  buildBalloons();
  buildRibbons();
  buildFairyLights();
  buildButterflies();
  confettiOn=true; setTimeout(()=>confettiOn=false,5000);
}

function buildBalloons(){
  const c=$('ceilingBalloons');
  c.innerHTML='';
  const colors=['#e63950','#D4AF37','#FFD6E0','#c9184a','#F5E6A3','#ffb3c6','#a2142f'];
  const placements=[
    {x:5,y:-20},{x:12,y:-30},{x:20,y:-15},{x:30,y:-35},{x:38,y:-20},
    {x:48,y:-30},{x:57,y:-18},{x:65,y:-32},{x:73,y:-22},{x:80,y:-28},
    {x:88,y:-15},{x:93,y:-25}
  ];
  placements.forEach((p,i)=>{
    const el=document.createElement('div');
    el.className='balloon';
    const col=colors[i%colors.length], w=rand(40,60), h=w*1.25;
    el.style.cssText=`left:${p.x}%;top:${p.y}px;width:${w}px;height:${h}px;
      background:radial-gradient(circle at 35% 30%,rgba(255,255,255,.5),${col} 55%);
      box-shadow:inset -4px -6px 12px rgba(0,0,0,.15);
      --dur:${rand(3,5)}s;--delay:${i*.15}s;
      animation:balloonFloat var(--dur) var(--delay) ease-in-out infinite alternate`;
    c.appendChild(el);
  });
}

function buildRibbons(){
  const c=$('goldenRibbons');
  const colors=['#D4AF37','#e63950','#F5E6A3','#c9184a','#ffb3c6'];
  for(let i=0;i<25;i++){
    const el=document.createElement('div');
    el.className='ribbon-piece';
    const col=colors[i%colors.length];
    const isRibbon=Math.random()<.5;
    el.style.cssText=`
      left:${rand(0,100)}%;top:-60px;
      width:${isRibbon?rand(4,8):rand(8,14)}px;
      height:${isRibbon?rand(20,40):rand(8,14)}px;
      background:${col};border-radius:${isRibbon?'4px':'50%'};
      --rot:${rand(-45,45)}deg;
      --dur:${rand(3,8)}s;--delay:${rand(0,6)}s;
      animation:ribbonFall var(--dur) var(--delay) linear infinite`;
    c.appendChild(el);
  }
}

function buildFairyLights(){
  const c=$('fairyLightsRow');
  const colors=['#D4AF37','#e63950','#FFD6E0','#F5E6A3','#fff','#c9184a','#ffb3c6'];
  const count=Math.max(20,Math.floor(window.innerWidth/40));
  for(let i=0;i<count;i++){
    const el=document.createElement('div');
    el.className='fdot';
    const col=colors[i%colors.length];
    el.style.cssText=`background:${col};color:${col};--dur:${rand(.8,2)}s;--delay:${rand(0,1.5)}s`;
    c.appendChild(el);
  }
}

function buildButterflies(){
  const c=$('butterflies');
  const btf=['🦋','🌸','✨'];
  for(let i=0;i<8;i++){
    const el=document.createElement('div');
    el.className='butterfly';
    el.textContent=btf[i%btf.length];
    el.style.cssText=`left:${rand(5,75)}%;top:${rand(15,75)}%;--dur:${rand(7,14)}s;--delay:${rand(0,8)}s`;
    c.appendChild(el);
  }
}

$('cakeSceneBtn').addEventListener('click',async()=>{
  addRipple($('cakeSceneBtn'));
  await transitionToScene('scene4');
  runScene4();
});
addRipple($('cakeSceneBtn'));

/* ─────────────── SCENE 4: CAKE ─────────────── */
function runScene4(){
  // Animate cake entrance
  setTimeout(()=>{
    $('cakeWrapper3d').style.animation='cakeEntrance .8s cubic-bezier(.34,1.56,.64,1) forwards';
    // light candles one by one
    const candles=document.querySelectorAll('.candle');
    candles.forEach((c,i)=>setTimeout(()=>c.classList.add('lit'),600+i*200));
  },200);
}

$('wishBtn').addEventListener('click',async()=>{
  addRipple($('wishBtn'));
  // blow out candles
  const candles=document.querySelectorAll('.candle');
  candles.forEach((c,i)=>{
    setTimeout(()=>{
      c.classList.add('blown');
      // add smoke
      const smoke=document.createElement('div');
      smoke.className='smoke';
      c.querySelector('.candle-flame').appendChild(smoke);
    }, i*150);
  });
  // golden glow
  confettiOn=true;
  spawnConfettiBurst(50);
  await wait(1200);
  confettiOn=false;
  hideBtn($('wishBtn'));
  await transitionToScene('scene5');
  runScene5();
});
addRipple($('wishBtn'));

/* ─────────────── SCENE 5: BIRTHDAY CARD ─────────────── */
function runScene5(){
  buildCardHearts();
  animateCardTitle();
  setTimeout(revealCardMessage, 1200);
}

function buildCardHearts(){
  const container=$('cardHeartsLeft');
  const sizes=[70,55,65,48,60,52];
  const colors=['#e63950','#c9184a','#e63950','#c9184a','#e63950','#c9184a'];
  sizes.forEach((sz,i)=>{
    const el=document.createElement('div');
    el.className='card-heart-svg';
    el.style.cssText=`--dur:${rand(2.5,4)}s;--delay:${i*.4}s;width:${sz}px;height:${sz}px`;
    el.innerHTML=`<svg viewBox="0 0 100 90" xmlns="http://www.w3.org/2000/svg" width="${sz}" height="${sz}">
      <path d="M50 85 C50 85 5 55 5 30 C5 15 15 5 30 5 C40 5 50 15 50 15 C50 15 60 5 70 5 C85 5 95 15 95 30 C95 55 50 85 50 85Z"
        fill="${colors[i]}" filter="drop-shadow(0 2px 6px rgba(201,24,74,.3))"/>
    </svg>`;
    container.appendChild(el);
  });
}

async function animateCardTitle(){
  const el=$('cardTitle');
  await typewrite(el,'Happy Birthday',70);
}

const CARD_LINES=[
  'Happy Birthday, Sweetuuuuu...... ❤️',
  'Every day with you feels brighter,',
  'every smile of yours makes my world happier.',
  'May this birthday brings you endless happiness,',
  'beautiful memories, and all the love you deserve.',
  'You are my favorite person, my peace,',
  'my happiness, and my greatest blessing aaahhhhhhhh🙈🙈🥳.',
  'I hope your dreams come true —',
  'and I\'ll always be cheering for you.',
  '~ Happy Birthday, Beautiful. 😘❤️'
];

function revealCardMessage(){
  const container=$('cardMessage');
  container.innerHTML='';
  CARD_LINES.forEach((line,i)=>{
    const el=document.createElement('div');
    el.className='msg-line';
    el.textContent=line;
    if(i===0) el.style.fontWeight='600';
    if(i===CARD_LINES.length-1) el.style.cssText='font-family:var(--font-sac);font-size:1.4rem;color:#c9184a;font-weight:400';
    container.appendChild(el);
    setTimeout(()=>el.classList.add('revealed'), 200+i*250);
  });
}

$('loveLetterBtn').addEventListener('click',async()=>{
  addRipple($('loveLetterBtn'));
  await transitionToScene('scene6');
  runScene6();
});
addRipple($('loveLetterBtn'));

/* ─────────────── SCENE 6: LOVE LETTER ─────────────── */
const LL_LINES=['I feel','Incredibly lucky','Because','I found You.','loving you','more🫶😘❤️'];

async function runScene6(){
  // draw border
  await wait(300);
  $('borderPath').classList.add('drawn');
  await wait(2200);
  // write lines
  const container=$('llText');
  container.innerHTML='';
  for(const line of LL_LINES){
    const el=document.createElement('div');
    el.className='ll-line';
    el.textContent=line;
    container.appendChild(el);
    await wait(100);
    el.classList.add('written');
    await wait(450);
  }
  // hearts fly up
  await wait(400);
  spawnLLHearts();
}

function spawnLLHearts(){
  const c=$('llHearts');
  const items=['💖','💕','💗','💞','🌸','✨','💝'];
  for(let i=0;i<20;i++){
    const el=document.createElement('div');
    el.className='fly-heart';
    el.textContent=items[i%items.length];
    el.style.cssText=`left:${rand(10,90)}%;--dur:${rand(2,4)}s;--delay:${rand(0,2)}s;--rot:${rand(-30,30)}deg;font-size:${rand(.8,1.5)}rem`;
    c.appendChild(el);
    setTimeout(()=>el.remove(), 5000);
  }
}

$('galleryBtn').addEventListener('click',async()=>{
  addRipple($('galleryBtn'));
  await transitionToScene('scene8');
  runScene8();
});
addRipple($('galleryBtn'));

/* ─────────────── SCENE 8: REASONS I LOVE YOU ─────────────── */
const LOVE_REASONS=[
  {icon:'😊',front:'Your smile',back:'It lights up my whole world'},
  {icon:'💛',front:'Your kindness',back:'I love the kind heart of yours'},
  {icon:'😂',front:'Your laugh',back:'It is the sweetest sound I know'},
  {icon:'🤗',front:'Your caring heart',back:'I love being cared by You'},
  {icon:'✨',front:'Your beautiful soul',back:'Pure gold, inside and out'},
  {icon:'🌸',front:'Your grace',back:'Elegant in everything you do'},
  {icon:'🧠',front:'Your mind',back:'You think in ways that amaze me'},
  {icon:'🌹',front:'Your strength',back:'You handle everything with grace'},
  {icon:'💖',front:'Your love',back:'It means everything to me'},
  {icon:'🌟',front:'Everything about you',back:'Absolutely everything ❤️'},
];

function runScene8(){
  const grid=$('loveCards');
  grid.innerHTML='';
  LOVE_REASONS.forEach((r,i)=>{
    const card=document.createElement('div');
    card.className='love-card';
    card.setAttribute('role','listitem');
    card.setAttribute('tabindex','0');
    card.setAttribute('aria-label',`${r.front} — click to flip`);
    card.style.setProperty('--delay',`${i*.08}s`);
    card.innerHTML=`<div class="love-card-inner">
      <div class="love-card-front">
        <div class="love-card-icon">${r.icon}</div>
        <p>${r.front}</p>
      </div>
      <div class="love-card-back"><p>${r.back}</p></div>
    </div>`;
    card.addEventListener('click',()=>{ card.classList.toggle('flipped'); createClickBurst(mouseX,mouseY); });
    card.addEventListener('keydown',e=>{ if(e.key==='Enter'||e.key===' '){ e.preventDefault(); card.classList.toggle('flipped'); }});
    grid.appendChild(card);
  });
}

$('timelineBtn').addEventListener('click',async()=>{
  addRipple($('timelineBtn'));
  await transitionToScene('scene10');
  runScene10();
});
addRipple($('timelineBtn'));

/* ─────────────── SCENE 10: HEART RAIN ─────────────── */
function runScene10(){
  const canvas=$('heartRainCanvas');
  canvas.width=canvas.offsetWidth||window.innerWidth;
  canvas.height=canvas.offsetHeight||window.innerHeight;
  const ctx=canvas.getContext('2d');
  const hearts=[];
  const HEART_CHARS=['💖','💕','💗','💞','💝','🌸','✨'];
  let active=true;

  function spawnHeart(){
    hearts.push({
      x:rand(0,canvas.width), y:-30,
      vy:rand(1.5,4), vx:rand(-.5,.5),
      size:rand(14,36), alpha:1, rot:rand(-30,30),
      char:HEART_CHARS[randInt(0,HEART_CHARS.length)],
      pulse:rand(0,Math.PI*2), pulseSpeed:rand(.02,.06)
    });
  }

  function drawRAF(){
    if(!active) return;
    ctx.clearRect(0,0,canvas.width,canvas.height);
    if(Math.random()<.25) spawnHeart();
    hearts.forEach(h=>{
      h.x+=h.vx; h.y+=h.vy;
      h.pulse+=h.pulseSpeed;
      if(h.y>canvas.height-80) h.alpha-=.015;
      const scale=1+Math.sin(h.pulse)*.1;
      ctx.globalAlpha=Math.max(0,h.alpha);
      ctx.save();
      ctx.translate(h.x,h.y);
      ctx.rotate(h.rot*Math.PI/180);
      ctx.scale(scale,scale);
      ctx.font=`${h.size}px serif`;
      ctx.textAlign='center';
      ctx.fillText(h.char,0,0);
      ctx.restore();
    });
    for(let i=hearts.length-1;i>=0;i--)
      if(hearts[i].alpha<=0||hearts[i].y>canvas.height+30) hearts.splice(i,1);
    ctx.globalAlpha=1;
    requestAnimationFrame(drawRAF);
  }
  drawRAF();

  // auto-stop after 12s
  setTimeout(()=>active=false, 12000);
}

$('finalBtn').addEventListener('click',async()=>{
  addRipple($('finalBtn'));
  await transitionToScene('scene11');
  runScene11();
});
addRipple($('finalBtn'));

/* ─────────────── SCENE 11: FINAL SURPRISE ─────────────── */
function runScene11(){
  confettiOn=true;
  setTimeout(()=>confettiOn=false,6000);
  // bind giant heart click
  const heart=$('giantHeart');
  heart.addEventListener('click',openFinalHeart);
  heart.addEventListener('keydown',e=>{ if(e.key==='Enter'||e.key===' ') openFinalHeart(); });
}

function openFinalHeart(){
  const heart=$('giantHeart');
  if(heart.classList.contains('opened')) return;
  heart.classList.add('opened');
  heart.setAttribute('aria-expanded','true');
  heart.style.animation='none';

  // start fireworks
  startFireworks($('fireworksOverlay'),35);

  // confetti burst
  confettiOn=true; spawnConfettiBurst(80);
  setTimeout(()=>confettiOn=false,6000);

  // show final message
  setTimeout(()=>{
    const msg=$('finalMsg');
    msg.classList.remove('hidden');
    void msg.offsetWidth;
    msg.classList.add('shown');
    spawnTinyHearts();
  }, 1000);
}

function spawnTinyHearts(){
  const container=$('finalHeartsBurst');
  const items=['💖','💕','💗','💞','💝','✨','🌟'];
  for(let i=0;i<30;i++){
    const el=document.createElement('div');
    el.className='tiny-heart';
    el.textContent=items[i%items.length];
    const tx=(rand(-150,150));
    const ty=(rand(-120,-40));
    el.style.cssText=`left:${rand(10,90)}%;--tx:${tx}px;--ty:${ty}px;--dur:${rand(3,6)}s;--delay:${rand(0,3)}s;font-size:${rand(.7,1.3)}rem`;
    container.appendChild(el);
  }
}

/* ─────────────── INIT ─────────────── */
(async function init(){
  await wait(2800); // let loading rose bloom
  const loading=$('loadingScreen');
  loading.classList.add('fade-out');
  await wait(800);
  loading.remove();
  particlesOn=true;
  runScene1();
})();

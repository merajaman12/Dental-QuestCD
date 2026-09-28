/* Dental Quest – game logic. Edit questions/foods in the DATA section below. */
const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
const ld=(k,d)=>{try{return JSON.parse(localStorage.getItem(k))||d}catch(e){return d}};
const sv=(k,v)=>{try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}};
const esc=s=>String(s).replace(/[&<>"']/g,c=>'&#'+c.charCodeAt(0)+';');

/* ===== DATA ===== */
const PIN='1234',MAX=340;
const TEAMS=['Team Enamel','Team Dentin','Team Molar','Team Incisor'];
const CREW=['Dr. Meraj Aman','Dr. Laiba Furrukh','Dr. Zohaib Manzoor','Dr. Noreen','Dr. Uswa Maryam','Dr. Sehreen'];
const BD=[['d','🔎','Plaque Detective'],['s','🍎','Smart Choice Champion'],['b','🪥','Brushing Boss'],['g','🧠','Dental Genius'],['h','🦷','Tooth Hero'],['c','🏆','Dental Quest Champion']];
const MN=[['🔎','Plaque Detective'],['🍭','Sugar Trap'],['🪥','Brushing Battle'],['🧠','Myth or Fact'],['🚨','Save the Tooth']];
const MB=['d','s','b','g','h'];
const E=['Plaque is a sticky film of bacteria. Brushing twice a day with fluoride toothpaste removes it. If you ever see a chalky spot or have tooth pain, tell a trusted adult and visit a dentist.',
'It is not only what you have, but how often. Frequent free sugars feed plaque bacteria, which make acid. Treats are fine now and then, best with meals. Water is the smart everyday drink.',
'Brush for 2 minutes, twice a day, with a small pea-sized amount of fluoride toothpaste. Spit it out but do not rinse with lots of water, so the fluoride stays on your teeth.',
'Facts protect smiles, and myths can lead us the wrong way. Well done, detective!',
'Prevention is a team effort: brushing with fluoride toothpaste, smart sugar habits, water, and regular dental visits.'];
const FOOD=[['💧','Water',1,'Water is the best everyday drink for teeth.'],['🥛','Plain milk with a meal',1,'Plain milk is kind to teeth.'],['🥤','A fizzy drink sipped slowly all afternoon',0,'Sipping sugary drinks for hours gives plaque bacteria lots of chances to make acid.'],['🍎','Apple slices as a snack',1,'Whole fruit and crunchy snacks are a smart choice.'],['🍬','Sweets nibbled one after another all evening',0,'Many small sugar hits in a row are harder on teeth than one treat.'],['🧀','Cheese cubes',1,'Cheese has no free sugars, so it is a tooth-friendly snack.'],['🧃','Fruit juice sipped all morning',0,'Juice has free sugars. A small glass with a meal is better than sipping for hours.'],['🍫','One chocolate bar after lunch',0,'A sugar hit, but treats are okay sometimes! Best with a meal, then keep the rest of the day tooth-friendly.']];
const MYTH=[['🪥','Brushing twice a day with fluoride toothpaste helps protect your teeth.',1,'Fluoride helps make teeth stronger against acid.'],['🐛','Tooth decay is caused by tiny worms in your teeth.',0,'Decay comes from acid made by plaque bacteria after free sugars.'],['⏰','How often you have sugary drinks matters as much as how much.',1,'Many sugar hits through the day keep teeth under acid attack.'],['💧','Water is a tooth-friendly drink.',1,'Water has no sugar and is best between meals.'],['💪','Brushing as hard as you can cleans best.',0,'Gentle brushing with a soft brush works well and protects gums.'],['🦷','You only need a dentist when a tooth hurts.',0,'Regular check-ups can spot problems early.'],['🚿','After brushing, rinse with lots of water.',0,'Spit out, but do not rinse, so fluoride can keep working.'],['🧫','Plaque is a sticky film of bacteria.',1,'Brushing removes plaque every day.'],['🍭','Everyone must never eat sweets again to keep healthy teeth.',0,'Sweets can be enjoyed sometimes, best with meals, with good brushing.'],['👶','Baby teeth do not matter because they fall out.',0,'Baby teeth help with eating, speaking and saving space for adult teeth.']];
const CASE=[['🪥','Brush twice a day with fluoride toothpaste',1,'Great! This is the core habit.'],['💧','Swap fizzy drinks for water most days',1,'Cutting frequent sugar helps a lot.'],['🦷','Visit the dentist for regular check-ups',1,'Dentists help prevent and catch problems early.'],['🍎','Choose tooth-friendly snacks like fruit or cheese',1,'Smart choices between meals.'],['🗣️','Tell a trusted adult if a tooth hurts',1,'Speaking up early gets help sooner.'],['🚫','Never eat anything with sugar again',0,'Too extreme! Treats are okay sometimes, with meals.'],['💪','Scrub as hard as possible with a hard brush',0,'Gentle brushing is better for teeth and gums.'],['⏳','Wait until it really hurts before seeing a dentist',0,'Better to go for check-ups before there is pain.']];

/* ===== STATE ===== */
const blank=()=>({team:'',ms:[null,null,null,null,null],b:[]});
let S=ld('dq_s',blank()),B=ld('dq_b',{}),ST=ld('dq_st',{sound:true,anim:true}),picked='',cur=0;
const score=()=>S.ms.reduce((a,v)=>a+(v||0),0),done=()=>S.ms.filter(v=>v!==null).length;
function save(){sv('dq_s',S);if(S.team){B[S.team]={score:score(),done:done(),b:S.b};sv('dq_b',B)}hud();board()}
function apply(){$('#snd').textContent=ST.sound?'🔊':'🔇';document.body.classList.toggle('noanim',!ST.anim);sv('dq_st',ST)}

/* ===== SOUND & CONFETTI (nothing plays until the user taps) ===== */
let AC;
function tone(f,d,ty='sine',s=0){if(!ST.sound)return;try{AC=AC||new(window.AudioContext||window.webkitAudioContext)();const o=AC.createOscillator(),g=AC.createGain(),t=AC.currentTime+s;o.type=ty;o.frequency.value=f;g.gain.setValueAtTime(.15,t);g.gain.exponentialRampToValueAtTime(.001,t+d);o.connect(g);g.connect(AC.destination);o.start(t);o.stop(t+d)}catch(e){}}
const seq=(a,ty='triangle')=>a.forEach((f,k)=>tone(f,.2,ty,k*.12));
const sfx=n=>({click:()=>tone(520,.06),ok:()=>seq([660,880],'sine'),bad:()=>tone(180,.25,'sawtooth'),done:()=>seq([523,659,784]),badge:()=>seq([784,988,1175]),final:()=>seq([523,659,784,1047,1319])})[n]();
function confetti(n=50){if(!ST.anim)return;const c=$('#confetti');for(let i=0;i<n;i++){const d=document.createElement('div');d.className='cf';d.style.cssText=`left:${Math.random()*100}%;background:hsl(${Math.random()*360},80%,60%);animation-delay:${Math.random()}s;animation-duration:${2+Math.random()*2}s`;c.appendChild(d);setTimeout(()=>d.remove(),4500)}}
function toast(m){const t=$('#toast');t.textContent=m;t.classList.add('on');setTimeout(()=>t.classList.remove('on'),2200)}

/* ===== UI HELPERS ===== */
const show=h=>{$('#stage').innerHTML=h};
const mh=i=>`<div class="mh"><span>${MN[i][0]}</span><div><small>MISSION 0${i+1}</small><h3>${MN[i][1]}</h3></div><button class="btn ghost" data-a="map">← Map</button></div>`;
function hud(){const h=$('#hud');h.hidden=!S.team;if(!S.team)return;h.innerHTML=`<div><small>TEAM</small><b>${esc(S.team)}</b></div><div><small>SCORE</small><b>${score()}</b></div><div class="pg"><small>MISSIONS ${done()}/5</small><i><u style="width:${done()*20}%"></u></i></div><button class="btn ghost" data-a="sw">Switch team</button>`}
function board(){const r=Object.entries(B).sort((a,b)=>b[1].score-a[1].score);$('#lb').innerHTML=r.length?r.map(([n,v],i)=>`<tr class="${n===S.team?'me':''}"><td>${i+1}</td><td>${esc(n)}</td><td>${v.score}</td><td>${v.b.map(x=>BD.find(y=>y[0]===x)[1]).join(' ')||'–'}</td></tr>`).join(''):'<tr><td colspan="4">No teams yet. Start the quest to appear here!</td></tr>'}
function setup(){show(`<div class="card"><h3>Choose your team</h3>${TEAMS.map(t=>`<button class="tp" data-a="pick" data-v="${t}">${t}</button>`).join('')}<input id="cn" maxlength="20" placeholder="…or type your own team name"><button class="btn pri" data-a="go">Start quest</button></div>`)}
function map(){if(!S.team)return setup();show(`<h3 style="margin-bottom:12px">Choose your mission</h3><div class="mis">${MN.map((m,i)=>{const ok=i==0||S.ms[i-1]!==null,d=S.ms[i]!==null;return `<div class="card mc ${ok?'':'lock'} ${d?'dn':''}"><div class="big">${ok?m[0]:'🔒'}</div><h3>${m[1]}</h3><p>${d?'✅ '+S.ms[i]+' points':ok?'Ready!':'Finish the last mission first'}</p><button class="btn pri" ${ok?'':'disabled'} data-a="mis" data-v="${i}">${d?'Play again':'Play'}</button></div>`}).join('')}</div>${done()==5?'<p style="margin-top:16px"><button class="btn pri" data-a="res">See final results</button></p>':''}`)}
function finish(i,pts,extra=''){S.ms[i]=pts;const nb=[],add=b=>{if(!S.b.includes(b)){S.b.push(b);nb.push(b)}};if(!(i==3&&pts<70))add(MB[i]);if(done()==5)add('c');save();
 nb.length?sfx('badge'):sfx('done');confetti(nb.length?80:40);
 show(`<div class="card">${mh(i)}<div class="score">+${pts}</div>${extra}${nb.map(b=>{const x=BD.find(y=>y[0]===b);return `<div class="badge">${x[1]} Badge unlocked: ${x[2]}!</div>`}).join('')}<p class="fb g"><b>Dr. Molar says:</b> ${E[i]}</p>${i==3&&pts<70?'<p>Almost a Dental Genius! Replay the mission to earn the badge.</p>':''}<button class="btn pri" data-a="next">${i<4?'Next mission':'See results'}</button></div>`)}
function results(){const s=score(),p=s/MAX,msg=p>=.8?'Amazing work, dental detective!':p>=.5?'Great effort! You know your smile science.':'Good start! Every dentist began as a learner. Play again to earn more!';sfx('final');confetti(120);
 show(`<div class="card tc"><h2>Quest results 🎉</h2><div class="score">${s} / ${MAX}</div><p><b>${esc(S.team)}</b> completed ${done()} of 5 missions</p><p class="qt">${msg}</p><div class="badges">${BD.map(b=>`<div class="bd ${S.b.includes(b[0])?'':'off'}"><span>${b[1]}</span>${b[2]}</div>`).join('')}</div><button class="btn pri" data-a="again">Play again</button> <a class="btn ghost" href="#board">Leaderboard</a></div>`)}

/* ===== MISSIONS ===== */
function m1(){let f=0,p=0;const H=[[16,30,'Soft plaque along the gum line! Brushing here every day removes it.',1],[50,72,'A sweet stuck between teeth gives bacteria sugar to feed on.',1],[84,26,'A chalky white spot can be an early sign of decay. A dentist can help, so tell a trusted adult.',1],[30,78,'Back teeth are easy to miss. Plaque hides here!',1],[70,78,'Sipping fizzy drinks again and again is a risk: sugar hits for bacteria.',1],[50,26,'A clean, shiny tooth. Healthy! No points here.',0],[10,60,'Healthy pink gums. Nothing to find here.',0]];
 let t='';for(let k=0;k<6;k++)t+=`<rect x="${34+k*38}" y="34" width="34" height="54" rx="12" fill="#fff"/><rect x="${34+k*38}" y="112" width="34" height="54" rx="12" fill="#fff"/>`;
 show(`<div class="card">${mh(0)}<p>Tap the glowing circles. Find <b>5 plaque and risk clues</b>!</p><div class="mouth"><svg viewBox="0 0 300 200"><rect x="6" y="6" width="288" height="188" rx="90" fill="#b93a5e"/><rect x="22" y="22" width="256" height="76" rx="36" fill="#f28ba6"/><rect x="22" y="102" width="256" height="76" rx="36" fill="#f28ba6"/>${t}</svg>${H.map((h,k)=>`<button class="hs" data-k="${k}" style="left:${h[0]}%;top:${h[1]}%">?</button>`).join('')}</div><div id="fb" class="fb g">Found 0 / 5</div></div>`);
 $$('.hs').forEach(b=>b.onclick=()=>{const h=H[b.dataset.k];if(!b.classList.contains('hs')||b.dataset.x)return;b.dataset.x=1;if(h[3]){f++;p+=10;b.classList.add('f');b.textContent='✓';sfx('ok')}else{b.classList.add('d');b.textContent='👍';sfx('click')}
 $('#fb').innerHTML=`Found ${f} / 5<br>${h[2]}${h[3]?' <b>+10</b>':''}`;if(f==5)setTimeout(()=>finish(0,p,'<p>You found every clue!</p>'),1400)})}

function quiz(i,L,lab,intro){let k=0,p=0,ok=0;const go=()=>{const q=L[k];show(`<div class="card">${mh(i)}<div class="pgt">${intro} ${k+1} / ${L.length}</div><div class="big">${q[0]}</div><p class="qt">${q[1]}</p><div class="two"><button class="ans" data-r="1">${lab[0]}</button><button class="ans" data-r="0">${lab[1]}</button></div><div id="fb"></div></div>`);
 $$('.ans').forEach(b=>b.onclick=()=>{const c=(b.dataset.r=='1')==!!q[2];$$('.ans').forEach(x=>{x.disabled=true;x.classList.toggle('good',(x.dataset.r=='1')==!!q[2])});if(!c)b.classList.add('bad');if(c){p+=10;ok++;sfx('ok')}else sfx('bad');
 $('#fb').innerHTML=`<div class="fb ${c?'g':'b'}">${c?'✅ Correct! +10':'💡 Good try!'} ${q[3]}</div><button class="btn pri" id="nx">${k<L.length-1?'Next':'Finish'}</button>`;$('#nx').onclick=()=>{k++;k<L.length?go():finish(i,p,`<p>You got ${ok} of ${L.length} right.</p>`)}})};go()}
const m2=()=>quiz(1,FOOD,['Tooth-friendly 😁','Sugar hit 🍭'],'Item');
const m4=()=>quiz(3,MYTH,['Fact 👍','Myth 🚫'],'Question');

function m3(){let n=12;const row=()=>`<div class="r3">${'<div class="tt"><button class="pl" aria-label="plaque"></button></div>'.repeat(6)}</div>`;
 show(`<div class="card">${mh(2)}<p>Drag (or tap) the toothbrush over the brown plaque to scrub it away!</p><div class="mouth3" id="m3">${row()}${row()}<div id="brush">🪥</div></div><p class="qt" id="left">Plaque left: 12</p></div>`);
 const m=$('#m3'),br=$('#brush');const hit=e=>{const r=m.getBoundingClientRect();br.style.left=e.clientX-r.left+'px';br.style.top=e.clientY-r.top+'px';const el=document.elementFromPoint(e.clientX,e.clientY);if(el&&el.classList.contains('pl')&&!el.classList.contains('gone')){el.classList.add('gone');n--;sfx('click');$('#left').textContent=n?'Plaque left: '+n:'All clean! ✨';if(!n)setTimeout(()=>finish(2,60,'<p>Sparkling clean teeth!</p>'),900)}};
 m.addEventListener('pointermove',hit);m.addEventListener('pointerdown',hit)}

function m5(){show(`<div class="card">${mh(4)}<p>🧒 <b>Case:</b> Sam is 12. Sam has fizzy drinks through the afternoon, brushes only sometimes, and has not seen a dentist in a long time. <b>Pick the actions that would help Sam</b>, then check your plan.</p><div class="opts">${CASE.map((c,k)=>`<button class="ans" data-k="${k}">${c[0]} ${c[1]}</button>`).join('')}</div><button class="btn pri" id="chk">Check my plan</button></div>`);
 $$('.opts .ans').forEach(b=>b.onclick=()=>{b.classList.toggle('sel');sfx('click')});
 $('#chk').onclick=()=>{let p=0;const r=CASE.map((c,k)=>{const s=$$('.opts .ans')[k].classList.contains('sel');if(s&&c[2])p+=10;return `<li>${s&&c[2]?'✅':s?'⚠️':c[2]?'💡':'👍'} ${c[1]}: ${c[3]}</li>`}).join('');finish(4,p,`<ul style="padding-left:18px;margin:10px 0">${r}</ul>`)}}

/* ===== ACTIONS (buttons with data-a) ===== */
const MS=[m1,m2,m3,m4,m5];
const A={
 menu(){$('#nav').classList.toggle('open')},
 ts(){ST.sound=!ST.sound;apply();sfx('click');if($('#fc').dataset.p)panel()},
 ta(){ST.anim=!ST.anim;apply();panel()},
 pick(t){picked=t.dataset.v;$('#cn').value='';$$('.tp').forEach(b=>b.classList.toggle('sel',b===t))},
 go(){const n=$('#cn').value.trim().slice(0,20)||picked;if(!n)return toast('Pick a team or type a name!');S=blank();S.team=n;save();map()},
 sw(){S=blank();hud();setup()},
 map(){map()},
 mis(t){cur=+t.dataset.v;MS[cur]()},
 next(){cur<4?map():results()},
 res(){results()},
 again(){A.rm()},
 fac(){$('#fc').dataset.p='';$('#fc').innerHTML=`<h3>Facilitator</h3><input id="pin" type="password" inputmode="numeric" placeholder="PIN"><button class="btn pri" data-a="chk">Enter</button><button class="btn" data-a="close">Close</button>`;$('#fac').showModal()},
 chk(){$('#pin').value===PIN?panel():toast('Wrong PIN')},
 close(){$('#fac').close();$('#fc').dataset.p=''},
 rg(){if(confirm('Reset the current game? (The leaderboard stays.)')){S=blank();sv('dq_s',S);hud();setup();panel()}},
 rb(){if(confirm('Clear the whole leaderboard?')){B={};sv('dq_b',B);board();panel()}},
 rm(){if(!S.team)return toast('No team is playing.');S.ms=blank().ms;S.b=[];save();map();panel()}
};
function panel(){const r=Object.entries(B).sort((a,b)=>b[1].score-a[1].score);$('#fc').dataset.p=1;
 $('#fc').innerHTML=`<h3>Facilitator panel</h3><div class="tw"><table><tr><th>Team</th><th>Score</th><th>Missions</th></tr>${r.map(([n,v])=>`<tr><td>${esc(n)}</td><td>${v.score}</td><td>${v.done}/5</td></tr>`).join('')||'<tr><td colspan="3">No scores yet</td></tr>'}</table></div><p style="margin:10px 0">Now playing: <b>${esc(S.team||'nobody')}</b></p><button class="btn" data-a="rm">Restart missions</button><button class="btn" data-a="rg">Reset game</button><button class="btn" data-a="rb">Reset leaderboard</button><button class="btn" data-a="ts">Sound: ${ST.sound?'ON':'OFF'}</button><button class="btn" data-a="ta">Animations: ${ST.anim?'ON':'OFF'}</button><button class="btn pri" data-a="close">Close</button>`}
document.addEventListener('click',e=>{const t=e.target.closest('[data-a]');if(t&&A[t.dataset.a]){if(t.classList.contains('btn'))sfx('click');A[t.dataset.a](t)}if(e.target.closest('#nav a'))$('#nav').classList.remove('open')});
window.addEventListener('storage',()=>{B=ld('dq_b',{});board()});

/* ===== INIT ===== */
const skin=['#f1c7a0','#c98f61','#8d5a3a','#e8b98a','#a86f47','#f5d0b0'],hair=['#2b1b12','#5a3520','#111','#7a4a24','#3b2a1e','#20140d'],scr=['#0d9aa5','#1e6fd9','#7c5cd6','#14a37f','#0d9aa5','#e0742b'];
$('#mas').innerHTML='<svg viewBox="0 0 100 100"><path d="M50 8C30 2 12 14 14 40c1 18 10 22 12 40 2 16 14 16 16-2 2-10 14-10 16 0 2 18 14 18 16 2 2-18 11-22 12-40C88 14 70 2 50 8z" fill="#fff" stroke="#9ed8e6" stroke-width="3"/><circle cx="38" cy="38" r="5" fill="#0b2a4a"/><circle cx="62" cy="38" r="5" fill="#0b2a4a"/><circle cx="32" cy="50" r="5" fill="#ffb3c1"/><circle cx="68" cy="50" r="5" fill="#ffb3c1"/><path d="M40 52q10 12 20 0" fill="none" stroke="#0b2a4a" stroke-width="3.5" stroke-linecap="round"/></svg>';
$('#tg').innerHTML=CREW.map((n,i)=>`<div class="card tc"><div class="av"><svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="48" fill="#dff3f6"/><path d="M14 92q4-26 36-26t36 26z" fill="#fff"/><path d="M38 66l12 14 12-14z" fill="${scr[i]}"/><rect x="${i%3==1?26:32}" y="24" width="${i%3==1?48:36}" height="${i%3==1?46:30}" rx="16" fill="${hair[i]}"/><circle cx="50" cy="44" r="17" fill="${skin[i]}"/><path d="M${i%3==2?30:34} 40q16-${i%3==2?20:14} 32 0 0-10-16-12-32 2-16 12z" fill="${i%3==2?scr[i]:hair[i]}"/><circle cx="44" cy="45" r="2" fill="#222"/><circle cx="56" cy="45" r="2" fill="#222"/><path d="M44 52q6 5 12 0" fill="none" stroke="#7a3b2e" stroke-width="2" stroke-linecap="round"/><text x="62" y="86" font-size="14">🦷</text></svg></div><h3>${n}</h3></div>`).join('');
apply();hud();board();S.team?map():setup();

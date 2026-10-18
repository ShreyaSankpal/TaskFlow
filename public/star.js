const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
const KEY='taskflow.v2';
const iso=d=>d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');
const today=()=>iso(new Date());
const addDays=n=>{const d=new Date();d.setDate(d.getDate()+n);return iso(d)};
let S=JSON.parse(localStorage.getItem(KEY)||'null')||{tasks:[],focus:{},goal:3,habits:[{n:'Study Maths',d:[]},{n:'Exercise',d:[]}],reviews:[],dark:false};
const save=()=>localStorage.setItem(KEY,JSON.stringify(S));
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const fmt=m=>m>=60?Math.floor(m/60)+'h'+(m%60?' '+m%60+'m':''):m+'m';
const icons=()=>window.lucide&&lucide.createIcons();

/* quick add: "Study Maths tomorrow 2h !high #study" */
function parse(t){
  const o={pri:'medium',due:'',est:0,tag:''};
  t=t.replace(/!(high|medium|med|low)\b/i,(m,p)=>{p=p.toLowerCase();o.pri=p[0]=='h'?'high':p[0]=='l'?'low':'medium';return ''});
  t=t.replace(/#(\w+)/,(m,g)=>{o.tag=g;return ''});
  t=t.replace(/\b(\d+(?:\.\d+)?)\s?(h|hr|hrs|m|min)\b/i,(m,n,u)=>{o.est=Math.round(/^h/i.test(u)?n*60:+n);return ''});
  const days=['sunday','monday','tuesday','wednesday','thursday','friday','saturday'];
  t=t.replace(/\b(today|tomorrow|in (\d+) days?|sunday|monday|tuesday|wednesday|thursday|friday|saturday)\b/i,m=>{
    m=m.toLowerCase();
    if(m=='today')o.due=today();
    else if(m=='tomorrow')o.due=addDays(1);
    else if(m.startsWith('in '))o.due=addDays(parseInt(m.slice(3)));
    else o.due=addDays((days.indexOf(m)-new Date().getDay()+7)%7||7);
    return ''});
  o.title=t.replace(/\s+/g,' ').trim()||'Untitled task';
  return o;
}

const plus=(d,n)=>{const x=new Date(d+'T00:00');x.setDate(x.getDate()+n);return iso(x)};
const setStatus=(t,s)=>{
  if(s=='done'&&t.status!='done'&&t.rep)S.tasks.unshift({...t,id:Date.now(),status:'todo',due:plus(t.due||today(),t.rep=='daily'?1:7),focus:0,doneAt:undefined,subs:(t.subs||[]).map(x=>({...x,d:false}))});
  t.status=s;if(s=='done')t.doneAt=today();else delete t.doneAt};
/* board */
const tagCls=t=>'c'+([...t].reduce((a,c)=>a+c.charCodeAt(0),0)%5);
function dueChip(t){
  if(!t.due)return '';
  const late=t.due<today()&&t.status!='done';
  const l=t.due==today()?'Today':t.due==addDays(1)?'Tomorrow':new Date(t.due+'T00:00').toLocaleDateString('en-IN',{day:'numeric',month:'short'});
  return `<span class="chip ${late?'late':'c2'}">${late?'Overdue · ':''}${l}</span>`;
}
function card(t){
  return `<div class="card p-${t.pri}${t.status=='done'?' fin':''}" draggable="true" data-id="${t.id}">
  <div class="chips">${t.tag?`<span class="chip ${tagCls(t.tag)}">${esc(t.tag)}</span>`:''}<span class="chip c${{high:0,medium:3,low:1}[t.pri]}">${t.pri}</span>${dueChip(t)}</div>
  <h4>${esc(t.title)}</h4>
  <div class="meta">${t.est?`<span><i data-lucide="clock"></i>${fmt(t.est)}</span>`:''}${t.subs&&t.subs.length?`<span><i data-lucide="list-checks"></i>${t.subs.filter(s=>s.d).length}/${t.subs.length}</span>`:''}${t.rep?`<span><i data-lucide="repeat"></i>${t.rep}</span>`:''}${t.focus?`<span><i data-lucide="timer"></i>${fmt(t.focus)} focused</span>`:''}</div>
  <div class="acts"><button data-a="focus" title="Focus on this"><i data-lucide="play"></i></button><button data-a="done" title="Mark done"><i data-lucide="check"></i></button><button data-a="edit" title="Rename"><i data-lucide="pencil"></i></button><button data-a="del" title="Delete"><i data-lucide="trash-2"></i></button></div></div>`;
}
function streak(){
  let n=0,i=S.focus[today()]>0?0:1;
  while(S.focus[addDays(-i)]>0){n++;i++}
  return n;
}
function render(){
  const q=$('#search').value.toLowerCase();
  ['todo','doing','done'].forEach(s=>{
    let list=S.tasks.filter(t=>t.status==s&&(t.title+t.tag).toLowerCase().includes(q));
    if(S.fm&&s=='todo')list=list.sort((a,b)=>({high:0,medium:1,low:2}[a.pri]-{high:0,medium:1,low:2}[b.pri])).slice(0,1);
    $('#l-'+s).innerHTML=list.map(card).join('')||`<p class="empty">${s=='todo'?'Nothing here. Add a task above.':'Drag tasks here.'}</p>`;
    $('#n-'+s).textContent=list.length;
  });
  const done=S.tasks.filter(t=>t.status=='done').length,f=S.focus[today()]||0,p=Math.min(100,Math.round(f/(S.goal*60)*100));
  $('#stDone').textContent=done+'/'+S.tasks.length;
  $('#stFocus').textContent=fmt(f);
  $('#ring').style.setProperty('--p',p);$('#ringTxt').textContent=p+'%';
  const st=streak();$('#stStreak').textContent=st+(st==1?' day':' days');
  const max=Math.max(30,...[...Array(7)].map((_,i)=>S.focus[addDays(i-6)]||0));
  $('#bars').innerHTML=[...Array(7)].map((_,i)=>{const m=S.focus[addDays(i-6)]||0;return `<div class="${i==6?'hi':''}" style="height:${Math.max(12,m/max*100)}%" title="${fmt(m)}"></div>`}).join('');
  const est=S.tasks.filter(t=>t.status!='done').reduce((a,t)=>a+(t.est||0),0);
  $('#warn').hidden=est<=S.goal*60;
  $('#warn').textContent=`Your open tasks add up to ${fmt(est)}, more than your ${S.goal}h daily goal. Consider moving something to another day.`;
  $('#goalIn').value=S.goal;
  if(!$('#calendar').hidden)cal();if(!$('#matrix').hidden)matrix();
  $('#fmBtn').textContent=S.fm?'Show all':'Focus mode';
  save();icons();
}
$('#addForm').onsubmit=e=>{e.preventDefault();const o=parse($('#quick').value);S.tasks.unshift({id:Date.now(),status:'todo',focus:0,...o});$('#quick').value='';render()};
$('#search').oninput=render;
$('#board').addEventListener('click',e=>{
  const b=e.target.closest('[data-a]');if(!b)return;
  const t=S.tasks.find(x=>x.id==b.closest('.card').dataset.id),a=b.dataset.a;
  if(a=='done')setStatus(t,t.status=='done'?'todo':'done');
  if(a=='del'){const i=S.tasks.indexOf(t);S.tasks.splice(i,1);toast('Task deleted','Undo',()=>{S.tasks.splice(i,0,t);render()})}
  if(a=='edit'){openEdit(t);return}
  if(a=='focus'){if(t.status!='doing')setStatus(t,'doing');T.task=t.id;view('focus');setMode(T.len,true);startT()}
  render();
});
$('#board').addEventListener('dragstart',e=>{const c=e.target.closest('.card');if(c)e.dataTransfer.setData('text',c.dataset.id)});
$$('.col').forEach(c=>{
  c.ondragover=e=>{e.preventDefault();c.classList.add('over')};
  c.ondragleave=()=>c.classList.remove('over');
  c.ondrop=e=>{e.preventDefault();c.classList.remove('over');const t=S.tasks.find(x=>x.id==e.dataTransfer.getData('text'));if(t){setStatus(t,c.dataset.s);render()}};
});

/* views */
function view(v){
  $$('.view').forEach(s=>s.hidden=s.id!=v);
  $$('#nav a').forEach(a=>a.classList.toggle('on',a.dataset.v==v));
  $('#hello').textContent={board:'Tasks',focus:'Focus',review:'Review',habits:'Habits',chat:'Assistant',progress:'Progress',calendar:'Calendar',matrix:'Priorities'}[v];
  if(v=='progress')progress();if(v=='calendar')cal();if(v=='matrix')matrix();
}
$$('#nav a').forEach(a=>a.onclick=()=>view(a.dataset.v));

/* timer */
const T={len:25,total:1500,sec:1500,iv:null,task:null,brk:false};
const draw=()=>{$('#timerDisplay').textContent=String(Math.floor(T.sec/60)).padStart(2,'0')+':'+String(T.sec%60).padStart(2,'0');
  const t=S.tasks.find(x=>x.id==T.task);$('#timerTask').textContent=t?'Working on: '+t.title:'No task selected. Press play on any card.'};
function setMode(m,keep){stopT(true);T.len=+m;T.brk=m==5;T.total=T.sec=m*60;$$('#modes button').forEach(b=>b.classList.toggle('on',b.dataset.m==m));$('#startBtn').textContent='Start';draw()}
function logT(){
  if(T.brk)return;const m=Math.floor((T.total-T.sec)/60);if(m<1)return;
  S.focus[today()]=(S.focus[today()]||0)+m;
  const t=S.tasks.find(x=>x.id==T.task);if(t)t.focus=(t.focus||0)+m;
  T.total=T.sec;render();
}
function startT(){if(T.iv)return;$('#startBtn').textContent='Pause';
  T.iv=setInterval(()=>{T.sec--;draw();if(T.sec<=0){stopT();logT();T.sec=T.total=T.len*60;draw();try{new AudioContext().resume()}catch(e){};alert('Time is up!')}},1000)}
function stopT(){clearInterval(T.iv);T.iv=null;$('#startBtn').textContent='Start'}
$('#startBtn').onclick=()=>T.iv?(stopT(),logT()):startT();
$('#resetBtn').onclick=()=>{stopT();logT();T.sec=T.total=T.len*60;draw()};
$$('#modes button').forEach(b=>b.onclick=()=>{stopT();logT();setMode(b.dataset.m)});
$('#goalBtn').onclick=()=>{S.goal=Math.max(.5,+$('#goalIn').value||3);render()};

/* review */
function revs(){$('#revList').innerHTML=S.reviews.slice(-5).reverse().map(r=>`<div class="rev"><b>${r.date}</b> · ${r.actual}/${r.planned}h${r.reason?' · '+esc(r.reason):''}<br><span class="mu">${esc(r.note||'')}</span></div>`).join('')}
$('#saveRev').onclick=()=>{S.reviews.push({date:today(),planned:$('#planned').value,actual:$('#actual').value,reason:$('#reason').value,note:$('#note').value});$('#note').value='';$('#revMsg').textContent='Review saved.';save();revs()};
$('#shutBtn').onclick=()=>{
  const a=prompt('What did you finish today?');if(a===null)return;
  const b=prompt('What is still open or blocked?');if(b===null)return;
  const c=prompt('What is the first task tomorrow?');if(c===null)return;
  S.reviews.push({date:today(),planned:$('#planned').value,actual:$('#actual').value,reason:'',note:`Finished: ${a}. Open: ${b}. Tomorrow: ${c}.`});save();revs();$('#revMsg').textContent='Shutdown saved.'};

/* habits */
function habs(){
  $('#habList').innerHTML=S.habits.map((h,i)=>{
    let n=0,k=h.d.includes(today())?0:1;while(h.d.includes(addDays(-k))){n++;k++}
    return `<div class="hab"><div><b>${esc(h.n)}</b><div class="mu">${n} day streak</div></div><div class="dots">${[...Array(7)].map((_,j)=>{const d=addDays(j-6);return `<button class="${h.d.includes(d)?'on':''}" data-h="${i}" data-d="${d}" title="${d}">${new Date(d+'T00:00').toLocaleDateString('en',{weekday:'narrow'})}</button>`}).join('')}</div></div>`}).join('')}
$('#habList').onclick=e=>{const b=e.target.closest('[data-h]');if(!b)return;const h=S.habits[b.dataset.h],d=b.dataset.d;h.d=h.d.includes(d)?h.d.filter(x=>x!=d):[...h.d,d];save();habs()};
$('#habForm').onsubmit=e=>{e.preventDefault();S.habits.push({n:$('#habIn').value.trim(),d:[]});$('#habIn').value='';save();habs()};

/* assistant */
$('#chatForm').onsubmit=async e=>{
  e.preventDefault();const m=$('#chatIn').value.trim();if(!m)return;$('#chatIn').value='';
  const add=(t,c)=>{const d=document.createElement('div');d.className='bub '+c;d.textContent=t;$('#msgs').append(d);$('#msgs').scrollTop=1e9;return d};
  add(m,'me');const w=add('Thinking...','ai');
  try{
    const r=await fetch('/api/chat',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({message:m,tasks:S.tasks.map(t=>({title:t.title,priority:t.pri,done:t.status=='done',due:t.due}))})});
    const j=await r.json();w.textContent=j.reply||j.error||'No reply.';
  }catch(err){w.textContent='Could not reach the server. Is it running?'}
};

/* calm + theme + keys */
let bi=null;
$('#calmBtn').onclick=()=>$('#calm').showModal();
$('#calmClose').onclick=()=>{clearInterval(bi);bi=null;$('#breath').classList.remove('in');$('#breathTxt').textContent='Ready';$('#calm').close()};
$('#breathBtn').onclick=()=>{if(bi)return;let on=false;const go=()=>{on=!on;$('#breath').classList.toggle('in',on);$('#breathTxt').textContent=on?'Breathe in':'Breathe out'};go();bi=setInterval(go,4000)};
const theme=()=>{document.documentElement.dataset.theme=S.dark?'dark':'';$('#themeBtn').lastChild.textContent=S.dark?'Light mode':'Dark mode'};
$('#themeBtn').onclick=()=>{S.dark=!S.dark;theme();save()};
document.addEventListener('keydown',e=>{
  if(/INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName))return;
  if(e.key=='n'){e.preventDefault();view('board');$('#quick').focus()}
  if(e.key=='/'){e.preventDefault();view('board');$('#search').focus()}
});

/* edit dialog: notes, subtasks, repeat */
let E=null,ES=[];
function openEdit(t){E=t;ES=(t.subs||[]).map(s=>({...s}));
  $('#eTitle').value=t.title;$('#eDue').value=t.due||'';$('#ePri').value=t.pri;$('#eEst').value=t.est||'';
  $('#eRep').value=t.rep||'';$('#eTag').value=t.tag||'';$('#eNote').value=t.notes||'';subsDraw();$('#edit').showModal()}
function subsDraw(){$('#eSubs').innerHTML=ES.map((s,i)=>`<div class="sub"><input type="checkbox" data-i="${i}" ${s.d?'checked':''}><span>${esc(s.t)}</span><button type="button" data-x="${i}" aria-label="Remove">&times;</button></div>`).join('')}
$('#eSubs').onclick=e=>{const x=e.target.closest('[data-x]');if(x){ES.splice(+x.dataset.x,1);subsDraw()}};
$('#eSubs').onchange=e=>{const i=e.target.dataset.i;if(i!=null)ES[i].d=e.target.checked};
$('#eSubAdd').onclick=()=>{const v=$('#eSubIn').value.trim();if(v){ES.push({t:v,d:false});$('#eSubIn').value='';subsDraw()}};
$('#eSubIn').onkeydown=e=>{if(e.key=='Enter'){e.preventDefault();$('#eSubAdd').click()}};
$('#eClose').onclick=()=>$('#edit').close();
$('#editForm').onsubmit=e=>{e.preventDefault();
  Object.assign(E,{title:$('#eTitle').value.trim()||E.title,due:$('#eDue').value,pri:$('#ePri').value,est:+$('#eEst').value||0,rep:$('#eRep').value,tag:$('#eTag').value.trim().replace(/\s/g,''),notes:$('#eNote').value,subs:ES});
  $('#edit').close();render()};

/* undo toast */
function toast(msg,btn,fn){let el=$('#toast');if(!el){el=document.createElement('div');el.id='toast';document.body.append(el)}
  el.innerHTML=`<span>${msg}</span><button>${btn}</button>`;el.classList.add('show');
  el.querySelector('button').onclick=()=>{fn();el.classList.remove('show')};
  clearTimeout(toast.t);toast.t=setTimeout(()=>el.classList.remove('show'),5000)}

/* calendar */
let cm=new Date();cm.setDate(1);
function cal(){
  const y=cm.getFullYear(),m=cm.getMonth(),off=new Date(y,m,1).getDay(),n=new Date(y,m+1,0).getDate();
  $('#calTitle').textContent=cm.toLocaleDateString('en-IN',{month:'long',year:'numeric'});
  let h=['S','M','T','W','T','F','S'].map(d=>`<b class="dh">${d}</b>`).join('')+'<div class="cd off"></div>'.repeat(off);
  for(let d=1;d<=n;d++){const ds=iso(new Date(y,m,d)),ts=S.tasks.filter(t=>t.due==ds);
    h+=`<div class="cd${ds==today()?' now':''}" data-d="${ds}"><span>${d}</span>${ts.slice(0,3).map(t=>`<em class="p-${t.pri}${t.status=='done'?' fin':''}" data-id="${t.id}">${esc(t.title)}</em>`).join('')}${ts.length>3?`<small>+${ts.length-3} more</small>`:''}</div>`}
  $('#calGrid').innerHTML=h;
}
$('#calPrev').onclick=()=>{cm.setMonth(cm.getMonth()-1);cal()};
$('#calNext').onclick=()=>{cm.setMonth(cm.getMonth()+1);cal()};
$('#calGrid').onclick=e=>{
  const em=e.target.closest('em');if(em){openEdit(S.tasks.find(t=>t.id==em.dataset.id));return}
  const c=e.target.closest('.cd[data-d]');if(!c)return;
  const n=prompt('New task for '+c.dataset.d);if(!n||!n.trim())return;
  const o=parse(n);o.due=o.due||c.dataset.d;S.tasks.unshift({id:Date.now(),status:'todo',focus:0,...o});render();cal()};

/* priorities (Eisenhower) */
function matrix(){
  const open=S.tasks.filter(t=>t.status!='done'),u=t=>t.due&&t.due<=addDays(1),im=t=>t.pri!='low';
  const q={now:t=>u(t)&&im(t),plan:t=>!u(t)&&im(t),sq:t=>u(t)&&!im(t),later:t=>!u(t)&&!im(t)};
  for(const k in q)$('#q-'+k).innerHTML=open.filter(q[k]).map(t=>`<em class="p-${t.pri}" data-id="${t.id}">${esc(t.title)}</em>`).join('')||'<p class="empty">Nothing here.</p>';
}
$('#matrix').onclick=e=>{const em=e.target.closest('em');if(em)openEdit(S.tasks.find(t=>t.id==em.dataset.id))};

/* progress */
function progress(){
  const days=[...Array(14)].map((_,i)=>addDays(i-13));
  const fo=d=>S.focus[d]||0,dn=d=>S.tasks.filter(t=>t.doneAt==d).length;
  const chart=(id,vals,f)=>{const mx=Math.max(1,...vals);$(id).innerHTML=vals.map((v,i)=>`<div><small>${v?f(v):''}</small><i style="height:${Math.max(4,v/mx*130)}px"></i><small>${new Date(days[i]+'T00:00').getDate()}</small></div>`).join('')};
  chart('#chFocus',days.map(fo),fmt);chart('#chDone',days.map(dn),v=>v);
  const tf=days.reduce((a,d)=>a+fo(d),0),act=days.filter(d=>fo(d)||dn(d)).length;
  $('#pgFocus').textContent=fmt(tf);$('#pgDone').textContent=days.reduce((a,d)=>a+dn(d),0);
  $('#pgActive').textContent=act+'/14';$('#pgAvg').textContent=fmt(act?Math.round(tf/act):0);
  const first=addDays(-83);let cells=[...Array(new Date(first+'T00:00').getDay())].map(()=>'<span></span>');
  for(let i=0;i<84;i++){const d=addDays(i-83),sc=fo(d)/30+dn(d),lv=sc==0?0:sc<1?1:sc<2?2:sc<4?3:4;
    cells.push(`<span class="l${lv}" title="${d}: ${fmt(fo(d))}, ${dn(d)} done"></span>`)}
  $('#heat').innerHTML=cells.join('');
}
/* focus mode */
$('#fmBtn').onclick=()=>{S.fm=!S.fm;render()};
const h=new Date().getHours();
$('#dateLbl').textContent=new Date().toLocaleDateString('en-IN',{weekday:'long',day:'numeric',month:'long'});
theme();draw();habs();revs();render();

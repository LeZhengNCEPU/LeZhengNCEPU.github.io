'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const {load,ROOT}=require('./build.cjs');
const {template,geometry,master,context,core}=load();
const clone=v=>JSON.parse(JSON.stringify(v));
const stateFrom=html=>JSON.parse(html.match(/<script type="application\/json" id="s">([\s\S]*?)<\/script>/)[1]);
let checks=0;function check(name,fn){fn();console.log('PASS '+name);checks++;}
check('all generated files use the maintained renderer/exporter',()=>{
  for(const [status,slug] of [['current','students'],['alumni','alumni']])assert.equal(fs.readFileSync(path.join(ROOT,'assets/maps/'+slug+'-map.html'),'utf8'),context.buildViewerHTML(geometry,master,status));
  const built=fs.readFileSync(path.join(ROOT,'assets/maps/学生分布地图_编辑器.html'),'utf8');
  assert.equal(built.match(/<script id="atlas-core">([\s\S]*?)<\/script>/)[1],core);
  for(const script of built.matchAll(/<script(?: [^>]*)?>([\s\S]*?)<\/script>/g))if(!script[0].includes('application/json'))new vm.Script(script[1]);
});
check('white 16:9 map, links and original province count coordinates',()=>{
  for(const status of ['current','alumni']){
    const s=clone(master);s.view={status,cohort:'all',province:'',page:0};
    const svg=context.createAtlas(geometry,s).renderSVG();
    assert(svg.includes('viewBox="0 0 1920 1080"'));assert(svg.includes('<rect width="1920" height="1080" fill="#FFFFFF"/>'));
    assert(!svg.includes('#F6F3EB'));
    const records=s.students.filter(p=>p.status===status);
    assert.equal([...svg.matchAll(/data-student-link=/g)].length,records.slice(0,16).filter(p=>p.bioReady).length);
    for(const [,code,x,y] of svg.matchAll(/data-count-province="(\d+)"[^>]*><circle cx="([^"]+)" cy="([^"]+)"/g)){
      const anchor=geometry.regions.find(r=>String(r.code)===code).countLabel;assert.equal(Number(x),anchor.x);assert.equal(Number(y),anchor.y);
    }
  }
  assert.deepEqual(clone(geometry.regions.find(r=>String(r.code)==='320000').countLabel),{x:822.67,y:442.33});
});
check('full category export ignores active province, cohort and page',()=>{
  const s=clone(master);s.view={status:'current',cohort:'2024',province:'320000',page:3};
  for(const status of ['current','alumni']){
    const result=stateFrom(context.buildViewerHTML(geometry,s,status));
    assert.deepEqual(result.students,master.students.filter(p=>p.status===status));
    assert.deepEqual(result.view,{status,cohort:'all',province:'',page:0});
  }
});
check('annual addition, 17th portrait pagination, missing bio/photo and graduation round trip',()=>{
  const s=clone(master),original=s.students.find(p=>p.status==='current');
  if(!original)return; // No graduation scenario when a future roster has no current students.
  s.students.push({...original,id:'annual-test',name:'年度演练',photo:'',bioReady:false});s.view={status:'current',cohort:'all',province:'',page:0};
  const app=context.createAtlas(geometry,s),currentCount=s.students.filter(p=>p.status==='current').length;
  assert.equal(app.stats().pages,Math.ceil(currentCount/16));
  while(app.stats().page<app.stats().pages-1)app.act({action:'next'});
  const svg=app.renderSVG();assert(svg.includes('data-student-id="annual-test"'));assert(!svg.includes('data-student-link="annual-test"'));assert(svg.includes('简介待补充'));assert(svg.includes('待补照片'));
  const saved=clone(app.getState()),moved=saved.students.find(p=>p.id===original.id);moved.status='alumni';moved.graduationYear=2028;moved.bioReady=false;
  const reopened=context.createAtlas(geometry,JSON.parse(JSON.stringify(saved))).getState();
  assert.equal(reopened.students.find(p=>p.id===original.id).photo,original.photo);
  const current=stateFrom(context.buildViewerHTML(geometry,reopened,'current')),alumni=stateFrom(context.buildViewerHTML(geometry,reopened,'alumni'));
  assert.equal(current.students.length,currentCount-1);assert(alumni.students.some(p=>p.id===original.id));
  for(const p of reopened.students)assert.equal(p.photoScale,saved.students.find(x=>x.id===p.id).photoScale);
});
check('province filtering uses category totals and can clear',()=>{
  const s=clone(master);s.view={status:'current',cohort:'all',province:'',page:0};const app=context.createAtlas(geometry,s),before=app.stats().total;
  app.act({province:'320000'});assert.equal(app.stats().total,before);assert.equal(app.stats().visible,s.students.filter(p=>p.status==='current'&&p.province==='320000').length);app.act({action:'clear'});assert.equal(app.stats().visible,before);
});
check('enabled biographies match the master roster and legacy links remain',()=>{
  const students=fs.readFileSync(path.join(ROOT,'students.md'),'utf8'),alumni=fs.readFileSync(path.join(ROOT,'alumni.md'),'utf8');
  for(const id of ['huanglu','liangyining','xuye'])assert(students.includes('id="'+id+'"'));
  for(const id of ['zhengjiajie','林家见'])assert(alumni.includes('id="'+id+'"'));
  for(const s of master.students.filter(p=>p.bioReady)){
    const body=s.status==='current'?students:alumni,pos=body.indexOf('id="'+s.id+'"');
    assert(pos>=0,'Missing biography '+s.id);assert.equal(body.slice(pos).match(/> \*\*([^*]+)\*\*/)?.[1],s.name);
    const section=body.match(new RegExp('<section id="'+s.id+'"[^>]*class="student-profile"[^>]*>([\\s\\S]*?)</section>'));
    assert(section&&!section[1].includes('<section'),'Biography must be a complete, separate focusable section: '+s.id);
    assert.equal(section[1].match(/> \*\*([^*]+)\*\*/)?.[1],s.name);
  }
  assert.equal(new Set(master.students.map(s=>s.id)).size,master.students.length);
});
check('offline link fallback survives redraw and editor Tab does not trap focus',()=>{
  let handler,href;
  const host={set innerHTML(value){href='/students/#student-012';},querySelectorAll(){return[{getAttribute(){return href;},setAttribute(k,v){href=v;}}];},addEventListener(type,fn){if(type==='click')handler=fn;}};
  const sandbox=vm.createContext({document:{getElementById(id){return{g:{textContent:JSON.stringify(geometry)},s:{textContent:JSON.stringify(master)},atlas:host,'navigation-notice':{hidden:true}}[id];}},location:{protocol:'file:'}});
  vm.runInContext(core+'\nmountStudentViewer();',sandbox);assert.equal(href,'https://lezheng.org/students/#student-012');
  handler({type:'click',target:{closest(q){return q==='[data-student-link]'?null:{dataset:{province:'320000'}};}},preventDefault(){}});assert.equal(href,'https://lezheng.org/students/#student-012');
  const editorHandler=template.match(/function activatePoster\(e\)\{[^\n]+/)[0];
  let prevented=false;const editorContext=vm.createContext({notify(){},atlas:{act(){}},refresh(){}});vm.runInContext(editorHandler,editorContext);
  editorContext.activatePoster({type:'keydown',key:'Tab',target:{closest(){return{getAttribute(){return '/students/';}};}},preventDefault(){prevented=true;}});assert(!prevented);
});
check('navigation: parent scroll/focus, missing target, reduced motion and native fallback',()=>{
  for(const mode of ['found','missing','reduced','standalone','cross-origin']){
    let handler,prevented=false,focused=false,scroll;
    const notice={hidden:true},target={scrollIntoView(o){scroll=o;},focus(){focused=true;}};
    const host={innerHTML:'',addEventListener(type,fn){if(type==='click')handler=fn;},querySelectorAll(){return [];}};
    const doc={getElementById(id){return {g:{textContent:JSON.stringify(geometry)},s:{textContent:JSON.stringify(master)},atlas:host,'navigation-notice':notice}[id];}};
    const win={};win.parent=mode==='standalone'?win:mode==='cross-origin'?Object.defineProperty({},'document',{get(){throw Error('cross origin');}}):{document:{getElementById(){return mode==='missing'?null:target;}},matchMedia(){return{matches:mode==='reduced'};},history:{replaceState(){}}};
    const sandbox=vm.createContext({document:doc,window:win,location:{protocol:'https:'}});vm.runInContext(core+'\nmountStudentViewer();',sandbox);
    const link={dataset:{studentLink:'student-012',studentName:'黄璐'}};
    handler({type:'click',button:0,target:{closest(q){return q==='[data-student-link]'?link:null;}},preventDefault(){prevented=true;}});
    if(['found','reduced'].includes(mode)){assert(prevented&&focused);assert.equal(scroll.behavior,mode==='reduced'?'auto':'smooth');}
    else if(mode==='missing'){assert(prevented);assert(!notice.hidden);assert(!focused);}
    else assert(!prevented);
  }
});
console.log(checks+' checks passed');

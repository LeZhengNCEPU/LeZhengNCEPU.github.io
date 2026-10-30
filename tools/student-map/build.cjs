#!/usr/bin/env node
'use strict';
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const SOURCE=__dirname,ROOT=path.resolve(SOURCE,'../..');
const read=p=>fs.readFileSync(path.join(SOURCE,p),'utf8');
const safeJSON=v=>JSON.stringify(v).replace(/</g,'\\u003c').replace(/\u2028/g,'\\u2028').replace(/\u2029/g,'\\u2029');
function load(){
  const template=read('editor_template.html'),raw=JSON.parse(read('assets/map_geometry.json')),master=JSON.parse(read('assets/student_data.json'));
  const geometry={width:raw.width,height:raw.height,insetFrame:raw.insetFrame,sourceLabel:raw.source?.sourceLabel||raw.source?.displayLabel,
    regions:raw.regions.map(r=>({code:r.code,name:r.name,shortName:r.shortName,label:r.label,countLabel:r.countLabel,main:{d:r.main.d},inset:{d:r.inset.d}})),
    boundaries:{main:{d:raw.boundaries.main.d},inset:{d:raw.boundaries.inset.d}},outline:{main:{d:raw.outline.main.d}}};
  assert(geometry.regions.every(r=>Number.isFinite(r.countLabel?.x)&&Number.isFinite(r.countLabel?.y)),'Missing province count anchor');
  const core=template.match(/<script id="atlas-core">([\s\S]*?)<\/script>/)[1],context=vm.createContext({});
  vm.runInContext(core,context,{filename:'atlas-core.js'});
  const state=JSON.parse(JSON.stringify(context.createAtlas(geometry,master).getState()));
  assert.deepEqual(state.students,master.students,'Normalization must preserve master records');
  return {template,geometry,master:state,context,core};
}
function build(){
  const {template,geometry,master,context}=load();
  // A checked biography is a publishing assertion; verify it against real Markdown.
  for(const s of master.students){
    if(!s.bioReady)continue;
    const slug=s.status==='alumni'?'alumni':'students',body=fs.readFileSync(path.join(ROOT,slug+'.md'),'utf8');
    const anchor='id="'+s.id+'"',pos=body.indexOf(anchor);
    assert(pos>=0&&body.indexOf(anchor,pos+1)===-1,'Missing or duplicate biography: '+s.id);
    const next=body.slice(pos).match(/> \*\*([^*]+)\*\*/);
    assert(next&&next[1]===s.name,'Biography name mismatch: '+s.id);
  }
  const out=path.join(ROOT,'assets/maps');
  fs.mkdirSync(out,{recursive:true});
  const editor=template.replace('__GEOMETRY_JSON__',()=>safeJSON(geometry)).replace('__STATE_JSON__',()=>safeJSON(master));
  fs.writeFileSync(path.join(out,'学生分布地图_编辑器.html'),editor);
  fs.writeFileSync(path.join(out,'学生分布地图_数据.json'),JSON.stringify(master,null,2)+'\n');
  for(const [status,slug] of [['current','students'],['alumni','alumni']]){
    fs.writeFileSync(path.join(out,slug+'-map.html'),context.buildViewerHTML(geometry,master,status));
  }
  const cssPath=path.join(ROOT,'assets/css/main.css'),marker='/* BEGIN student-pages generated from assets/less/student-pages.less */';
  const existing=fs.readFileSync(cssPath,'utf8').split(marker)[0].trimEnd();
  const styles=fs.readFileSync(path.join(ROOT,'assets/less/student-pages.less'),'utf8');
  fs.writeFileSync(cssPath,existing+'\n\n'+marker+'\n'+styles+'/* END student-pages */\n');
  const lessPath=path.join(ROOT,'assets/less/main.less'),less=fs.readFileSync(lessPath,'utf8');
  if(!less.includes('@import "student-pages.less";'))fs.writeFileSync(lessPath,less+'\n// Opt-in wide student pages, after legacy breakpoint rules.\n@import "student-pages.less";\n');
  console.log(JSON.stringify({students:master.students.filter(s=>s.status==='current').length,alumni:master.students.filter(s=>s.status==='alumni').length,photos:master.students.filter(s=>s.photo).length,biographies:master.students.filter(s=>s.bioReady).length,output:'assets/maps'},null,2));
}
if(require.main===module)build();
module.exports={load,build,ROOT};

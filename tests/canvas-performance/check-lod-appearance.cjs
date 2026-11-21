const fs=require('node:fs'),vm=require('node:vm'),ts=require('typescript'),assert=require('node:assert/strict');
class Path {
  constructor(){this.ops=[];}
  rect(...args){this.ops.push(['rect',...args]);}
  roundRect(...args){this.ops.push(['roundRect',...args]);}
  moveTo(...args){this.ops.push(['moveTo',...args]);}
  lineTo(...args){this.ops.push(['lineTo',...args]);}
  closePath(){this.ops.push(['close']);}
}
const context={exports:{},Path2D:Path,require:()=>({getNanoLodThreshold:()=>.4})};
vm.runInNewContext(ts.transpileModule(fs.readFileSync('src/utils/cardLodAppearance.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText,context);
const {cardOutline,isStandardCardLod,CARD_CORNER_RADIUS,CARD_ROUND_CORNER_RADIUS,cardCornerStyle}=context.exports;
assert.equal(isStandardCardLod(.339),false);assert.equal(isStandardCardLod(.34),true);
assert.equal(CARD_CORNER_RADIUS,20);
assert.equal(CARD_ROUND_CORNER_RADIUS,12);
assert.equal(cardCornerStyle['--card-corner-radius'],CARD_CORNER_RADIUS+'px');
assert.equal(cardCornerStyle['--card-round-corner-radius'],CARD_ROUND_CORNER_RADIUS+'px');
assert.equal(cardOutline(480,640,false).ops[0][0],'rect');
const standard=cardOutline(480,640,true);
assert.deepEqual(standard.ops[0],['moveTo',20,0]);
assert.ok(standard.ops.some(op=>op[0]==='lineTo'));assert.equal(standard.ops.at(-1)[0],'close');
for(const op of standard.ops) for(const value of op.slice(1)) assert.ok(Number.isFinite(value));
for(let i=0;i<10000;i++)assert.equal(cardOutline(480,640,true),standard);
assert.deepEqual(cardOutline(480,640,true,false).ops[0],['roundRect',0,0,480,640,12]);
assert.ok(cardOutline(8,8,true).ops.every(op=>op.slice(1).every(Number.isFinite)));
console.log('PASS: live boundary, shared native radius, 20px squircle vs 12px roundRect fallback, cached paths, small dimensions');

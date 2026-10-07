import assert from "node:assert/strict";
import test from "node:test";
import vm from "node:vm";
import fs from "node:fs";
import ts from "typescript";
function loadAction(results) {
 const calls=[];
 const client={from(table){return {async insert(){calls.push(table); const result=results[table]; if(result instanceof Error) throw result; return result ?? {error:null};}}}};
 const module={exports:{}};
 const code=ts.transpileModule(fs.readFileSync("src/actions/contact.ts","utf8"),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
 vm.runInNewContext(code,{module,exports:module.exports,require(id){if(id.includes("supabase-admin")) return {supabaseAdmin:client}; if(id.includes("supabase")) return {supabase:client}; return {getErrorMessage:()=> "internal detail"};},console:{warn(){},error(){}},Date});
 return {submit:module.exports.submitContact,calls};
}
function form() { const data=new FormData(); for(const [k,v] of Object.entries({name:"Test",email:"test@example.invalid",message:"Isolated test"}))data.set(k,v); return data; }
test("both storage failures cannot acknowledge a lost contact",async()=>{const {submit}=loadAction({contacts:{error:{message:"denied"}},leads:{error:{message:"denied"}}}); assert.equal((await submit(form())).success,false);});
test("successful lead fallback acknowledges preserved contact",async()=>{const {submit}=loadAction({contacts:{error:{message:"denied"}},leads:{error:null}}); assert.equal((await submit(form())).success,true);});
test("contacts success survives lead mirror failure",async()=>{const {submit}=loadAction({contacts:{error:null},leads:{error:{message:"denied"}}}); assert.equal((await submit(form())).success,true);});
test("storage exceptions return generic retryable failure",async()=>{const {submit}=loadAction({contacts:new Error("PRIVATE_DETAIL")}); const result=await submit(form());assert.equal(result.success,false);assert.ok(!result.error.includes("PRIVATE_DETAIL"));});
test("invalid contact never reaches storage",async()=>{const {submit,calls}=loadAction({});assert.equal((await submit(new FormData())).success,false);assert.equal(calls.length,0);});
test("public footer retains readable text without replacement or control characters",()=>{const source=fs.readFileSync("src/components/v2/AppFooter.tsx","utf8");assert.ok(!source.includes("\uFFFD"));assert.ok(!/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/.test(source));});
function loadContactUI(result) {
 const states=[];let index=0;
 const runtime={jsx:(type,props)=>({type,props}),jsxs:(type,props)=>({type,props})};
 class FakeFormData {constructor(){this.values=new Map([["fullName","Test"],["email","test@example.invalid"],["phone","0123456789"]]);}get(k){return this.values.get(k)} set(k,v){this.values.set(k,v)}}
 const module={exports:{}};
 const code=ts.transpileModule(fs.readFileSync("src/components/v2/FinalCTA.tsx","utf8"),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,jsx:ts.JsxEmit.ReactJSX}}).outputText;
 vm.runInNewContext(code,{module,exports:module.exports,FormData:FakeFormData,require(id){if(id==="react")return {useState(value){const slot=index++;states[slot]=value;return [value,v=>{states[slot]=v}];}};if(id==="react/jsx-runtime")return runtime;if(id==="lucide-react")return {};if(id.includes("contact"))return {async submitContact(){if(result instanceof Error)throw result;return result;}};throw new Error(id);}});
 const tree=module.exports.FinalCTA();
 function find(node){if(!node)return;if(Array.isArray(node)){for(const item of node){const f=find(item);if(f)return f;}}else if(typeof node==="object"){if(node.type==="form")return node;return find(node.props?.children);}}
 return {states,submit:find(tree).props.onSubmit};
}
test("contact form does not report success after server rejection",async()=>{const ui=loadContactUI({success:false,error:"Retry"});await ui.submit({preventDefault(){},currentTarget:{}});assert.equal(ui.states[1],false);});
test("contact form does not report success after network failure",async()=>{const ui=loadContactUI(new Error("network"));await ui.submit({preventDefault(){},currentTarget:{}});assert.equal(ui.states[1],false);});
test("contact form reports confirmed storage success",async()=>{const ui=loadContactUI({success:true});await ui.submit({preventDefault(){},currentTarget:{}});assert.equal(ui.states[1],true);});

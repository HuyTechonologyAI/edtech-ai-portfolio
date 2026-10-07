import assert from "node:assert/strict";
import fs from "node:fs";
const root=process.env.PUBLIC_SITE_URL || "http://127.0.0.1:3201";
const routes=["/","/affiliate","/auth","/certificate","/checkout","/contact","/pricing","/privacy","/profile","/quiz","/resources","/rewards","/roadmap","/security","/terms","/v2","/videos","/archive/home-v1"];
const result=[];const assets=new Set();
for(const route of routes){const r=await fetch(root+route);const text=await r.text();assert.equal(r.status,200,route);result.push({route,status:r.status,bytes:text.length});for(const match of text.matchAll(/(?:src|href)="([^"]+)"/g)){if(match[1].startsWith("/_next/static/"))assets.add(match[1]);}}
for(const asset of assets){const r=await fetch(root+asset);assert.equal(r.status,200,asset);result.push({asset,status:r.status});}
for(const route of ["/api/leads","/api/admin/users","/api/admin/audit-logs"]){const r=await fetch(root+route);assert.equal(r.status,401,route);result.push({route,status:r.status,boundary:"anonymous denied"});}
fs.writeFileSync(".artifacts/public-http.json",JSON.stringify({routeCount:routes.length,assetCount:assets.size,result},null,2));console.log(JSON.stringify({routeCount:routes.length,assetCount:assets.size,checks:result.length}));

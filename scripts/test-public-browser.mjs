import puppeteer from "puppeteer-core";
import fs from "node:fs";
import assert from "node:assert/strict";
const browser=await puppeteer.launch({executablePath:process.env.PUBLIC_BROWSER_EXECUTABLE || "/home/huyadmin/.cache/puppeteer/chrome-headless-shell/linux-154.0.8037.57/chrome-headless-shell-linux64/chrome-headless-shell",headless:true,args:["--no-sandbox"]});
const results=[];const errors=[];
try {
 const page=await browser.newPage();page.on("pageerror",e=>errors.push(e.message));page.on("console",m=>{if(m.type()==="error") errors.push(m.text().slice(0,500))});
 for(const [width,height] of [[1440,900],[390,844]]) {
  await page.setViewport({width,height});await page.goto((process.env.PUBLIC_SITE_URL || "http://127.0.0.1:3201")+"/",{waitUntil:"networkidle2"});
  const audit=await page.evaluate(()=>({width:innerWidth,scrollWidth:document.documentElement.scrollWidth,h1:document.querySelectorAll("h1").length,corrupt:document.body.innerText.includes("\uFFFD"),missingLabels:Array.from(document.querySelectorAll("form input,form textarea")).filter(el=>!el.labels?.length).map(el=>el.name),brokenAnchors:Array.from(document.querySelectorAll('a[href^="#"]')).map(el=>el.getAttribute("href")).filter(h=>h.length>1&&!document.getElementById(h.slice(1))),emptyNames:Array.from(document.querySelectorAll("button,a")).filter(el=>!el.textContent.trim()&&!el.getAttribute("aria-label")).length}));
  assert.ok(audit.scrollWidth<=width,"horizontal overflow");assert.equal(audit.h1,1);assert.equal(audit.corrupt,false);assert.deepEqual(audit.missingLabels,[]);assert.deepEqual(audit.brokenAnchors,[]);assert.equal(audit.emptyNames,0);
  if(width===390){await page.locator('button[aria-label="Toggle navigation menu"]').click();assert.equal(await page.$eval('button[aria-label="Toggle navigation menu"]',el=>el.getAttribute("aria-expanded")),"true");await page.keyboard.press("Escape");assert.equal(await page.$eval('button[aria-label="Toggle navigation menu"]',el=>el.getAttribute("aria-expanded")),"false");}
  await page.screenshot({path:".artifacts/public-"+width+".png",fullPage:true});results.push(audit);
 }
 for(const route of ["/privacy","/terms","/security"]) {
  await page.goto((process.env.PUBLIC_SITE_URL || "http://127.0.0.1:3201")+route,{waitUntil:"networkidle2"});
  const target=await page.$eval('footer a[href="/#solutions"]',el=>el.getAttribute("href"));assert.equal(target,"/#solutions");results.push({route,footerHomeAnchor:true});
 }
 fs.writeFileSync(".artifacts/public-browser.json",JSON.stringify({results,errors},null,2));assert.deepEqual(errors,[]);
 console.log(JSON.stringify({results,errors},null,2));
}finally{await browser.close();}

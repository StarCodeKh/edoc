import{c}from"./createLucideIcon-CNRM8mSd.js";/**
 * @license lucide-vue-next v0.544.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const u=c("check",[["path",{d:"M20 6 9 17l-5-5",key:"1gmf2c"}]]);/**
 * @license lucide-vue-next v0.544.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const f=c("x",[["path",{d:"M18 6 6 18",key:"1bl5f8"}],["path",{d:"m6 6 12 12",key:"d8bk6v"}]]);function a(){var e;let t=(e=document.querySelector('meta[name="csrf-token"]'))==null?void 0:e.getAttribute("content");if(!t){const s=document.cookie.split(";");for(let r of s){const[o,n]=r.trim().split("=");if(o==="XSRF-TOKEN"){t=decodeURIComponent(n);break}}}return t||(console.error("CSRF token not found. This may cause installation issues."),"installer-csrf-fallback")}async function d(t,e={}){const r={method:"POST",headers:{"Content-Type":"application/json","X-CSRF-TOKEN":a(),Accept:"application/json","X-Requested-With":"XMLHttpRequest"},credentials:"same-origin"},o={...r,...e,headers:{...r.headers,...e.headers}};let n=await fetch(t,o);if(n.status===419){const i=a();o.headers["X-CSRF-TOKEN"]=i,n=await fetch(t,o)}return n}async function h(t){const e=await t.text();if(!t.ok){let s="Request failed";try{s=JSON.parse(e).message||s}catch{s=e||t.statusText||s,(e.includes("<!DOCTYPE")||e.includes("<html"))&&(s=`Server returned HTML instead of JSON. Status: ${t.status}. This might be a server error page.`)}throw new Error(s)}if(!e||e.trim()==="")return{};try{return JSON.parse(e)}catch(s){throw console.error("Failed to parse JSON response:",e.substring(0,200)),new Error(`Invalid response format: ${s.message}. Response: ${e.substring(0,100)}`)}}export{u as C,f as X,h,d as i};

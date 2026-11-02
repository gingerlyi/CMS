import{u as m,j as e,L as d}from"./app-C6ZopJ1f.js";import{c as n}from"./images-DIT33PZN.js";import{c as a}from"./wrench-CGcvYNov.js";import{S as u,H as h}from"./layout-DluSg7eH.js";import{A as x}from"./app-layout-BGOnBmHT.js";import"./heading-DPogkPIz.js";import"./index-CNVG0xSt.js";import"./index-Ys2ZjLlG.js";import"./x-PCOkXtgu.js";/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const k=[["rect",{width:"20",height:"14",x:"2",y:"3",rx:"2",key:"48i651"}],["line",{x1:"8",x2:"16",y1:"21",y2:"21",key:"1svkeh"}],["line",{x1:"12",x2:"12",y1:"17",y2:"21",key:"vw1qmm"}]],y=a("Monitor",k);/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const g=[["path",{d:"M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z",key:"a7tn18"}]],b=a("Moon",g);/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const j=[["circle",{cx:"12",cy:"12",r:"4",key:"4exip2"}],["path",{d:"M12 2v2",key:"tus03m"}],["path",{d:"M12 20v2",key:"1lh1kg"}],["path",{d:"m4.93 4.93 1.41 1.41",key:"149t6j"}],["path",{d:"m17.66 17.66 1.41 1.41",key:"ptbguv"}],["path",{d:"M2 12h2",key:"1t8f8n"}],["path",{d:"M20 12h2",key:"1q8mjw"}],["path",{d:"m6.34 17.66-1.41 1.41",key:"1m8zz5"}],["path",{d:"m19.07 4.93-1.41 1.41",key:"1shlcs"}]],f=a("Sun",j);function M({className:r="",...s}){const{appearance:o,updateAppearance:i}=m(),l=[{value:"light",icon:f,label:"Terang"},{value:"dark",icon:b,label:"Gelap"},{value:"system",icon:y,label:"Sistem"}];return e.jsx("div",{className:n("inline-flex gap-1 rounded-lg bg-neutral-100 p-1 dark:bg-neutral-800",r),...s,children:l.map(({value:t,icon:c,label:p})=>e.jsxs("button",{onClick:()=>i(t),className:n("flex items-center rounded-md px-3.5 py-1.5 transition-colors",o===t?"bg-white shadow-xs dark:bg-neutral-700 dark:text-neutral-100":"text-neutral-500 hover:bg-neutral-200/60 hover:text-black dark:text-neutral-400 dark:hover:bg-neutral-700/60"),children:[e.jsx(c,{className:"-ml-1 h-4 w-4"}),e.jsx("span",{className:"ml-1.5 text-sm",children:p})]},t))})}const v=[{title:"Mode tampilan",href:"/settings/appearance"}];function H(){return e.jsxs(x,{breadcrumbs:v,children:[e.jsx(d,{title:"Mode tampilan"}),e.jsx(u,{children:e.jsxs("div",{className:"space-y-6",children:[e.jsx(h,{title:"Mode tampilan",description:"Pilih mode terang, gelap, atau ikuti sistem untuk panel admin"}),e.jsx(M,{})]})})]})}export{H as default};

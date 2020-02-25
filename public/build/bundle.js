var app=function(){"use strict";function t(){}const e=t=>t;function n(t,e){for(const n in e)t[n]=e[n];return t}function o(t){return t()}function s(){return Object.create(null)}function r(t){t.forEach(o)}function i(t){return"function"==typeof t}function a(t,e){return t!=t?e==e:t!==e||t&&"object"==typeof t||"function"==typeof t}function l(t,e,n,o){if(t){const s=c(t,e,n,o);return t[0](s)}}function c(t,e,o,s){return t[1]&&s?n(o.ctx.slice(),t[1](s(e))):o.ctx}function u(t,e,n,o){if(t[2]&&o){const s=t[2](o(n));if("object"==typeof e.dirty){const t=[],n=Math.max(e.dirty.length,s.length);for(let o=0;o<n;o+=1)t[o]=e.dirty[o]|s[o];return t}return e.dirty|s}return e.dirty}const d="undefined"!=typeof window;let f=d?()=>window.performance.now():()=>Date.now(),m=d?t=>requestAnimationFrame(t):t;const p=new Set;function $(t){p.forEach(e=>{e.c(t)||(p.delete(e),e.f())}),0!==p.size&&m($)}function g(t){let e;return 0===p.size&&m($),{promise:new Promise(n=>{p.add(e={c:t,f:n})}),abort(){p.delete(e)}}}function h(t,e){t.appendChild(e)}function y(t,e,n){t.insertBefore(e,n||null)}function x(t){t.parentNode.removeChild(t)}function b(t){return document.createElement(t)}function v(t){return document.createTextNode(t)}function w(){return v(" ")}function N(t,e,n,o){return t.addEventListener(e,n,o),()=>t.removeEventListener(e,n,o)}function E(t){return function(e){return e.preventDefault(),t.call(this,e)}}function S(t,e,n){null==n?t.removeAttribute(e):t.getAttribute(e)!==n&&t.setAttribute(e,n)}function k(t,e){e=""+e,t.data!==e&&(t.data=e)}function C(t,e){(null!=e||t.value)&&(t.value=e)}function F(t,e,n){t.classList[n?"add":"remove"](e)}let U,H,I=0,M={};function q(t,e,n,o,s,r,i,a=0){const l=16.666/o;let c="{\n";for(let t=0;t<=1;t+=l){const o=e+(n-e)*r(t);c+=100*t+`%{${i(o,1-o)}}\n`}const u=c+`100% {${i(n,1-n)}}\n}`,d=`__svelte_${function(t){let e=5381,n=t.length;for(;n--;)e=(e<<5)-e^t.charCodeAt(n);return e>>>0}(u)}_${a}`;if(!M[d]){if(!U){const t=b("style");document.head.appendChild(t),U=t.sheet}M[d]=!0,U.insertRule(`@keyframes ${d} ${u}`,U.cssRules.length)}const f=t.style.animation||"";return t.style.animation=`${f?`${f}, `:""}${d} ${o}ms linear ${s}ms 1 both`,I+=1,d}function _(t,e){t.style.animation=(t.style.animation||"").split(", ").filter(e?t=>t.indexOf(e)<0:t=>-1===t.indexOf("__svelte")).join(", "),e&&!--I&&m(()=>{if(I)return;let t=U.cssRules.length;for(;t--;)U.deleteRule(t);M={}})}function A(t,e){const n=t.getBoundingClientRect();if(e.left!==n.left||e.top!==n.top){const o=getComputedStyle(t),s="none"===o.transform?"":o.transform;t.style.transform=`${s} translate(${e.left-n.left}px, ${e.top-n.top}px)`}}function T(t){H=t}function B(){if(!H)throw new Error("Function called outside component initialization");return H}function L(t,e){B().$$.context.set(t,e)}function O(t){return B().$$.context.get(t)}const D=[],R=[],J=[],j=[],P=Promise.resolve();let z=!1;function W(t){J.push(t)}let Y=!1;const G=new Set;function K(){if(!Y){Y=!0;do{for(let t=0;t<D.length;t+=1){const e=D[t];T(e),Q(e.$$)}for(D.length=0;R.length;)R.pop()();for(let t=0;t<J.length;t+=1){const e=J[t];G.has(e)||(G.add(e),e())}J.length=0}while(D.length);for(;j.length;)j.pop()();z=!1,Y=!1,G.clear()}}function Q(t){if(null!==t.fragment){t.update(),r(t.before_update);const e=t.dirty;t.dirty=[-1],t.fragment&&t.fragment.p(t.ctx,e),t.after_update.forEach(W)}}let V;function X(){return V||(V=Promise.resolve(),V.then(()=>{V=null})),V}function Z(t,e,n){t.dispatchEvent(function(t,e){const n=document.createEvent("CustomEvent");return n.initCustomEvent(t,!1,!1,e),n}(`${e?"intro":"outro"}${n}`))}const tt=new Set;let et;function nt(){et={r:0,c:[],p:et}}function ot(){et.r||r(et.c),et=et.p}function st(t,e){t&&t.i&&(tt.delete(t),t.i(e))}function rt(t,e,n,o){if(t&&t.o){if(tt.has(t))return;tt.add(t),et.c.push(()=>{tt.delete(t),o&&(n&&t.d(1),o())}),t.o(e)}}const it={duration:0};function at(n,o,s){let r,a,l=o(n,s),c=!1,u=0;function d(){r&&_(n,r)}function m(){const{delay:o=0,duration:s=300,easing:i=e,tick:m=t,css:p}=l||it;p&&(r=q(n,0,1,s,o,i,p,u++)),m(0,1);const $=f()+o,h=$+s;a&&a.abort(),c=!0,W(()=>Z(n,!0,"start")),a=g(t=>{if(c){if(t>=h)return m(1,0),Z(n,!0,"end"),d(),c=!1;if(t>=$){const e=i((t-$)/s);m(e,1-e)}}return c})}let p=!1;return{start(){p||(_(n),i(l)?(l=l(),X().then(m)):m())},invalidate(){p=!1},end(){c&&(d(),c=!1)}}}function lt(n,o,s){let a,l=o(n,s),c=!0;const u=et;function d(){const{delay:o=0,duration:s=300,easing:i=e,tick:d=t,css:m}=l||it;m&&(a=q(n,1,0,s,o,i,m));const p=f()+o,$=p+s;W(()=>Z(n,!1,"start")),g(t=>{if(c){if(t>=$)return d(0,1),Z(n,!1,"end"),--u.r||r(u.c),!1;if(t>=p){const e=i((t-p)/s);d(1-e,e)}}return c})}return u.r+=1,i(l)?X().then(()=>{l=l(),d()}):d(),{end(t){t&&l.tick&&l.tick(1,0),c&&(a&&_(n,a),c=!1)}}}function ct(n,o,s,a){let l=o(n,s),c=a?0:1,u=null,d=null,m=null;function p(){m&&_(n,m)}function $(t,e){const n=t.b-c;return e*=Math.abs(n),{a:c,b:t.b,d:n,duration:e,start:t.start,end:t.start+e,group:t.group}}function h(o){const{delay:s=0,duration:i=300,easing:a=e,tick:h=t,css:y}=l||it,x={start:f()+s,b:o};o||(x.group=et,et.r+=1),u?d=x:(y&&(p(),m=q(n,c,o,i,s,a,y)),o&&h(0,1),u=$(x,i),W(()=>Z(n,o,"start")),g(t=>{if(d&&t>d.start&&(u=$(d,i),d=null,Z(n,u.b,"start"),y&&(p(),m=q(n,c,u.b,u.duration,0,a,l.css))),u)if(t>=u.end)h(c=u.b,1-c),Z(n,u.b,"end"),d||(u.b?p():--u.group.r||r(u.group.c)),u=null;else if(t>=u.start){const e=t-u.start;c=u.a+u.d*a(e/u.duration),h(c,1-c)}return!(!u&&!d)}))}return{run(t){i(l)?X().then(()=>{l=l(),h(t)}):h(t)},end(){p(),u=d=null}}}function ut(t,e){t.f(),function(t,e){rt(t,1,1,()=>{e.delete(t.key)})}(t,e)}function dt(t){t&&t.c()}function ft(t,e,n){const{fragment:s,on_mount:a,on_destroy:l,after_update:c}=t.$$;s&&s.m(e,n),W(()=>{const e=a.map(o).filter(i);l?l.push(...e):r(e),t.$$.on_mount=[]}),c.forEach(W)}function mt(t,e){const n=t.$$;null!==n.fragment&&(r(n.on_destroy),n.fragment&&n.fragment.d(e),n.on_destroy=n.fragment=null,n.ctx=[])}function pt(t,e){-1===t.$$.dirty[0]&&(D.push(t),z||(z=!0,P.then(K)),t.$$.dirty.fill(0)),t.$$.dirty[e/31|0]|=1<<e%31}function $t(e,n,o,i,a,l,c=[-1]){const u=H;T(e);const d=n.props||{},f=e.$$={fragment:null,ctx:null,props:l,update:t,not_equal:a,bound:s(),on_mount:[],on_destroy:[],before_update:[],after_update:[],context:new Map(u?u.$$.context:[]),callbacks:s(),dirty:c};let m=!1;f.ctx=o?o(e,d,(t,n,...o)=>{const s=o.length?o[0]:n;return f.ctx&&a(f.ctx[t],f.ctx[t]=s)&&(f.bound[t]&&f.bound[t](s),m&&pt(e,t)),n}):[],f.update(),m=!0,r(f.before_update),f.fragment=!!i&&i(f.ctx),n.target&&(n.hydrate?f.fragment&&f.fragment.l(function(t){return Array.from(t.childNodes)}(n.target)):f.fragment&&f.fragment.c(),n.intro&&st(e.$$.fragment),ft(e,n.target,n.anchor),K()),T(u)}class gt{$destroy(){mt(this,1),this.$destroy=t}$on(t,e){const n=this.$$.callbacks[t]||(this.$$.callbacks[t]=[]);return n.push(e),()=>{const t=n.indexOf(e);-1!==t&&n.splice(t,1)}}$set(){}}function ht(e){let n;return{c(){n=b("nav"),n.innerHTML='<div class="nav-center"><h1 class="nav-title">¡Expensivo!</h1> \n    <div class="tagline svelte-170i2hr">\n      ...the best way to stick to a budget is to start one\n    </div></div>',S(n,"class","nav")},m(t,e){y(t,n,e)},p:t,i:t,o:t,d(t){t&&x(n)}}}class yt extends gt{constructor(t){super(),$t(this,t,null,ht,a,{})}}function xt(t){return t<.5?4*t*t*t:.5*Math.pow(2*t-2,3)+1}function bt(t){const e=t-1;return e*e*e+1}function vt(t,{delay:e=0,duration:n=400,easing:o=xt,amount:s=5,opacity:r=0}){const i=getComputedStyle(t),a=+i.opacity,l="none"===i.filter?"":i.filter,c=a*(1-r);return{delay:e,duration:n,easing:o,css:(t,e)=>`opacity: ${a-c*e}; filter: ${l} blur(${e*s}px);`}}function wt(t,{delay:n=0,duration:o=400,easing:s=e}){const r=+getComputedStyle(t).opacity;return{delay:n,duration:o,easing:s,css:t=>`opacity: ${t*r}`}}function Nt(t,{delay:e=0,duration:n=400,easing:o=bt,x:s=0,y:r=0,opacity:i=0}){const a=getComputedStyle(t),l=+a.opacity,c="none"===a.transform?"":a.transform,u=l*(1-i);return{delay:e,duration:n,easing:o,css:(t,e)=>`\n\t\t\ttransform: ${c} translate(${(1-t)*s}px, ${(1-t)*r}px);\n\t\t\topacity: ${l-u*e}`}}function Et(t,{delay:e=0,duration:n=400,easing:o=bt}){const s=getComputedStyle(t),r=+s.opacity,i=parseFloat(s.height),a=parseFloat(s.paddingTop),l=parseFloat(s.paddingBottom),c=parseFloat(s.marginTop),u=parseFloat(s.marginBottom),d=parseFloat(s.borderTopWidth),f=parseFloat(s.borderBottomWidth);return{delay:e,duration:n,easing:o,css:t=>"overflow: hidden;"+`opacity: ${Math.min(20*t,1)*r};`+`height: ${t*i}px;`+`padding-top: ${t*a}px;`+`padding-bottom: ${t*l}px;`+`margin-top: ${t*c}px;`+`margin-bottom: ${t*u}px;`+`border-top-width: ${t*d}px;`+`border-bottom-width: ${t*f}px;`}}function St(t){let e,n,o,s,r;const i=t[1].default,a=l(i,t,t[0],null);return{c(){e=b("div"),n=b("div"),a&&a.c(),S(n,"class","modal-content"),S(e,"class","modal-container")},m(t,o){y(t,e,o),h(e,n),a&&a.m(n,null),r=!0},p(t,[e]){a&&a.p&&1&e&&a.p(c(i,t,t[0],null),u(i,t[0],e,null))},i(t){r||(st(a,t),W(()=>{s&&s.end(1),o||(o=at(e,vt,{})),o.start()}),r=!0)},o(t){rt(a,t),o&&o.invalidate(),s=lt(e,wt,{}),r=!1},d(t){t&&x(e),a&&a.d(t),t&&s&&s.end()}}}function kt(t,e,n){let{$$slots:o={},$$scope:s}=e;return t.$set=t=>{"$$scope"in t&&n(0,s=t.$$scope)},[s,o]}class Ct extends gt{constructor(t){super(),$t(this,t,kt,St,a,{})}}function Ft(e){let n,o,s;return{c(){n=b("div"),o=b("h2"),s=v(e[0]),S(n,"class","main-title")},m(t,e){y(t,n,e),h(n,o),h(o,s)},p(t,[e]){1&e&&k(s,t[0])},i:t,o:t,d(t){t&&x(n)}}}function Ut(t,e,n){let{SectionHeader:o="Section Header"}=e;return t.$set=t=>{"SectionHeader"in t&&n(0,o=t.SectionHeader)},[o]}class Ht extends gt{constructor(t){super(),$t(this,t,Ut,Ft,a,{SectionHeader:0})}}function It(t){let e;return{c(){e=b("p"),e.textContent="*please fill out required fields",S(e,"class","form-empty")},m(t,n){y(t,e,n)},d(t){t&&x(e)}}}function Mt(t){let e;return{c(){e=v("Add User Info")},m(t,n){y(t,e,n)},d(t){t&&x(e)}}}function qt(t){let e;return{c(){e=v("Update User Info")},m(t,n){y(t,e,n)},d(t){t&&x(e)}}}function _t(t){let e,n,o,s,a,l,c,u,d,f,m,p,$,g,v,k,U,H,I;const M=new Ht({props:{SectionHeader:"Tell us about yourself"}});let q=t[4]&&It();function _(t,e){return t[2]?qt:Mt}let A=_(t),T=A(t);return{c(){e=b("section"),dt(M.$$.fragment),n=w(),o=b("form"),s=b("div"),a=b("label"),a.textContent="name*",l=w(),c=b("input"),u=w(),d=b("div"),f=b("label"),f.textContent="Email*",m=w(),p=b("input"),$=w(),q&&q.c(),g=w(),v=b("button"),T.c(),k=w(),U=b("button"),U.innerHTML='<i class="fas fa-times"></i>\n      close\n    ',S(a,"for","username"),S(c,"type","text"),S(c,"id","username"),S(s,"class","form-control"),S(f,"for","email"),S(p,"type","email"),S(p,"id","date"),S(d,"class","form-control"),S(v,"type","submit"),S(v,"class","btn btn-block btn-primary"),v.disabled=t[4],F(v,"disabled",t[4]),S(U,"type","button"),S(U,"class","close-btn"),S(o,"action",""),S(o,"class","expense-form"),S(e,"class","form")},m(r,x){y(r,e,x),ft(M,e,null),h(e,n),h(e,o),h(o,s),h(s,a),h(s,l),h(s,c),C(c,t[0]),h(o,u),h(o,d),h(d,f),h(d,m),h(d,p),C(p,t[1]),h(o,$),q&&q.m(o,null),h(o,g),h(o,v),T.m(v,null),h(o,k),h(o,U),H=!0,I=[N(c,"input",t[7]),N(p,"input",t[8]),N(U,"click",(function(){i(t[3])&&t[3].apply(this,arguments)})),N(o,"submit",E(t[5]))]},p(e,[n]){t=e,1&n&&c.value!==t[0]&&C(c,t[0]),2&n&&p.value!==t[1]&&C(p,t[1]),t[4]?q||(q=It(),q.c(),q.m(o,g)):q&&(q.d(1),q=null),A!==(A=_(t))&&(T.d(1),T=A(t),T&&(T.c(),T.m(v,null))),(!H||16&n)&&(v.disabled=t[4]),16&n&&F(v,"disabled",t[4])},i(t){H||(st(M.$$.fragment,t),H=!0)},o(t){rt(M.$$.fragment,t),H=!1},d(t){t&&x(e),mt(M),q&&q.d(),T.d(),r(I)}}}function At(t,e,n){let{userName:o=""}=e,{email:s=""}=e,{isEditing:r}=e,{addUserInfo:i}=e,{hideUserForm:a}=e;let l;return t.$set=t=>{"userName"in t&&n(0,o=t.userName),"email"in t&&n(1,s=t.email),"isEditing"in t&&n(2,r=t.isEditing),"addUserInfo"in t&&n(6,i=t.addUserInfo),"hideUserForm"in t&&n(3,a=t.hideUserForm)},t.$$.update=()=>{3&t.$$.dirty&&n(4,l=!o||!s)},[o,s,r,a,l,t=>{i({userName:o,email:s}),a()},i,function(){o=this.value,n(0,o)},function(){s=this.value,n(1,s)}]}class Tt extends gt{constructor(t){super(),$t(this,t,At,_t,a,{userName:0,email:1,isEditing:2,addUserInfo:6,hideUserForm:3})}}function Bt(t){let e,n,o,s,r;return{c(){e=v(",\n      "),n=b("br"),o=w(),s=b("span"),r=v(t[0]),S(s,"class","svelte-15aq34q")},m(t,i){y(t,e,i),y(t,n,i),y(t,o,i),y(t,s,i),h(s,r)},p(t,e){1&e&&k(r,t[0])},d(t){t&&x(e),t&&x(n),t&&x(o),t&&x(s)}}}function Lt(t){let e;return{c(){e=b("h2"),e.textContent="welcome back",S(e,"class","svelte-15aq34q")},m(t,n){y(t,e,n)},d(t){t&&x(e)}}}function Ot(e){let n,o,s,r,a,l,c,u,d,f=e[0]&&Bt(e),m=e[0]&&Lt();return{c(){n=b("section"),o=b("div"),o.textContent=`${e[2].getDate()}  ${e[3][e[2].getMonth()]}, ${e[2].getFullYear()}`,s=w(),r=b("h1"),a=v("Hello\n    "),f&&f.c(),l=v("\n    !\n    "),c=b("button"),c.innerHTML='<i class="fas fa-pen"></i>',u=w(),m&&m.c(),S(o,"class","todays-date"),S(c,"class","expense-btn edit-btn svelte-15aq34q"),S(r,"class","svelte-15aq34q"),S(n,"class","svelte-15aq34q")},m(t,p){y(t,n,p),h(n,o),h(n,s),h(n,r),h(r,a),f&&f.m(r,null),h(r,l),h(r,c),h(n,u),m&&m.m(n,null),d=N(c,"click",(function(){i(e[1])&&e[1].apply(this,arguments)}))},p(t,[o]){(e=t)[0]?f?f.p(e,o):(f=Bt(e),f.c(),f.m(r,l)):f&&(f.d(1),f=null),e[0]?m||(m=Lt(),m.c(),m.m(n,null)):m&&(m.d(1),m=null)},i:t,o:t,d(t){t&&x(n),f&&f.d(),m&&m.d(),d()}}}function Dt(t,e,n){let{UserInfoName:o=""}=e,{showUserForm:s}=e,r=new Date;return t.$set=t=>{"UserInfoName"in t&&n(0,o=t.UserInfoName),"showUserForm"in t&&n(1,s=t.showUserForm)},[o,s,r,["January","February","March","April","May","June","July","August","September","October","November","December"]]}class Rt extends gt{constructor(t){super(),$t(this,t,Dt,Ot,a,{UserInfoName:0,showUserForm:1})}}function Jt(t,e,n){const o=getComputedStyle(t),s="none"===o.transform?"":o.transform,r=e.from.width/t.clientWidth,a=e.from.height/t.clientHeight,l=(e.from.left-e.to.left)/r,c=(e.from.top-e.to.top)/a,u=Math.sqrt(l*l+c*c),{delay:d=0,duration:f=(t=>120*Math.sqrt(t)),easing:m=bt}=n;return{delay:d,duration:i(f)?f(u):f,easing:m,css:(t,e)=>`transform: ${s} translate(${e*l}px, ${e*c}px);`}}function jt(t){let e,n,o,s,r,i,a,l,c,u,d,f,m,p,$,g=t[2].toString().replace(/\B(?=(\d{3})+(?!\d))/g,",")+"";return{c(){e=b("h4"),n=v("amount: $"),o=v(g),r=w(),i=b("h4"),a=v("due date: "),l=v(t[3]),u=w(),d=b("h4"),f=v("notes: "),m=v(t[4])},m(t,s){y(t,e,s),h(e,n),h(e,o),y(t,r,s),y(t,i,s),h(i,a),h(i,l),y(t,u,s),y(t,d,s),h(d,f),h(d,m),$=!0},p(t,e){(!$||4&e)&&g!==(g=t[2].toString().replace(/\B(?=(\d{3})+(?!\d))/g,",")+"")&&k(o,g),(!$||8&e)&&k(l,t[3]),(!$||16&e)&&k(m,t[4])},i(t){$||(W(()=>{s||(s=ct(e,Et,{},!0)),s.run(1)}),W(()=>{c||(c=ct(i,Et,{},!0)),c.run(1)}),W(()=>{p||(p=ct(d,Et,{},!0)),p.run(1)}),$=!0)},o(t){s||(s=ct(e,Et,{},!1)),s.run(0),c||(c=ct(i,Et,{},!1)),c.run(0),p||(p=ct(d,Et,{},!1)),p.run(0),$=!1},d(t){t&&x(e),t&&s&&s.end(),t&&x(r),t&&x(i),t&&c&&c.end(),t&&x(u),t&&x(d),t&&p&&p.end()}}}function Pt(t){let e,n,o,s,i,a,l,c,u,d,f,m,p,$,g=t[5]&&jt(t);return{c(){e=b("article"),n=b("div"),o=b("h2"),s=v(t[1]),i=w(),a=b("button"),a.innerHTML='<i class="fas fa-caret-down"></i>',l=w(),g&&g.c(),c=w(),u=b("div"),d=b("button"),d.innerHTML='<i class="fas fa-pen"></i>',f=w(),m=b("button"),m.innerHTML='<i class="fas fa-trash"></i>',S(a,"class","amount-btn svelte-1i5ctxr"),S(o,"class","svelte-1i5ctxr"),S(n,"class","expense-info"),S(d,"class","expense-btn edit-btn svelte-1i5ctxr"),S(m,"class","expense-btn delete-btn svelte-1i5ctxr"),S(u,"class","expense-buttons"),S(e,"class","single-expense")},m(r,x){y(r,e,x),h(e,n),h(n,o),h(o,s),h(o,i),h(o,a),h(n,l),g&&g.m(n,null),h(e,c),h(e,u),h(u,d),h(u,f),h(u,m),p=!0,$=[N(a,"click",t[6]),N(d,"click",t[9]),N(m,"click",t[10])]},p(t,[e]){(!p||2&e)&&k(s,t[1]),t[5]?g?(g.p(t,e),st(g,1)):(g=jt(t),g.c(),st(g,1),g.m(n,null)):g&&(nt(),rt(g,1,1,()=>{g=null}),ot())},i(t){p||(st(g),p=!0)},o(t){rt(g),p=!1},d(t){t&&x(e),g&&g.d(),r($)}}}function zt(t,e,n){let{id:o}=e,{itemName:s="Misc"}=e,{amount:r=0}=e,{date:i=null}=e,{notes:a=""}=e,l=!1;const c=O("remove"),u=O("modify");return t.$set=t=>{"id"in t&&n(0,o=t.id),"itemName"in t&&n(1,s=t.itemName),"amount"in t&&n(2,r=t.amount),"date"in t&&n(3,i=t.date),"notes"in t&&n(4,a=t.notes)},[o,s,r,i,a,l,()=>n(5,l=!l),c,u,()=>u(o),()=>c(o)]}class Wt extends gt{constructor(t){super(),$t(this,t,zt,Pt,a,{id:0,itemName:1,amount:2,date:3,notes:4})}}function Yt(t,e,n){const o=t.slice();return o[2]=e[n],o[4]=n,o}function Gt(t){let e;return{c(){e=b("h2"),e.textContent="Currently you have no expenses!",S(e,"class","svelte-lcqga7")},m(t,n){y(t,e,n)},d(t){t&&x(e)}}}function Kt(o,s){let r,i,a,l,c,u,d=t;const m=[s[2]];let p={};for(let t=0;t<m.length;t+=1)p=n(p,m[t]);const $=new Wt({props:p});return{key:o,first:null,c(){r=b("li"),dt($.$$.fragment),i=w(),this.first=r},m(t,e){y(t,r,e),ft($,r,null),h(r,i),u=!0},p(t,e){const n=2&e?function(t,e){const n={},o={},s={$$scope:1};let r=t.length;for(;r--;){const i=t[r],a=e[r];if(a){for(const t in i)t in a||(o[t]=1);for(const t in a)s[t]||(n[t]=a[t],s[t]=1);t[r]=a}else for(const t in i)s[t]=1}for(const t in o)t in n||(n[t]=void 0);return n}(m,[(o=t[2],"object"==typeof o&&null!==o?o:{})]):{};var o;$.$set(n)},r(){c=r.getBoundingClientRect()},f(){!function(t){const e=getComputedStyle(t);if("absolute"!==e.position&&"fixed"!==e.position){const{width:n,height:o}=e,s=t.getBoundingClientRect();t.style.position="absolute",t.style.width=n,t.style.height=o,A(t,s)}}(r),d(),A(r,c)},a(){d(),d=function(n,o,s,r){if(!o)return t;const i=n.getBoundingClientRect();if(o.left===i.left&&o.right===i.right&&o.top===i.top&&o.bottom===i.bottom)return t;const{delay:a=0,duration:l=300,easing:c=e,start:u=f()+a,end:d=u+l,tick:m=t,css:p}=s(n,{from:o,to:i},r);let $,h=!0,y=!1;function x(){p&&_(n,$),h=!1}return g(t=>{if(!y&&t>=u&&(y=!0),y&&t>=d&&(m(1,0),x()),!h)return!1;if(y){const e=0+1*c((t-u)/l);m(e,1-e)}return!0}),p&&($=q(n,0,1,l,a,c,p)),a||(y=!0),m(0,1),x}(r,c,Jt,{})},i(t){u||(st($.$$.fragment,t),W(()=>{l&&l.end(1),a||(a=at(r,Nt,{x:200,delay:100*s[4]})),a.start()}),u=!0)},o(t){rt($.$$.fragment,t),a&&a.invalidate(),l=lt(r,Nt,{x:-200}),u=!1},d(t){t&&x(r),mt($),t&&l&&l.end()}}}function Qt(t){let e,n,o,s,r,a,l,c,u=[],d=new Map;const f=new Ht({props:{SectionHeader:"expense list"}});let m=t[1];const p=t=>t[2].id;for(let e=0;e<m.length;e+=1){let n=Yt(t,m,e),o=p(n);d.set(o,u[e]=Kt(o,n))}let $=null;return m.length||($=Gt()),{c(){e=b("section"),n=b("div"),dt(f.$$.fragment),o=w(),s=b("button"),s.innerHTML='<i class="far fa-plus-square"></i>\n      Add a New Expense\n    ',r=w(),a=b("ul");for(let t=0;t<u.length;t+=1)u[t].c();$&&$.c(),S(s,"type","button"),S(s,"class","btn-primary svelte-lcqga7"),S(n,"class","header-row svelte-lcqga7"),S(e,"class","svelte-lcqga7")},m(d,m){y(d,e,m),h(e,n),ft(f,n,null),h(n,o),h(n,s),h(e,r),h(e,a);for(let t=0;t<u.length;t+=1)u[t].m(a,null);$&&$.m(a,null),l=!0,c=N(s,"click",(function(){i(t[0])&&t[0].apply(this,arguments)}))},p(e,[n]){const o=(t=e)[1];nt();for(let t=0;t<u.length;t+=1)u[t].r();u=function(t,e,n,o,s,r,i,a,l,c,u,d){let f=t.length,m=r.length,p=f;const $={};for(;p--;)$[t[p].key]=p;const g=[],h=new Map,y=new Map;for(p=m;p--;){const t=d(s,r,p),a=n(t);let l=i.get(a);l?o&&l.p(t,e):(l=c(a,t),l.c()),h.set(a,g[p]=l),a in $&&y.set(a,Math.abs(p-$[a]))}const x=new Set,b=new Set;function v(t){st(t,1),t.m(a,u),i.set(t.key,t),u=t.first,m--}for(;f&&m;){const e=g[m-1],n=t[f-1],o=e.key,s=n.key;e===n?(u=e.first,f--,m--):h.has(s)?!i.has(o)||x.has(o)?v(e):b.has(s)?f--:y.get(o)>y.get(s)?(b.add(o),v(e)):(x.add(s),f--):(l(n,i),f--)}for(;f--;){const e=t[f];h.has(e.key)||l(e,i)}for(;m;)v(g[m-1]);return g}(u,n,p,1,t,o,d,a,ut,Kt,null,Yt);for(let t=0;t<u.length;t+=1)u[t].a();ot(),o.length?$&&($.d(1),$=null):$||($=Gt(),$.c(),$.m(a,null))},i(t){if(!l){st(f.$$.fragment,t);for(let t=0;t<m.length;t+=1)st(u[t]);l=!0}},o(t){rt(f.$$.fragment,t);for(let t=0;t<u.length;t+=1)rt(u[t]);l=!1},d(t){t&&x(e),mt(f);for(let t=0;t<u.length;t+=1)u[t].d();$&&$.d(),c()}}}function Vt(t,e,n){let{showForm:o}=e,{expenses:s=[]}=e;return t.$set=t=>{"showForm"in t&&n(0,o=t.showForm),"expenses"in t&&n(1,s=t.expenses)},[o,s]}class Xt extends gt{constructor(t){super(),$t(this,t,Vt,Qt,a,{showForm:0,expenses:1})}}function Zt(e){let n,o,s,r,i,a,l,c=e[1].toString().replace(/\B(?=(\d{3})+(?!\d))/g,",")+"";return{c(){n=b("section"),o=b("h2"),s=v(e[0]),r=v(":\n    "),i=b("span"),a=v("$"),l=v(c),S(i,"class","svelte-1161hmq"),S(n,"class","main-title svelte-1161hmq")},m(t,e){y(t,n,e),h(n,o),h(o,s),h(o,r),h(o,i),h(i,a),h(i,l)},p(t,[e]){1&e&&k(s,t[0]),2&e&&c!==(c=t[1].toString().replace(/\B(?=(\d{3})+(?!\d))/g,",")+"")&&k(l,c)},i:t,o:t,d(t){t&&x(n)}}}function te(t,e,n){let{SectionHeader:o="Section Header"}=e,{total:s=0}=e;return t.$set=t=>{"SectionHeader"in t&&n(0,o=t.SectionHeader),"total"in t&&n(1,s=t.total)},[o,s]}class ee extends gt{constructor(t){super(),$t(this,t,te,Zt,a,{SectionHeader:0,total:1})}}function ne(t){let e;return{c(){e=b("p"),e.textContent="*Please fill out required fields",S(e,"class","form-empty")},m(t,n){y(t,e,n)},d(t){t&&x(e)}}}function oe(t){let e;return{c(){e=v("Add expense")},m(t,n){y(t,e,n)},d(t){t&&x(e)}}}function se(t){let e;return{c(){e=v("Update expense")},m(t,n){y(t,e,n)},d(t){t&&x(e)}}}function re(t){let e,n,o,s,a,l,c,u,d,f,m,p,$,g,v,k,U,H,I,M,q,_,A,T,B,L,O,D,R,J=!1;const j=new Ht({props:{SectionHeader:"add expense"}});function P(){J=!0,t[11].call(p)}let z=t[6]&&ne();function W(t,e){return t[4]?se:oe}let Y=W(t),G=Y(t);return{c(){e=b("section"),dt(j.$$.fragment),n=w(),o=b("form"),s=b("div"),a=b("label"),a.textContent="Expense name*",l=w(),c=b("input"),u=w(),d=b("div"),f=b("label"),f.textContent="Expense Ammount*",m=w(),p=b("input"),$=w(),g=b("div"),v=b("label"),v.textContent="Expense Due Date",k=w(),U=b("input"),H=w(),I=b("div"),M=b("label"),M.textContent="Expense Notes",q=w(),_=b("textarea"),A=w(),z&&z.c(),T=w(),B=b("button"),G.c(),L=w(),O=b("button"),O.innerHTML='<i class="fas fa-times"></i>\n      close\n    ',S(a,"for","name"),S(c,"type","text"),S(c,"id","name"),S(s,"class","form-control"),S(f,"for","amount"),S(p,"type","number"),S(p,"id","amount"),S(d,"class","form-control"),S(v,"for","date"),S(U,"type","date"),S(U,"id","date"),S(g,"class","form-control"),S(M,"for","notes"),S(_,"type","text"),S(_,"rows","5"),S(_,"col","100"),S(_,"id","notes"),S(_,"class","svelte-1fvj4fs"),S(I,"class","form-control"),S(B,"type","submit"),S(B,"class","btn btn-block btn-primary"),B.disabled=t[6],F(B,"disabled",t[6]),S(O,"type","button"),S(O,"class","close-btn"),S(o,"action",""),S(o,"class","expense-form"),S(e,"class","form")},m(r,x){y(r,e,x),ft(j,e,null),h(e,n),h(e,o),h(o,s),h(s,a),h(s,l),h(s,c),C(c,t[0]),h(o,u),h(o,d),h(d,f),h(d,m),h(d,p),C(p,t[1]),h(o,$),h(o,g),h(g,v),h(g,k),h(g,U),C(U,t[2]),h(o,H),h(o,I),h(I,M),h(I,q),h(I,_),C(_,t[3]),h(o,A),z&&z.m(o,null),h(o,T),h(o,B),G.m(B,null),h(o,L),h(o,O),D=!0,R=[N(c,"input",t[10]),N(p,"input",P),N(U,"input",t[12]),N(_,"input",t[13]),N(O,"click",(function(){i(t[5])&&t[5].apply(this,arguments)})),N(o,"submit",E(t[7]))]},p(e,[n]){t=e,1&n&&c.value!==t[0]&&C(c,t[0]),!J&&2&n&&C(p,t[1]),J=!1,4&n&&C(U,t[2]),8&n&&C(_,t[3]),t[6]?z||(z=ne(),z.c(),z.m(o,T)):z&&(z.d(1),z=null),Y!==(Y=W(t))&&(G.d(1),G=Y(t),G&&(G.c(),G.m(B,null))),(!D||64&n)&&(B.disabled=t[6]),64&n&&F(B,"disabled",t[6])},i(t){D||(st(j.$$.fragment,t),D=!0)},o(t){rt(j.$$.fragment,t),D=!1},d(t){t&&x(e),mt(j),z&&z.d(),G.d(),r(R)}}}function ie(t,e,n){let{addExpense:o}=e,{itemName:s=""}=e,{amount:r=null}=e,{date:i=null}=e,{notes:a=""}=e,{isEditing:l}=e,{editExpense:c}=e,{hideForm:u}=e;let d;return t.$set=t=>{"addExpense"in t&&n(8,o=t.addExpense),"itemName"in t&&n(0,s=t.itemName),"amount"in t&&n(1,r=t.amount),"date"in t&&n(2,i=t.date),"notes"in t&&n(3,a=t.notes),"isEditing"in t&&n(4,l=t.isEditing),"editExpense"in t&&n(9,c=t.editExpense),"hideForm"in t&&n(5,u=t.hideForm)},t.$$.update=()=>{3&t.$$.dirty&&n(6,d=!s||!r)},[s,r,i,a,l,u,d,t=>{l?c({itemName:s,amount:r,date:i,notes:a}):o({itemName:s,amount:r,date:i,notes:a}),n(0,s=""),n(1,r=null),n(2,i=null),n(3,a=""),u()},o,c,function(){s=this.value,n(0,s)},function(){var t;t=this.value,r=""===t?void 0:+t,n(1,r)},function(){i=this.value,n(2,i)},function(){a=this.value,n(3,a)}]}class ae extends gt{constructor(t){super(),$t(this,t,ie,re,a,{addExpense:8,itemName:0,amount:1,date:2,notes:3,isEditing:4,editExpense:9,hideForm:5})}}function le(t){let e,n,o,s,r,i;const a=t[1].default,d=l(a,t,t[0],null);return{c(){e=b("div"),n=b("div"),d&&d.c(),S(n,"class","modal-content"),S(e,"class","modal-container")},m(t,o){y(t,e,o),h(e,n),d&&d.m(n,null),i=!0},p(t,[e]){d&&d.p&&1&e&&d.p(c(a,t,t[0],null),u(a,t[0],e,null))},i(t){i||(st(d,t),W(()=>{o||(o=ct(n,Nt,{y:200},!0)),o.run(1)}),W(()=>{r&&r.end(1),s||(s=at(e,vt,{})),s.start()}),i=!0)},o(t){rt(d,t),o||(o=ct(n,Nt,{y:200},!1)),o.run(0),s&&s.invalidate(),r=lt(e,wt,{}),i=!1},d(t){t&&x(e),d&&d.d(t),t&&o&&o.end(),t&&r&&r.end()}}}function ce(t,e,n){let{$$slots:o={},$$scope:s}=e;return t.$set=t=>{"$$scope"in t&&n(0,s=t.$$scope)},[s,o]}class ue extends gt{constructor(t){super(),$t(this,t,ce,le,a,{})}}function de(t){let e;const n=new Ct({props:{$$slots:{default:[fe]},$$scope:{ctx:t}}});return{c(){dt(n.$$.fragment)},m(t,o){ft(n,t,o),e=!0},p(t,e){const o={};4194816&e&&(o.$$scope={dirty:e,ctx:t}),n.$set(o)},i(t){e||(st(n.$$.fragment,t),e=!0)},o(t){rt(n.$$.fragment,t),e=!1},d(t){mt(n,t)}}}function fe(t){let e;const n=new Tt({props:{addUserInfo:t[17],isEditing:t[9],hideUserForm:t[11]}});return{c(){dt(n.$$.fragment)},m(t,o){ft(n,t,o),e=!0},p(t,e){const o={};512&e&&(o.isEditing=t[9]),n.$set(o)},i(t){e||(st(n.$$.fragment,t),e=!0)},o(t){rt(n.$$.fragment,t),e=!1},d(t){mt(n,t)}}}function me(t){let e;const n=new ue({props:{$$slots:{default:[pe]},$$scope:{ctx:t}}});return{c(){dt(n.$$.fragment)},m(t,o){ft(n,t,o),e=!0},p(t,e){const o={};4194876&e&&(o.$$scope={dirty:e,ctx:t}),n.$set(o)},i(t){e||(st(n.$$.fragment,t),e=!0)},o(t){rt(n.$$.fragment,t),e=!1},d(t){mt(n,t)}}}function pe(t){let e;const n=new ae({props:{addExpense:t[15],itemName:t[2],amount:t[3],date:t[4],notes:t[5],isEditing:t[9],editExpense:t[16],hideForm:t[13]}});return{c(){dt(n.$$.fragment)},m(t,o){ft(n,t,o),e=!0},p(t,e){const o={};4&e&&(o.itemName=t[2]),8&e&&(o.amount=t[3]),16&e&&(o.date=t[4]),32&e&&(o.notes=t[5]),512&e&&(o.isEditing=t[9]),n.$set(o)},i(t){e||(st(n.$$.fragment,t),e=!0)},o(t){rt(n.$$.fragment,t),e=!1},d(t){mt(n,t)}}}function $e(t){let e,n,o,s,r,i,a,l,c,u;const d=new yt({});let f=t[7]&&de(t),m=t[6]&&me(t);const p=new Rt({props:{UserInfoName:t[1],showUserForm:t[10]}}),$=new ee({props:{SectionHeader:"total expenses",total:t[8]}}),g=new Xt({props:{expenses:t[0],showForm:t[12]}});return{c(){dt(d.$$.fragment),e=w(),n=b("main"),f&&f.c(),o=w(),m&&m.c(),s=w(),dt(p.$$.fragment),r=w(),dt($.$$.fragment),i=w(),dt(g.$$.fragment),a=w(),l=b("button"),l.textContent="Clear expenses",S(l,"type","button"),S(l,"class","btn btn-primary btn-block"),S(n,"class","content svelte-1vsba7f")},m(x,b){ft(d,x,b),y(x,e,b),y(x,n,b),f&&f.m(n,null),h(n,o),m&&m.m(n,null),h(n,s),ft(p,n,null),h(n,r),ft($,n,null),h(n,i),ft(g,n,null),h(n,a),h(n,l),c=!0,u=N(l,"click",t[14])},p(t,[e]){t[7]?f?(f.p(t,e),st(f,1)):(f=de(t),f.c(),st(f,1),f.m(n,o)):f&&(nt(),rt(f,1,1,()=>{f=null}),ot()),t[6]?m?(m.p(t,e),st(m,1)):(m=me(t),m.c(),st(m,1),m.m(n,s)):m&&(nt(),rt(m,1,1,()=>{m=null}),ot());const r={};2&e&&(r.UserInfoName=t[1]),p.$set(r);const i={};256&e&&(i.total=t[8]),$.$set(i);const a={};1&e&&(a.expenses=t[0]),g.$set(a)},i(t){c||(st(d.$$.fragment,t),st(f),st(m),st(p.$$.fragment,t),st($.$$.fragment,t),st(g.$$.fragment,t),c=!0)},o(t){rt(d.$$.fragment,t),rt(f),rt(m),rt(p.$$.fragment,t),rt($.$$.fragment,t),rt(g.$$.fragment,t),c=!1},d(t){mt(d,t),t&&x(e),t&&x(n),f&&f.d(),m&&m.d(),mt(p),mt($),mt(g),u()}}}function ge(t,e,n){var o;o=()=>{n(0,s=localStorage.getItem("expenses")?JSON.parse(localStorage.getItem("expenses")):[]),n(1,r=localStorage.getItem("UserInfoName")?JSON.parse(localStorage.getItem("UserInfoName")):""),n(7,f=!localStorage.getItem("UserInfoName"))},B().$$.on_mount.push(o),function(t){B().$$.after_update.push(t)}(()=>{localStorage.setItem("expenses",JSON.stringify(s)),localStorage.setItem("UserInfoName",JSON.stringify(r))});let s=[],r="",i="",a=null,l=null,c="",u=null,d=!1,f=!1;const m=()=>n(6,d=!0);let p,$;return L("remove",t=>{n(0,s=s.filter(e=>e.id!==t))}),L("modify",t=>{let e=s.find(e=>e.id===t);n(18,u=e.id),n(2,i=e.itemName),n(3,a=e.amount),n(4,l=e.date),n(5,c=e.notes),m()}),t.$$.update=()=>{1&t.$$.dirty&&n(8,p=s.reduce((t,e)=>t+e.amount,0)),262144&t.$$.dirty&&n(9,$=!!u)},[s,r,i,a,l,c,d,f,p,$,()=>n(7,f=!0),()=>{n(7,f=!1)},m,()=>{n(6,d=!1),n(18,u=null),n(3,a=null),n(2,i=""),n(4,l=null),n(5,c="")},()=>{confirm("Are you sure you would like to delete your Expense List?")&&n(0,s=[])},({itemName:t,amount:e,date:o,notes:r})=>{let i={id:Math.random()*Date.now(),itemName:t,amount:e,date:o,notes:r};n(0,s=[...s,i])},({itemName:t,amount:e,date:o,notes:r})=>{n(0,s=s.map(n=>n.id===u?{...n,itemName:t,amount:e,date:o,notes:r}:{...n})),n(18,u=null),n(3,a=null),n(2,i=""),n(4,l=null),n(5,c="")},({userName:t,email:e})=>{n(1,r=t)}]}return new class extends gt{constructor(t){super(),$t(this,t,ge,$e,a,{})}}({target:document.body,props:{name:"world"}})}();
//# sourceMappingURL=bundle.js.map

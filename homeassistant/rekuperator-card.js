/* Rekuperator Card – custom Lovelace card dla Home Assistant
   Plik: /config/www/rekuperator-card.js  → zasób: /local/rekuperator-card.js
   Obsługiwane domeny: sensor, number, input_number, select, input_select,
   switch, input_boolean, fan (bieg jako % – 0..4 → 0..100%). */

const DAYS = ["Niedziela","Poniedziałek","Wtorek","Środa","Czwartek","Piątek","Sobota"];

const CSS = `
:host{--screen:#e9e8f6;--screen2:#dcdaf0;--ink:#3d3d4a;--muted:#6c6b80;--blue:#4ab0e8;--blue-d:#2f8fd0;
 --red:#c8202c;--bar:#6f6fb8;--bar-d:#5b5ba3;--party:#c2268a;--fire:#d9792b}
*{box-sizing:border-box;-webkit-tap-highlight-color:transparent}
ha-card{overflow:hidden;background:#1d1d20;padding:10px;border-radius:12px}
.screen{background:linear-gradient(180deg,var(--screen),var(--screen2));border-radius:4px;color:var(--ink);
 position:relative;display:flex;flex-direction:column;font-family:"Segoe UI",Roboto,Arial,sans-serif;min-height:280px}
.top{display:flex;justify-content:space-between;align-items:center;padding:7px 12px;border-bottom:1px solid #b9b8cf;color:var(--muted);font-size:15px}
.main{flex:1;display:grid;grid-template-columns:1fr 1.25fr 1fr;align-items:center;padding:6px 8px;gap:4px}
.col{display:flex;flex-direction:column;gap:26px}
.temp{display:flex;align-items:center;gap:6px;cursor:pointer}
.right .temp{justify-content:flex-end}.right .temp>div{text-align:right}
.temp svg{width:26px;height:52px;flex:none}
.tv{font-size:34px;font-weight:300;letter-spacing:-1px;line-height:1}
.tv sup{font-size:.45em;vertical-align:top}
.tl{font-size:13px;color:var(--muted);margin-top:2px}
.house{width:100%;cursor:pointer;display:block}
.fan{transform-box:fill-box;transform-origin:center;animation:spin var(--spd,1.2s) linear infinite}
.fan.stop,.flow.stop{animation:none}
@keyframes spin{to{transform:rotate(360deg)}}
.flow{stroke-dasharray:6 6;animation:flow var(--fl,1.2s) linear infinite}
@keyframes flow{to{stroke-dashoffset:-12}}
.bar{display:grid;grid-template-columns:repeat(4,1fr);gap:2px;background:#cfcde6}
.tab{border:0;color:#fff;background:linear-gradient(180deg,var(--bar),var(--bar-d));padding:6px 2px;min-height:50px;
 display:flex;align-items:center;justify-content:center;gap:6px;font:inherit;font-size:14px;cursor:pointer}
.tab svg{width:22px;height:22px;flex:none}.tab .l{text-align:center;line-height:1.15}
.tab small{display:block;font-variant-numeric:tabular-nums}
.tab.on.party{background:linear-gradient(180deg,#d23a9a,var(--party))}
.tab.on.fire{background:linear-gradient(180deg,#e88d3f,var(--fire))}
.bg{position:absolute;inset:0;background:rgba(40,40,60,.35);display:none;align-items:flex-end;z-index:2}
.bg.open{display:flex}
.sheet{width:100%;max-height:95%;overflow:auto;background:#f4f3fb;border-top:3px solid var(--bar);padding:10px 14px 14px}
.sheet h2{margin:0 0 8px;font-size:17px;font-weight:600;display:flex;justify-content:space-between}
.x{border:0;background:none;font-size:24px;color:var(--muted);cursor:pointer;line-height:1}
.row{display:flex;justify-content:space-between;align-items:center;gap:8px;padding:8px 0;border-bottom:1px solid #e0dfee;flex-wrap:wrap}
.row:last-child{border:0}
.seg{display:flex;gap:5px;flex-wrap:wrap}
.seg button{border:1px solid #bdbbe0;background:#fff;color:var(--ink);border-radius:8px;padding:7px 11px;font:inherit;font-size:14px;cursor:pointer;min-width:42px}
.seg button.sel{background:var(--bar);color:#fff;border-color:var(--bar)}
.big{width:100%;border:0;border-radius:10px;padding:11px;font:inherit;font-size:15px;color:#fff;background:#8a8aa0;cursor:pointer;margin-top:8px}
.muted{color:var(--muted);font-size:13px;margin:4px 0}
.sw{position:relative;width:48px;height:28px;flex:none}.sw input{opacity:0;width:0;height:0}
.sw span{position:absolute;inset:0;background:#c9c8dc;border-radius:28px;transition:.2s;cursor:pointer}
.sw span::before{content:"";position:absolute;width:22px;height:22px;left:3px;top:3px;background:#fff;border-radius:50%;transition:.2s}
.sw input:checked+span{background:var(--bar)}.sw input:checked+span::before{transform:translateX(20px)}
.na{opacity:.45;pointer-events:none}
@media (max-width:420px){.tv{font-size:28px}.tab{font-size:12px}.tab svg{width:18px}}
`;

const THERM = c => `<svg viewBox="0 0 24 48"><rect x="8" y="2" width="8" height="32" rx="4" fill="#fff" stroke="#9aa" stroke-width="1.5"/>
<rect x="10.5" y="${c==="b"?16:12}" width="3" height="${c==="b"?20:24}" fill="var(--${c==="b"?"blue":"red"})"/>
<circle cx="12" cy="38" r="7" fill="var(--${c==="b"?"blue":"red"})" stroke="#9aa" stroke-width="1.5"/>
<path d="M17 8h3M17 12h3M17 16h3M17 20h3" stroke="#9aa"/></svg>`;
const BLADE = `<path d="M0 0C-2-4-2-9 0-10 3-9 3-4 0 0Z"/>`;
const FAN = (x,y) => `<g transform="translate(${x} ${y})"><circle r="13" fill="#2b2b33"/><g class="fan" fill="#fff">
${[0,90,180,270].map(r=>`<g transform="rotate(${r})">${BLADE}</g>`).join("")}<circle r="2.2" fill="#2b2b33"/></g></g>`;

class RekuperatorCard extends HTMLElement {
  setConfig(config){
    this._cfg = { party_options:[30,60,90,120], fire_options:[10,15,20,30], fan_max:4,
                  programs:null, ...config, entities:{...(config.entities||{})} };
    this._open = null;
    if (!this.shadowRoot) this.attachShadow({mode:"open"});
    this._build();
  }
  getCardSize(){ return 6; }
  static getStubConfig(){ return { entities:{} }; }

  set hass(h){ this._hass = h; this._update(); }

  /* ---------- helpers ---------- */
  _e(k){ const id=this._cfg.entities[k]; return id && this._hass ? this._hass.states[id] : undefined; }
  _num(k){ const s=this._e(k); const v=s?parseFloat(s.state):NaN; return isNaN(v)?null:v; }
  _fan(){ const s=this._e("fan"); if(!s) return null;
    if (s.entity_id.startsWith("fan.")) return s.state==="off"?0:Math.round((s.attributes.percentage||0)/100*this._cfg.fan_max);
    return this._num("fan"); }
  _on(k){ const s=this._e(k); return s ? s.state==="on" : false; }
  _min(k){ return this._num(k)||0; }
  _set(k,val){
    const id=this._cfg.entities[k]; if(!id) return;
    const d=id.split(".")[0], h=this._hass;
    if (d==="number"||d==="input_number") h.callService(d,"set_value",{entity_id:id,value:val});
    else if (d==="select"||d==="input_select") h.callService(d,"select_option",{entity_id:id,option:val});
    else if (d==="switch"||d==="input_boolean") h.callService(d,val?"turn_on":"turn_off",{entity_id:id});
    else if (d==="fan") val ? h.callService("fan","set_percentage",{entity_id:id,percentage:Math.round(val/this._cfg.fan_max*100)})
                            : h.callService("fan","turn_off",{entity_id:id});
  }
  _more(k){ const id=this._cfg.entities[k]; if(!id) return;
    this.dispatchEvent(new CustomEvent("hass-more-info",{detail:{entityId:id},bubbles:true,composed:true})); }

  /* ---------- build ---------- */
  _build(){
    const T=(id,lbl,c)=>`<div class="temp" data-more="${id}">${THERM(c)}<div><div class="tv" id="${id}">--<sup>°</sup></div><div class="tl">${lbl}</div></div></div>`;
    this.shadowRoot.innerHTML = `<style>${CSS}</style><ha-card><div class="screen">
      <div class="top"><span>${this._cfg.title||""}</span><span id="clock"></span></div>
      <div class="main">
        <div class="col">${T("t_out","Zewnętrzna","b")}${T("t_room","Pomieszczenia","r")}</div>
        <svg class="house" id="house" viewBox="0 0 260 230">
          <path d="M30 108 L130 22 L230 108" fill="none" stroke="var(--blue)" stroke-width="14" stroke-linejoin="round"/>
          <path d="M58 95 V210 H202 V95" fill="none" stroke="var(--blue)" stroke-width="10" stroke-linejoin="round"/>
          <path class="flow" d="M2 52 C40 44 70 60 100 98 L124 122" fill="none" stroke="var(--blue)" stroke-width="5"/>
          <path class="flow" d="M136 122 L162 96 L175 76 H238" fill="none" stroke="var(--blue)" stroke-width="5"/>
          <path d="M236 68 L250 76 L236 84 Z" fill="var(--blue)"/>
          <rect x="114" y="106" width="32" height="32" transform="rotate(45 130 122)" fill="rgba(160,150,230,.25)" stroke="#a79ee0" stroke-width="2.5"/>
          <path class="flow" d="M86 180 V140 H106 L124 122" fill="none" stroke="var(--red)" stroke-width="5"/>
          <path class="flow" d="M136 122 L152 138 H178 V178" fill="none" stroke="var(--red)" stroke-width="5"/>
          <path d="M170 176 L178 192 L186 176 Z" fill="var(--red)"/>
          ${FAN(162,92)}${FAN(150,138)}
          <g id="b1" transform="translate(112 56)"></g><g id="b2" transform="translate(112 168)"></g>
        </svg>
        <div class="col right">${T("t_exh","Wyrzutowa","b")}${T("t_sup","Nawiewana","r")}</div>
      </div>
      <div class="bar">
        <button class="tab" data-s="programs"><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="#fff"/><path d="M12 6v6h5" stroke="var(--bar-d)" stroke-width="2" fill="none" stroke-linecap="round"/></svg><span class="l" id="progL">Programy</span></button>
        <button class="tab party" id="tP" data-s="party"><svg viewBox="0 0 24 24" fill="#fff"><path d="M4 3h16l-7 9v7h4v2H7v-2h4v-7z"/></svg><span class="l">Impreza<small id="pT">00:00</small></span></button>
        <button class="tab fire" id="tF" data-s="fire"><svg viewBox="0 0 24 24" fill="#fff"><path d="M12 2c1 4 5 5 5 10a5 5 0 0 1-10 0c0-2 1-3 2-4 0 2 1 3 2 3 0-3-1-5 1-9zM4 20h16v2H4z"/></svg><span class="l">Kominek<small id="fT">00:00</small></span></button>
        <button class="tab" data-s="settings"><svg viewBox="0 0 24 24" fill="#fff"><circle cx="9" cy="10" r="6"/><circle cx="9" cy="10" r="2.3" fill="var(--bar-d)"/><circle cx="18" cy="17" r="4"/><circle cx="18" cy="17" r="1.5" fill="var(--bar-d)"/></svg><span class="l">Ustawienia</span></button>
      </div>
      <div class="bg" id="bg"><div class="sheet" id="sheet"></div></div>
    </div></ha-card>`;

    const r=this.shadowRoot, $=id=>r.getElementById(id);
    this.$=$;
    r.querySelectorAll(".tab").forEach(b=>b.onclick=()=>this._openSheet(b.dataset.s));
    r.querySelectorAll("[data-more]").forEach(t=>t.onclick=()=>this._more(t.dataset.more));
    $("house").onclick=()=>this._openSheet("settings");
    $("bg").addEventListener("click",e=>{
      if (e.target.id==="bg"||e.target.closest(".x")) return this._close();
      const b=e.target.closest("[data-a]"); if(!b||b.tagName==="INPUT") return;
      const a=b.dataset.a, v=b.dataset.v;
      if (a==="program") this._set("program",v);
      if (a==="fan") this._set("fan",+v);
      if (a==="party"){ this._set("party",+v); if(+v) this._set("fire",0); }
      if (a==="fire"){ this._set("fire",+v); if(+v) this._set("party",0); }
    });
    $("bg").addEventListener("change",e=>{ if(e.target.dataset.a==="bypass") this._set("bypass",e.target.checked); });
    clearInterval(this._clk); this._clk=setInterval(()=>this._clock(),10000); this._clock();
  }

  disconnectedCallback(){ clearInterval(this._clk); }

  _clock(){ const d=new Date(), c=this.$&&this.$("clock"); if(c)
    c.textContent=`${DAYS[d.getDay()]} ${String(d.getHours()).padStart(2,"0")}:${String(d.getMinutes()).padStart(2,"0")}`; }

  /* ---------- update ---------- */
  _update(){
    if(!this._hass||!this.$) return;
    const $=this.$, f=v=>v==null?"--<sup>°</sup>":`${v.toFixed(1)}<sup>°</sup>`;
    $("t_out").innerHTML=f(this._num("t_out")); $("t_room").innerHTML=f(this._num("t_room"));
    $("t_exh").innerHTML=f(this._num("t_exh")); $("t_sup").innerHTML=f(this._num("t_sup"));
    const party=this._min("party"), fire=this._min("fire");
    const lvl = party>0 ? this._cfg.fan_max : (this._fan()??0);
    const bars=(g,l)=>g.innerHTML=[0,1,2,3].map(i=>{const h=5+i*4;
      return `<rect x="${i*8}" y="${18-h}" width="5" height="${h}" fill="${i<l?'var(--blue-d)':'none'}" stroke="var(--blue-d)" stroke-width="1.3"/>`}).join("");
    bars($("b1"),lvl); bars($("b2"),fire>0?Math.max(0,lvl-1):lvl);
    this.shadowRoot.querySelectorAll(".fan").forEach(e=>{e.style.setProperty("--spd",lvl?(2.4/lvl)+"s":"0s");e.classList.toggle("stop",!lvl);});
    this.shadowRoot.querySelectorAll(".flow").forEach(e=>{e.style.setProperty("--fl",(2.4/Math.max(lvl,1))+"s");e.classList.toggle("stop",!lvl);});
    const hm=m=>`${String(Math.floor(m/60)).padStart(2,"0")}:${String(Math.round(m%60)).padStart(2,"0")}`;
    $("pT").textContent=hm(party); $("fT").textContent=hm(fire);
    $("tP").classList.toggle("on",party>0); $("tF").classList.toggle("on",fire>0);
    $("tP").classList.toggle("na",!this._cfg.entities.party); $("tF").classList.toggle("na",!this._cfg.entities.fire);
    const p=this._e("program"); $("progL").textContent = p && p.state!=="Auto" ? p.state : "Programy";
    if (this._open) this._draw(this._open);
  }

  _openSheet(n){ this._open=n; this._draw(n); this.$("bg").classList.add("open"); }
  _close(){ this._open=null; this.$("bg").classList.remove("open"); }

  _draw(n){
    const seg=(opts,cur,a)=>`<div class="seg">${opts.map(o=>`<button class="${String(o.v)===String(cur)?'sel':''}" data-a="${a}" data-v="${o.v}">${o.l}</button>`).join("")}</div>`;
    const h=(t)=>`<h2>${t}<button class="x">×</button></h2>`;
    const party=this._min("party"), fire=this._min("fire"), c=this._cfg;
    let html="";
    if(n==="programs"){
      const p=this._e("program"), opts=c.programs||(p&&p.attributes.options)||[];
      html=h("Programy")+(p?`<div class="row"><span>Tryb pracy</span>${seg(opts.map(o=>({v:o,l:o})),p.state,"program")}</div>`
                          :`<p class="muted">Dodaj encję <b>program</b> (select) w konfiguracji karty.</p>`);
    }
    if(n==="party") html=h("Impreza")+`<p class="muted">Maksymalny bieg na określony czas.${party>0?` Pozostało <b>${Math.round(party)} min</b>.`:""}</p>
      <div class="row"><span>Czas</span>${seg(c.party_options.map(m=>({v:m,l:m+" min"})),null,"party")}</div>
      ${party>0?`<button class="big" data-a="party" data-v="0">Zakończ imprezę</button>`:""}`;
    if(n==="fire") html=h("Kominek")+`<p class="muted">Nadciśnienie przy rozpalaniu kominka.${fire>0?` Pozostało <b>${Math.round(fire)} min</b>.`:""}</p>
      <div class="row"><span>Czas</span>${seg(c.fire_options.map(m=>({v:m,l:m+" min"})),null,"fire")}</div>
      ${fire>0?`<button class="big" data-a="fire" data-v="0">Wyłącz tryb kominka</button>`:""}`;
    if(n==="settings"){
      const fan=this._fan(), lv=[...Array(c.fan_max+1).keys()];
      html=h("Ustawienia")+
        (c.entities.fan?`<div class="row"><span>Bieg wentylatorów</span>${seg(lv.map(v=>({v,l:v?String(v):"Off"})),fan,"fan")}</div>`:"")+
        (c.entities.bypass?`<div class="row"><span>Bypass (lato)</span><label class="sw"><input type="checkbox" data-a="bypass" ${this._on("bypass")?"checked":""}><span></span></label></div>`:"");
    }
    const sh=this.$("sheet"), y=sh.scrollTop; sh.innerHTML=html; sh.scrollTop=y;
  }
}

customElements.define("rekuperator-card", RekuperatorCard);
window.customCards = window.customCards || [];
window.customCards.push({type:"rekuperator-card",name:"Rekuperator",description:"Sterowanie rekuperatorem w stylu panelu ściennego"});

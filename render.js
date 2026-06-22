/* ═══════════════════════════════════════════════════════════════
   RENDER — Presupuesto Tres de Febrero
   Requiere: datos.js cargado antes que este archivo
   ─────────────────────────────────────────────────────────────
   Helpers comunes:
     fmt(n)              → formato miles con punto
     calcVar(va,vb,ipc)  → {vn, vr, col}
     semaforoColor(vr)   → color CSS
   Para modificar render de una sección: buscar "function render[Sección]"
═══════════════════════════════════════════════════════════════ */


/* ─────────────────────────────────────────────
   HELPERS COMUNES
───────────────────────────────────────────── */

// Variación nominal y real con color semáforo
function calcVar(va, vb, ipc) {
  if (va == null || vb == null || !vb) return null;
  const vn = (va - vb) / vb * 100;
  const vr = ipc ? ((1 + vn / 100) / (1 + ipc) - 1) * 100 : null;
  const col = (vr ?? vn) > 2 ? '#15803d' : (vr ?? vn) > -5 ? '#b45309' : '#b91c1c';
  return { vn, vr, col };
}

// Color semáforo solo
function semaforoColor(vr) {
  return vr > 2 ? '#15803d' : vr > -5 ? '#b45309' : '#b91c1c';
}

// Texto variación compacto
function varTxt(va, vb, ipc, { showNom = true, showReal = true } = {}) {
  const v = calcVar(va, vb, ipc);
  if (!v) return '—';
  const parts = [];
  if (showNom) parts.push(`${v.vn > 0 ? '+' : ''}${v.vn.toFixed(1)}% nom`);
  if (showReal && v.vr !== null) parts.push(`${v.vr > 0 ? '+' : ''}${v.vr.toFixed(1)}% real`);
  return parts.join(' · ');
}

// KPI delta HTML
function kpiDelta(va, vb, ipc, cmpYear) {
  const v = calcVar(va, vb, ipc);
  if (!v) return '';
  const cls = (v.vr ?? v.vn) > 2 ? 'up' : (v.vr ?? v.vn) > -5 ? 'warn' : 'down';
  const txt = v.vr !== null
    ? `vs ${cmpYear}: ${v.vn > 0 ? '+' : ''}${v.vn.toFixed(1)}% nom · ${v.vr > 0 ? '+' : ''}${v.vr.toFixed(1)}% real`
    : `vs ${cmpYear}: ${v.vn > 0 ? '+' : ''}${v.vn.toFixed(1)}%`;
  return `<div class="kpi-delta ${cls}">${txt}</div>`;
}


let activeYear = 2024;
let cmpYear    = 'none';
let activeView = 'resumen';

/* ╔══════════════════════════════════════════════════════╗
   ║  HELPERS                                             ║
   ╚══════════════════════════════════════════════════════╝ */
const fmt    = n => n == null ? '—' : n === 0 ? '—' : n.toLocaleString('es-AR', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
const fmtInt = n => n == null ? '—' : n.toLocaleString('es-AR');

function renderSimpleBars(containerId, items, color, labelWidth = 175) {
  const el = document.getElementById(containerId);
  if (!el) return;
  const validItems = items.filter(i => i.val != null && i.val > 0);
  if (!validItems.length) { el.innerHTML = '<p style="color:var(--mist);font-size:12px;font-style:italic">Sin datos para este año.</p>'; return; }
  const max = Math.max(...validItems.map(i => i.val));
  el.innerHTML = validItems.map(i => `
    <div style="margin-bottom:6px">
      <div style="display:flex;justify-content:space-between;font-size:10.5px;color:var(--ink2);margin-bottom:2px">
        <span style="max-width:${labelWidth}px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${i.label}</span>
        <span style="font-family:'JetBrains Mono',monospace;font-weight:600;color:var(--navy);flex-shrink:0;margin-left:8px">$${fmt(i.val)}M</span>
      </div>
      <div style="background:var(--bg2);border-radius:3px;height:11px;overflow:hidden">
        <div style="width:${i.val/max*100}%;height:100%;border-radius:3px;background:${color || 'var(--teal)'}"></div>
      </div>
    </div>
  `).join('');
}

/* ╔══════════════════════════════════════════════════════╗
   ║  RENDER — RESUMEN                                    ║
   ╚══════════════════════════════════════════════════════╝ */
function renderResumen() {
  const d = DATA[activeYear];
  const isPending = d.status === 'pending' || !d.resumen;
  document.getElementById('resumen-pending').style.display = isPending ? 'block' : 'none';
  document.getElementById('resumen-content').style.display = isPending ? 'none' : 'block';
  if (isPending) {
    document.querySelectorAll('#resumen-pending .po-year').forEach(e => e.textContent = activeYear);
    return;
  }
  const r = d.resumen;
  document.getElementById('resumen-titulo').textContent = `Resumen ejecutivo · ${activeYear}`;
  document.getElementById('resumen-fuente').textContent = d.fuente;

  // KPIs con comparativa
  const rc_res = cmpYear !== 'none' ? DATA[parseInt(cmpYear)]?.resumen : null;
  const ipc_res = d.ipc || 0;
  const mkDeltaRes = (val, valC, label) => {
    if (!valC || !val) return '';
    const vn = (val-valC)/valC*100;
    const vr = ipc_res ? ((1+vn/100)/(1+ipc_res)-1)*100 : null;
    const col = (vr??vn)>2?'up':(vr??vn)>-5?'warn':'down';
    const txt = vr!==null
      ? `vs ${cmpYear}: ${vn>0?'+':''}${vn.toFixed(1)}% nom · ${vr>0?'+':''}${vr.toFixed(1)}% real`
      : `vs ${cmpYear}: ${vn>0?'+':''}${vn.toFixed(1)}%`;
    return `<div class="kpi-delta ${col}">${txt}</div>`;
  };
  const kpis = [
    { cl:'amber', label:'Ejecutado (devengado)',     val:`$${fmt(r.ejecutado)} M`,        sub:`Presup. aprobado: $${fmt(r.presupAprobado)} M`, extra: mkDeltaRes(r.ejecutado, rc_res?.ejecutado) },
    { cl:'green', label:'Resultado Art. 43',         val:`$${fmt(r.superavitArt43)} M`,   sub:'Percibido − Devengado corriente y capital',      extra: mkDeltaRes(r.superavitArt43, rc_res?.superavitArt43) },
    { cl:'green', label:'Resultado Art. 44 (LOM)',   val:`$${fmt(r.resultadoArt44)} M`,   sub:`${((r.resultadoArt44/r.percibido)*100).toFixed(1)}% del percibido`, extra: mkDeltaRes(r.resultadoArt44, rc_res?.resultadoArt44) },
    { cl:'blue',  label:'Saldo de caja final',       val:`$${fmt(r.saldoCajaFin)} M`,     sub:`Inicio del año: $${fmt(r.saldoCajaIni)} M`,      extra: mkDeltaRes(r.saldoCajaFin, rc_res?.saldoCajaFin) },
    { cl:'amber', label:'Deuda flotante',            val:`$${fmt(r.deudaFlotante)} M`,    sub:`${((r.deudaFlotante/r.ejecutado)*100).toFixed(1)}% del devengado`, extra: mkDeltaRes(r.deudaFlotante, rc_res?.deudaFlotante) },
    { cl:'',      label:'Ingresos corrientes perc.', val:`$${fmt(r.ingCorrientes)} M`,    sub:`Ahorro cte: $${fmt(r.ahorroCorriente)} M`,       extra: mkDeltaRes(r.ingCorrientes, rc_res?.ingCorrientes) },
    { cl:'red',   label:'Gastos corrientes',         val:`$${fmt(r.gasCorrientes)} M`,    sub:'Incluye personal y servicios',                   extra: mkDeltaRes(r.gasCorrientes, rc_res?.gasCorrientes) },
    { cl:'orange',label:'Gastos de capital',         val:`$${fmt(r.gastosCapital)} M`,    sub:`${((r.gastosCapital/r.ejecutado)*100).toFixed(1)}% del total ejecutado`, extra: mkDeltaRes(r.gastosCapital, rc_res?.gastosCapital) },
  ];
  document.getElementById('kpi-resumen').innerHTML = kpis.map(k => `
    <div class="kpi ${k.cl}">
      <div class="kpi-label">${k.label}</div>
      <div class="kpi-value">${k.val}</div>
      <div class="kpi-sub">${k.sub}</div>
      ${k.extra||''}
    </div>
  `).join('');

  // Cuenta AIF
  const rows = [
    ['Ingresos corrientes', r.ingCorrientes, false],
    ['Gastos corrientes', r.gasCorrientes, false],
    ['Ahorro corriente', r.ahorroCorriente, true, 'var(--green)'],
    ['Recursos de capital', r.recursosCapital, false],
    ['Gastos de capital', r.gastosCapital, false],
    ['Resultado financiero', r.superavitArt43, true, r.superavitArt43 >= 0 ? 'var(--teal)' : 'var(--red)'],
  ];
  document.getElementById('cuenta-aif').innerHTML = rows.map(([lbl, val, bold, col]) => `
    <div style="display:flex;justify-content:space-between;padding:.4rem 0;border-bottom:1px solid var(--borde);${bold ? 'border-top:1px solid var(--borde);margin-top:.25rem;padding-top:.5rem' : ''}">
      <span style="font-size:12px;color:${col || 'var(--ink2)'};font-weight:${bold ? 700 : 400}">${lbl}</span>
      <span style="font-family:'JetBrains Mono',monospace;font-size:${bold ? '13' : '11'}px;color:${col || 'var(--ink2)'};font-weight:${bold ? 700 : 400}">$${fmt(val)} M</span>
    </div>
  `).join('');

  // Evolución resultado
  const years = Object.keys(DATA).map(Number).filter(y => DATA[y].resumen);
  const maxAbs = Math.max(...years.map(y => Math.abs(DATA[y].resumen.superavitArt43)));
  document.getElementById('evol-resultado').innerHTML = years.map(y => {
    const res = DATA[y].resumen.superavitArt43;
    const pct  = Math.abs(res) / maxAbs * 100;
    const isOk = res >= 0;
    return `
      <div style="margin-bottom:.875rem">
        <div style="display:flex;justify-content:space-between;margin-bottom:.3rem">
          <span style="font-size:12px;color:var(--ink2)">${y}</span>
          <span style="font-family:'JetBrains Mono',monospace;font-size:12px;color:${isOk ? 'var(--green)' : 'var(--red)'}">
            ${isOk ? '+' : ''}$${fmt(res)} M
          </span>
        </div>
        <div class="surplus-bar">
          <div class="surplus-fill" style="width:${pct}%;background:linear-gradient(90deg,${isOk ? 'var(--green),rgba(5,150,105,.5)' : 'var(--red),rgba(220,38,38,.5)'})"></div>
        </div>
      </div>
    `;
  }).join('');

  // Origen recursos
  const gastos_d = d.gastos;
  const origenData = [
    { label: 'Municipal',  val: r.ingCorrientes * 0.587, color: 'var(--teal)',   pct: 58.7 },
    { label: 'Provincial', val: r.ingCorrientes * 0.414, color: 'var(--amber)',  pct: 41.4 },
    { label: 'Nacional',   val: r.ingCorrientes * 0.0004, color: 'var(--mist)', pct: 0.0  },
  ];
  document.getElementById('chart-origen').innerHTML = origenData.map(o => `
    <div style="margin-bottom:7px">
      <div style="display:flex;justify-content:space-between;font-size:11px;color:var(--ink2);margin-bottom:2px">
        <span>${o.label}</span>
        <span style="font-family:'JetBrains Mono',monospace;font-weight:600;color:var(--navy)">${o.pct}%</span>
      </div>
      <div style="background:var(--bg2);border-radius:3px;height:14px;overflow:hidden">
        <div style="width:${o.pct}%;height:100%;border-radius:3px;background:${o.color}"></div>
      </div>
    </div>
  `).join('');

  // Composición gasto
  if (gastos_d) {
    const maxG = Math.max(...gastos_d.porObjeto.map(g => g.val));
    document.getElementById('chart-gasto').innerHTML = gastos_d.porObjeto.map(g => `
      <div style="margin-bottom:6px">
        <div style="display:flex;justify-content:space-between;font-size:10.5px;color:var(--ink2);margin-bottom:2px">
          <span>${g.label}</span>
          <span style="font-family:'JetBrains Mono',monospace;font-weight:600;color:var(--navy)">${g.pct}%</span>
        </div>
        <div style="background:var(--bg2);border-radius:3px;height:11px;overflow:hidden">
          <div style="width:${g.val/maxG*100}%;height:100%;border-radius:3px;background:${g.color}"></div>
        </div>
      </div>
    `).join('');
  }

  // Top secretarías
  const topSec = [...d.secretarias].filter(s => s.val).sort((a,b)=>b.val-a.val).slice(0,6);
  renderSimpleBars('chart-top-sec', topSec, 'var(--navy)', 220);

  // Header chips
  document.getElementById('chip-ejecutado').textContent = `$${(r.ejecutado/1000).toFixed(0)}B`;
  document.getElementById('chip-resultado').textContent = `$${fmt(r.resultadoArt44)} M`;
  document.getElementById('chip-planta').textContent = fmtInt(DATA[activeYear].personal?.total);
}

/* ╔══════════════════════════════════════════════════════╗
   ║  RENDER — RECURSOS                                   ║
   ╚══════════════════════════════════════════════════════╝ */
function renderRecursos() {
  const d   = DATA[activeYear];
  const dc  = cmpYear !== 'none' ? DATA[parseInt(cmpYear)] : null;
  const rc  = dc?.recursos;
  const ipc = d.ipc || 0;  // inflación del año activo
  const isPending = d.status === 'pending' || !d.recursos;
  document.getElementById('rec-pending').style.display = isPending ? 'flex' : 'none';
  document.getElementById('rec-content').style.display = isPending ? 'none' : 'block';
  document.getElementById('rec-titulo').textContent    = `Recursos · ${activeYear}${rc ? ' vs ' + cmpYear : ''}`;
  if (isPending) { document.querySelectorAll('#rec-pending .po-year').forEach(e=>e.textContent=activeYear); return; }

  const r = d.recursos;
  const showCmp = !!rc;

  // ── Helper variación ──
  const mkVar = (val, valC) => {
    if (!val || !valC) return '';
    const vn = (val-valC)/valC*100;
    const vr = ipc ? ((1+vn/100)/(1+ipc)-1)*100 : null;
    const col = (vr??vn) > 2 ? '#15803d' : (vr??vn) > -5 ? '#b45309' : '#b91c1c';
    const txt = vr !== null
      ? `${vn>0?'+':''}${vn.toFixed(1)}% nom · ${vr>0?'+':''}${vr.toFixed(1)}% real`
      : `${vn>0?'+':''}${vn.toFixed(1)}%`;
    return `<div class="kpi-delta" style="color:${col};font-size:11px">vs ${cmpYear}: ${txt}</div>`;
  };

  // ── KPIs ──
  document.getElementById('kpi-recursos').innerHTML = [
    { cl:'amber', label:'Total percibido',     val:r.totalPercibido, valC:rc?.totalPercibido },
    { cl:'',      label:'Origen municipal',    val:r.origenMunicipal,  valC:rc?.origenMunicipal,
      sub:`${((r.origenMunicipal/r.totalPercibido)*100).toFixed(1)}% del total` },
    { cl:'blue',  label:'Origen provincial',   val:r.origenProvincial, valC:rc?.origenProvincial,
      sub:`${((r.origenProvincial/r.totalPercibido)*100).toFixed(1)}% del total` },
    { cl:'',      label:'Origen nacional',     val:r.origenNacional,   valC:rc?.origenNacional,
      sub:`${((r.origenNacional/r.totalPercibido)*100).toFixed(2)}% del total` },
  ].map(k => `<div class="kpi ${k.cl}">
    <div class="kpi-label">${k.label}</div>
    <div class="kpi-value">$${fmt(k.val)} M</div>
    <div class="kpi-sub">${k.sub||''}</div>
    ${mkVar(k.val, k.valC)}
  </div>`).join('');

  // ── Barras por tipo CON comparativa ──
  const maxTipo = Math.max(...r.tipos.map(t=>t.val), ...(rc?.tipos?.map(t=>t.val)||[0]));
  const legHTML = showCmp ? `<div style="display:flex;gap:1.5rem;margin-bottom:.75rem;font-size:12px;font-weight:600">
    <span style="display:flex;align-items:center;gap:5px"><span style="display:inline-block;width:12px;height:12px;border-radius:3px;background:rgba(13,148,136,.75)"></span>${activeYear}</span>
    <span style="display:flex;align-items:center;gap:5px"><span style="display:inline-block;width:12px;height:12px;border-radius:3px;background:rgba(180,83,9,.65)"></span>${cmpYear}</span>
  </div>` : '';

  document.getElementById('bars-rec-tipo').innerHTML = legHTML + r.tipos.map((t,i) => {
    const tc = rc?.tipos?.[i];
    const vn = tc ? ((t.val-tc.val)/tc.val*100) : null;
    const vr = (vn!==null && ipc) ? ((1+vn/100)/(1+ipc)-1)*100 : null;
    const pct = (t.val/r.totalPercibido*100).toFixed(1);
    const col = vr!==null?(vr>2?'#15803d':vr>-5?'#b45309':'#b91c1c'):'var(--mist)';
    return `<div style="margin-bottom:11px">
      <div style="display:flex;justify-content:space-between;align-items:baseline;margin-bottom:3px;gap:.5rem">
        <span style="font-size:12px;font-weight:500;color:var(--ink)">${t.label}</span>
        <div style="display:flex;gap:.75rem;align-items:baseline;flex-shrink:0">
          ${tc?`<span style="font-family:'JetBrains Mono',monospace;font-size:10px;color:rgba(180,83,9,.75)">$${fmt(tc.val)}M·${(tc.val/rc.totalPercibido*100).toFixed(1)}%</span>`:''}
          <span style="font-family:'JetBrains Mono',monospace;font-weight:700;color:rgba(13,148,136,1);font-size:12px">$${fmt(t.val)}M·<span style="font-weight:400;color:var(--mist)">${pct}%</span></span>
          ${vr!==null?`<span style="font-family:'JetBrains Mono',monospace;font-size:11px;font-weight:700;color:${col}">${vr>0?'+':''}${vr.toFixed(1)}%r</span>`:''}
        </div>
      </div>
      <div style="height:12px;background:var(--bg2);border-radius:3px;overflow:hidden;position:relative;margin-bottom:${tc?'2':'0'}px">
        <div style="position:absolute;top:0;left:0;width:${t.val/maxTipo*100}%;height:100%;background:rgba(13,148,136,.72);border-radius:3px"></div>
      </div>
      ${tc?`<div style="height:12px;background:var(--bg2);border-radius:3px;overflow:hidden;position:relative">
        <div style="position:absolute;top:0;left:0;width:${tc.val/maxTipo*100}%;height:100%;background:rgba(180,83,9,.55);border-radius:3px"></div>
      </div>`:''}
    </div>`;
  }).join('');

  // ── Barras tasas CON comparativa ──
  const maxTasa = Math.max(...r.tasas.map(t=>t.val), ...(rc?.tasas?.map(t=>t.val)||[0]));
  document.getElementById('bars-tasas').innerHTML = (showCmp ? legHTML : '') + r.tasas.map((t,i) => {
    const tc = rc?.tasas?.[i];
    const vn = tc ? ((t.val-tc.val)/tc.val*100) : null;
    const vr = (vn!==null && ipc) ? ((1+vn/100)/(1+ipc)-1)*100 : null;
    const col = vr!==null?(vr>2?'#15803d':vr>-5?'#b45309':'#b91c1c'):'var(--mist)';
    return `<div style="margin-bottom:9px">
      <div style="display:flex;justify-content:space-between;align-items:baseline;margin-bottom:3px;gap:.5rem">
        <span style="font-size:11px;font-weight:500;color:var(--ink2)">${t.label}</span>
        <div style="display:flex;gap:.5rem;align-items:baseline;flex-shrink:0">
          ${tc?`<span style="font-family:'JetBrains Mono',monospace;font-size:10px;color:rgba(180,83,9,.75)">$${fmt(tc.val)}M·${(tc.val/rc.totalPercibido*100).toFixed(1)}%</span>`:''}
          <span style="font-family:'JetBrains Mono',monospace;font-weight:700;color:rgba(13,148,136,1);font-size:11px">$${fmt(t.val)}M·<span style="font-weight:400;color:var(--mist);font-size:10px">${(t.val/r.totalPercibido*100).toFixed(1)}%</span></span>
          ${vr!==null?`<span style="font-family:'JetBrains Mono',monospace;font-size:10px;font-weight:700;color:${col}">${vr>0?'+':''}${vr.toFixed(1)}%r</span>`:''}
        </div>
      </div>
      <div style="height:11px;background:var(--bg2);border-radius:2px;overflow:hidden;position:relative;margin-bottom:${tc?'2':'0'}px">
        <div style="position:absolute;top:0;left:0;width:${t.val/maxTasa*100}%;height:100%;background:rgba(13,148,136,.72);border-radius:2px"></div>
      </div>
      ${tc?`<div style="height:11px;background:var(--bg2);border-radius:2px;overflow:hidden;position:relative">
        <div style="position:absolute;top:0;left:0;width:${tc.val/maxTasa*100}%;height:100%;background:rgba(180,83,9,.55);border-radius:2px"></div>
      </div>`:''}
    </div>`;
  }).join('');

  // ── Tabla tributarios CON comparativa ──
  const total  = r.tributarios.reduce((s,i)=>s+i.val,0);
  const totalC = rc ? rc.tributarios.reduce((s,i)=>s+i.val,0) : 0;
  const thCmp  = document.getElementById('th-cmp-trib');
  if (thCmp) { thCmp.style.display = showCmp ? '' : 'none'; thCmp.textContent = showCmp ? cmpYear+' ($M)' : ''; }
  const thVr = document.getElementById('th-vr-trib');
  if (thVr) thVr.style.display = showCmp ? '' : 'none';

  document.getElementById('tbody-trib').innerHTML = r.tributarios.map((t,i) => {
    const tc = rc?.tributarios?.find(x=>x.label===t.label) || rc?.tributarios?.[i];
    const vn = tc ? ((t.val-tc.val)/tc.val*100) : null;
    const vr = (vn!==null&&ipc) ? ((1+vn/100)/(1+ipc)-1)*100 : null;
    const col = vr!==null?(vr>2?'#15803d':vr>-5?'#b45309':'#b91c1c'):'var(--mist)';
    return `<tr>
      <td class="name">${t.label}</td>
      <td class="mono-hi yr-col">$${fmt(t.val)} M</td>
      <td class="pct yr-col">${((t.val/total)*100).toFixed(1)}%</td>
      ${showCmp?`<td class="mono yr-cmp">${tc?'$'+fmt(tc.val)+' M':'—'}</td>
      <td class="yr-cmp" style="text-align:right;font-family:'JetBrains Mono',monospace;font-size:11px;color:${col}">
        ${vn!==null?`<span style="font-size:10px;font-weight:400;color:var(--ink3)">${vn>0?'+':''}${vn.toFixed(1)}% nom</span><br>`:''}
        <span style="font-weight:700">${vr!==null?(vr>0?'+':'')+vr.toFixed(1)+'% real':'—'}</span>
      </td>`:''}
      <td><span class="badge ${t.orig?.includes('Provincial')?'badge-warn':t.orig?.includes('Nacional')?'badge-info':'badge-ok'}">${t.orig?.replace(' Afectado','')||'—'}</span></td>
    </tr>`;
  }).join('');

  // ── Fondos (sin comparativa) ──
  const fondosEl = document.getElementById('tbody-fondos');
  if (fondosEl) fondosEl.innerHTML = r.fondos?.length ? r.fondos.map(f => `
    <tr>
      <td class="name">${f.label}</td>
      <td class="mono">$${fmt(f.si)} M</td>
      <td class="mono yr-col">$${fmt(f.ing)} M</td>
      <td class="mono">$${fmt(f.eg)} M</td>
      <td class="mono-hi" style="color:${f.sc>0?'var(--green)':'var(--mist)'}">$${fmt(f.sc)} M</td>
    </tr>`).join('')
  : '<tr><td colspan="5" class="na" style="text-align:center;padding:1rem">Sin datos de fondos para este año</td></tr>';
}

/* ╔══════════════════════════════════════════════════════╗
   ║  RENDER — GASTOS                                     ║
   ╚══════════════════════════════════════════════════════╝ */
function renderGastos() {
  const d  = DATA[activeYear];
  const dc = cmpYear !== 'none' ? DATA[parseInt(cmpYear)] : null;
  const isPending = d.status === 'pending' || !d.gastos;
  document.getElementById('gas-pending').style.display = isPending ? 'flex' : 'none';
  document.getElementById('gas-content').style.display = isPending ? 'none' : 'block';
  document.getElementById('gas-titulo').textContent = `Gastos · ${activeYear}`;
  if (isPending) { document.querySelectorAll('#gas-pending .po-year').forEach(e=>e.textContent=activeYear); return; }

  const g  = d.gastos;
  const gc = dc?.gastos;
  const ipc = d.ipc || 0;  // inflación del año activo

  document.getElementById('gas-alerta').innerHTML = `<strong>Dato clave:</strong> ${g.alertaPrincipal}`;
  document.getElementById('gas-alerta').className = 'alert warn';

  // ── KPIs ──
  const kpis = g.porObjeto.map((obj, i) => {
    const objC = gc?.porObjeto?.[i];
    const vn = objC ? ((obj.val - objC.val)/objC.val*100) : null;
    const vr = (vn !== null && ipc) ? ((1+vn/100)/(1+ipc)-1)*100 : null;
    const cls = ['','red','blue','orange','amber','','violet'][i];
    return `<div class="kpi ${cls}">
      <div class="kpi-label">${obj.label}</div>
      <div class="kpi-value">$${fmt(obj.val)} M</div>
      <div class="kpi-sub">${obj.pct}% del total${obj.impago > 0 ? ' · $'+fmt(obj.impago)+' M impago' : ''}</div>
      ${vr !== null ? `<div class="kpi-delta ${vr > 2 ? 'up' : vr < -5 ? 'down' : 'warn'}">
        vs ${cmpYear}: ${vn > 0 ? '+' : ''}${vn.toFixed(1)}% nom · ${vr > 0 ? '+' : ''}${vr.toFixed(1)}% real
      </div>` : ''}
    </div>`;
  });
  kpis.push(`<div class="kpi amber">
    <div class="kpi-label">Deuda flotante</div>
    <div class="kpi-value">$${fmt(g.deudaFlotante)} M</div>
    <div class="kpi-sub">${((g.deudaFlotante/g.total)*100).toFixed(1)}% del devengado</div>
    ${gc ? `<div class="kpi-delta warn">vs ${cmpYear}: $${fmt(gc.deudaFlotante)} M</div>` : ''}
  </div>`);
  document.getElementById('kpi-gastos').innerHTML = kpis.join('');

  // ── TABLA COMPARATIVA POR OBJETO ──
  const maxG = Math.max(...g.porObjeto.map(o=>o.val), ...(gc?.porObjeto?.map(o=>o.val) || [0]));
  const hasCmp = !!gc;

  document.getElementById('bars-gastos-obj').innerHTML = hasCmp ? `
    <table style="width:100%;border-collapse:collapse;font-size:13px;margin-bottom:1rem">
      <thead>
        <tr>
          <th style="text-align:left;padding:8px 12px;background:var(--navy);color:#fff;font-weight:600;letter-spacing:.03em">Objeto del gasto</th>
          <th style="text-align:right;padding:8px 12px;background:rgba(13,148,136,.85);color:#fff;font-weight:700">${activeYear}<br><span style="font-size:9px;font-weight:400;opacity:.8">$M · %</span></th>
          <th style="text-align:right;padding:8px 12px;background:rgba(180,83,9,.80);color:#fff;font-weight:700">${cmpYear}<br><span style="font-size:9px;font-weight:400;opacity:.8">$M · %</span></th>
          <th style="text-align:right;padding:8px 12px;background:var(--navy);color:#fff;font-weight:600">Var. nominal</th>
          <th style="text-align:right;padding:8px 12px;background:var(--navy);color:#fff;font-weight:600">Var. real</th>
        </tr>
      </thead>
      <tbody>
        ${g.porObjeto.map((o,i) => {
          const oc = gc?.porObjeto?.[i];
          const vn = oc ? ((o.val-oc.val)/oc.val*100) : null;
          const vr = (vn!==null && ipc) ? ((1+vn/100)/(1+ipc)-1)*100 : null;
          const vrCls = vr>2?'#15803d':vr>-5?'#b45309':'#b91c1c';
          return `<tr style="border-bottom:1px solid var(--borde);${i%2===1?'background:var(--card2)':''}">
            <td style="padding:9px 12px;font-weight:600;color:var(--ink)">${o.label}</td>
            <td style="padding:9px 12px;text-align:right;font-family:'JetBrains Mono',monospace;font-weight:700;color:var(--navy)">$${fmt(o.val)}M<br><span style="font-size:10px;color:var(--mist);font-weight:400">${o.pct}%</span></td>
            <td style="padding:9px 12px;text-align:right;font-family:'JetBrains Mono',monospace;color:var(--ink2)">${oc?`$${fmt(oc.val)}M<br><span style="font-size:10px;color:var(--mist)">${oc.pct}%</span>`:'—'}</td>
            <td style="padding:9px 12px;text-align:right;font-family:'JetBrains Mono',monospace;font-weight:500;color:var(--ink2)">${vn!==null?(vn>0?'+':'')+vn.toFixed(1)+'%':'—'}</td>
            <td style="padding:9px 12px;text-align:right;font-family:'JetBrains Mono',monospace;font-weight:700;color:${vr!==null?vrCls:'var(--mist)'}">${vr!==null?(vr>0?'+':'')+vr.toFixed(1)+'%':'—'}</td>
          </tr>`;
        }).join('')}
      </tbody>
    </table>
  ` : g.porObjeto.map((o,i) => `<div style="margin-bottom:10px">
      <div style="display:flex;justify-content:space-between;font-size:12px;margin-bottom:3px">
        <span style="font-weight:600;color:var(--ink)">${o.label}</span>
        <span style="font-family:'JetBrains Mono',monospace;font-weight:700;color:var(--navy)">$${fmt(o.val)}M <span style="color:var(--mist);font-weight:400;font-size:10px">${o.pct}%</span></span>
      </div>
      <div style="background:var(--bg2);border-radius:3px;height:14px;overflow:hidden">
        <div style="width:${o.val/maxG*100}%;height:100%;border-radius:3px;background:${o.color}"></div>
      </div>
    </div>`).join('');

  // ── PROGRAMAS — top 20, con matching, % del total, leyenda ──
  const allProgs = g.programas || [];
  const top20 = [...allProgs].sort((a,b) => b.val - a.val).slice(0, 20);
  const totalGasto = g.total || g.programas.reduce((s,p)=>s+p.val,0);
  const gcProgs = gc?.programas || [];
  const maxP = Math.max(...top20.map(p=>p.val), ...(gcProgs.map(p=>p.val)||[0]));

  const leyendaProgHTML = gc ? `
    <div style="display:flex;gap:16px;align-items:center;margin-bottom:10px;font-size:11px">
      <span style="display:flex;align-items:center;gap:5px">
        <span style="display:inline-block;width:12px;height:12px;border-radius:3px;background:rgba(13,148,136,.80)"></span>
        <strong>${activeYear}</strong>
      </span>
      <span style="display:flex;align-items:center;gap:5px">
        <span style="display:inline-block;width:12px;height:12px;border-radius:3px;background:rgba(180,83,9,.60)"></span>
        <strong>${cmpYear}</strong>
      </span>
      <span style="color:var(--mist)">· top 20 por monto · % del total ejecutado</span>
    </div>` : `<div style="font-size:11px;color:var(--mist);margin-bottom:10px">Top 20 programas por monto · % del total ejecutado</div>`;

  document.getElementById('bars-programas').innerHTML = leyendaProgHTML + top20.map((p) => {
    const pc = findProgCmp(p.label, gcProgs);
    const vn = pc ? ((p.val - pc.val)/pc.val*100) : null;
    const vr = (vn !== null && ipc) ? ((1+vn/100)/(1+ipc)-1)*100 : null;
    const vrCol = vr!==null ? semaforoColor(vr) : 'var(--mist)';
    const pctTotal = ((p.val / totalGasto) * 100).toFixed(1);
    return `<div style="margin-bottom:10px">
      <div style="display:flex;justify-content:space-between;align-items:baseline;font-size:11px;margin-bottom:3px;gap:8px">
        <span style="color:var(--ink2);flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap" title="${p.label}">${p.label}</span>
        <span style="display:flex;gap:8px;align-items:center;flex-shrink:0">
          ${pc ? `<span style="font-family:'JetBrains Mono',monospace;font-size:10px;color:rgba(180,83,9,.85)">$${fmt(pc.val)}M</span>` : (gc ? `<span style="font-size:10px;color:var(--mist)">sin par</span>` : '')}
          <span style="font-family:'JetBrains Mono',monospace;font-weight:700;color:rgba(13,148,136,1)">$${fmt(p.val)}M</span>
          <span style="font-family:'JetBrains Mono',monospace;font-size:10px;color:var(--mist)">${pctTotal}%</span>
          ${vr!==null ? `<span style="font-family:'JetBrains Mono',monospace;font-size:10px;font-weight:700;color:${vrCol}">${vr>0?'+':''}${vr.toFixed(1)}%r</span>` : ''}
        </span>
      </div>
      <div style="display:flex;align-items:center;gap:3px;height:10px">
        ${pc ? `<div style="flex:${pc.val/maxP};height:8px;background:rgba(180,83,9,.55);border-radius:2px;min-width:0;transition:flex .4s"></div>` : ''}
        <div style="flex:${p.val/maxP};height:10px;background:rgba(13,148,136,.80);border-radius:2px;min-width:0;transition:flex .4s"></div>
        <div style="flex:${1 - Math.max(p.val, pc?.val||0)/maxP};min-width:0"></div>
      </div>
    </div>`;
  }).join('');
}


function findSecCmp(label, secs) {
  if (!secs || !secs.length) return null;
  // Exacto
  let found = secs.find(s => s.label === label);
  if (found) return found;
  // Via tabla equivalencias
  const equiv = SEC_EQUIV[label];
  if (equiv) { found = secs.find(s => s.label === equiv); if (found) return found; }
  // Búsqueda inversa
  const reverseEquiv = Object.entries(SEC_EQUIV).find(([k,v]) => v === label);
  if (reverseEquiv) { found = secs.find(s => s.label === reverseEquiv[0]); if (found) return found; }
  // Fuzzy — palabras clave
  const norm = l => l.toLowerCase().replace(/secretar[íi]a\s+(de|del)\s+/g,'').replace(/\s+/g,' ').trim();
  found = secs.find(s => norm(s.label) === norm(label));
  return found || null;
}


/* ── PIE CHARTS ── */
const PIE_COLORS = [
  'rgba(29,111,164,.80)','rgba(180,83,9,.75)','rgba(21,128,61,.75)',
  'rgba(185,28,28,.75)', 'rgba(109,40,217,.75)','rgba(194,65,12,.75)',
  'rgba(15,23,42,.70)',  'rgba(217,119,6,.75)', 'rgba(6,95,70,.75)',
  'rgba(29,78,216,.75)',
];

function drawPie(canvasId, items) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const size = 130;
  canvas.width = size; canvas.height = size;
  const cx = size/2, cy = size/2, r = size/2 - 4, ir = r * 0.52;
  const total = items.reduce((s,i)=>s+i.val,0);
  if (!total) return;
  let angle = -Math.PI/2;
  ctx.clearRect(0,0,size,size);
  items.forEach((item,i) => {
    const slice = (item.val/total)*2*Math.PI;
    ctx.beginPath();
    ctx.moveTo(cx,cy);
    ctx.arc(cx,cy,r,angle,angle+slice);
    ctx.closePath();
    ctx.fillStyle = PIE_COLORS[i % PIE_COLORS.length];
    ctx.fill();
    ctx.strokeStyle='#fff'; ctx.lineWidth=1.5; ctx.stroke();
    angle += slice;
  });
  // Donut hole
  ctx.beginPath();
  ctx.arc(cx,cy,ir,0,2*Math.PI);
  ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--card').trim() || '#fff';
  ctx.fill();
}

function buildPieLegend(legendId, items, total) {
  const el = document.getElementById(legendId);
  if (!el) return;
  el.innerHTML = items.map((item,i) => `
    <div class="pie-legend-item">
      <div class="pie-legend-dot" style="background:${PIE_COLORS[i%PIE_COLORS.length]}"></div>
      <span style="flex:1;font-size:10px;line-height:1.3">${item.label}</span>
      <span class="pie-legend-pct">${((item.val/total)*100).toFixed(1)}%</span>
    </div>`).join('');
}

function renderTortas() {
  const d = DATA[activeYear];
  if (!d) return;

  // Torta 1: Gastos por objeto (activo vs comparado)
  const dc_t = cmpYear !== 'none' ? DATA[parseInt(cmpYear)] : null;
  if (d.gastos?.porObjeto) {
    const items = d.gastos.porObjeto.filter(o=>o.val>0);
    const total = items.reduce((s,i)=>s+i.val,0);
    drawPie('pie-objeto', items);
    buildPieLegend('pie-objeto-legend', items, total);
    const el = document.getElementById('pie-objeto-title');
    if(el) el.textContent = `Gastos por objeto · ${activeYear}`;
  }
  if (dc_t?.gastos?.porObjeto) {
    const items = dc_t.gastos.porObjeto.filter(o=>o.val>0);
    const total = items.reduce((s,i)=>s+i.val,0);
    const el2 = document.getElementById('pie-objeto-2');
    const el2t = document.getElementById('pie-objeto-title-2');
    const el2l = document.getElementById('pie-objeto-legend-2');
    if(el2){ el2.closest('.pie-card').style.display='flex'; drawPie('pie-objeto-2', items); }
    if(el2t) el2t.textContent = `Gastos por objeto · ${cmpYear}`;
    if(el2l) buildPieLegend('pie-objeto-legend-2', items, total);
  } else {
    const el2 = document.getElementById('pie-objeto-2');
    if(el2) el2.closest('.pie-card').style.display='none';
  }

  // Torta 2: Por secretaría top 6 activo vs comparado
  if (d.secretarias?.length) {
    const all  = d.secretarias.filter(s=>s.val>0).sort((a,b)=>b.val-a.val);
    const top  = all.slice(0,6);
    const rest = all.slice(6);
    const items = rest.length ? [...top,{label:'Resto',val:rest.reduce((s,r)=>s+r.val,0)}] : top;
    const total = items.reduce((s,i)=>s+i.val,0);
    drawPie('pie-secretarias', items);
    buildPieLegend('pie-sec-legend', items, total);
    const el = document.getElementById('pie-sec-title');
    if(el) el.textContent = `Por secretaría · ${activeYear}`;
  }
  if (dc_t?.secretarias?.length) {
    const all  = dc_t.secretarias.filter(s=>s.val>0).sort((a,b)=>b.val-a.val);
    const top  = all.slice(0,6);
    const rest = all.slice(6);
    const items = rest.length ? [...top,{label:'Resto',val:rest.reduce((s,r)=>s+r.val,0)}] : top;
    const total = items.reduce((s,i)=>s+i.val,0);
    const el2 = document.getElementById('pie-secretarias-2');
    const el2t = document.getElementById('pie-sec-title-2');
    const el2l = document.getElementById('pie-sec-legend-2');
    if(el2){ el2.closest('.pie-card').style.display='flex'; drawPie('pie-secretarias-2', items); }
    if(el2t) el2t.textContent = `Por secretaría · ${cmpYear}`;
    if(el2l) buildPieLegend('pie-sec-legend-2', items, total);
  } else {
    const el2 = document.getElementById('pie-secretarias-2');
    if(el2) el2.closest('.pie-card').style.display='none';
  }

  // Torta 3: Recursos por tipo
  if (d.recursos?.tipos?.length) {
    const items = d.recursos.tipos.filter(t=>t.val>0);
    const total = items.reduce((s,i)=>s+i.val,0);
    drawPie('pie-recursos', items);
    buildPieLegend('pie-rec-legend', items, total);
    const el = document.getElementById('pie-rec-title');
    if(el) el.textContent = `Recursos por tipo · ${activeYear}`;
  }

  // Torta 4: Por procedencia
  if (d.recursos) {
    const items = [
      {label:'Origen municipal',  val:d.recursos.origenMunicipal||0},
      {label:'Origen provincial', val:d.recursos.origenProvincial||0},
      {label:'Origen nacional',   val:d.recursos.origenNacional||0},
    ].filter(i=>i.val>0);
    const total = items.reduce((s,i)=>s+i.val,0);
    drawPie('pie-origen', items);
    buildPieLegend('pie-origen-legend', items, total);
    const el = document.getElementById('pie-origen-title');
    if(el) el.textContent = `Por procedencia · ${activeYear}`;
  }
}

/* ╔══════════════════════════════════════════════════════╗
   ║  RENDER — SECRETARÍAS (con desglose expandible)     ║
   ╚══════════════════════════════════════════════════════╝ */


// Matching mejorado de programas con tabla de equivalencias
function findProgCmp(label, cmpProgs) {
  if (!cmpProgs || !cmpProgs.length) return null;
  // 1. Exacto
  let found = cmpProgs.find(c => c.label === label);
  if (found) return found;
  // 2. Via tabla de equivalencias
  const equiv = PROG_EQUIV[label];
  if (equiv) { found = cmpProgs.find(c => c.label === equiv); if (found) return found; }
  // 3. Búsqueda inversa en tabla
  const revKey = Object.entries(PROG_EQUIV).find(([k,v]) => v === label)?.[0];
  if (revKey) { found = cmpProgs.find(c => c.label === revKey); if (found) return found; }
  // 4. Fuzzy: normalizar y comparar
  const norm = l => l.toLowerCase()
    .replace(/fort\.\s+|fortalecimiento\s+/g,'')
    .replace(/\s+de\s+(la|el|los|las)\s+/g,' ')
    .replace(/[()\*]/g,'').replace(/\s+/g,' ').trim();
  found = cmpProgs.find(c => norm(c.label) === norm(label));
  if (found) return found;
  // 5. Palabras clave largas
  const words = norm(label).split(' ').filter(w => w.length > 5);
  if (words.length >= 2) {
    found = cmpProgs.find(c => {
      const nb = norm(c.label);
      return words.filter(w => nb.includes(w)).length >= Math.ceil(words.length * 0.6);
    });
  }
  return found || null;
}

function toggleSecDetail(idx) {
  const detRow = document.getElementById(`sec-detail-${idx}`);
  const secRow = document.getElementById(`sec-row-${idx}`);
  const isOpen = detRow.classList.contains('show');
  detRow.classList.toggle('show', !isOpen);
  secRow.classList.toggle('open', !isOpen);
}

function renderSecretarias() {
  const d  = DATA[activeYear];
  const dc = cmpYear !== 'none' ? DATA[parseInt(cmpYear)] : null;
  const secActivo = d.secretarias.filter(s => s.val > 0 || s.nueva);
  const totalActivo = secActivo.reduce((s,i) => s + (i.val || 0), 0);
  const ipc = d.ipc || 0;  // inflación del año activo
  const showCmp = !!dc?.secretarias?.length;

  document.getElementById('sec-titulo').textContent = `Por secretaría · ${activeYear}`;
  document.getElementById('sec-nota').textContent = showCmp
    ? `Comparando ${activeYear} vs ${cmpYear} · Clic en una fila para ver programas`
    : `Clic en una fila para ver el desglose por programa`;

  // Columnas comparación
  ['th-cmp-sec','th-vn-sec','th-vr-sec'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.style.display = showCmp ? '' : 'none';
  });
  if (showCmp) {
    document.getElementById('th-cmp-sec').textContent = `${cmpYear} ($M)`;
    document.getElementById('th-vn-sec').textContent = 'Var. nom.';
    document.getElementById('th-vr-sec').textContent = 'Var. real';
  }

  const maxVal = Math.max(
    ...secActivo.map(s => s.val || 0),
    ...(showCmp ? dc.secretarias.map(s => s.val||0) : [0])
  );

  // Filas de la tabla — cada secretaría tiene fila principal + fila detalle
  const rows = secActivo.map((s, idx) => {
    // Buscar equivalente en año comparado (por label o aproximación)
    const secCmp = showCmp ? dc.secretarias.find(c =>
      c.label === s.label ||
      c.label.replace(/\s*\(.*?\)/g,'').trim() === s.label.replace(/\s*\(.*?\)/g,'').trim()
    ) : null;

    const vn = (s.val && secCmp?.val) ? ((s.val - secCmp.val) / secCmp.val * 100) : null;
    const vr = (vn !== null && ipc) ? ((1+vn/100)/(1+ipc)-1)*100 : null;
    const pct = s.val ? (s.val/totalActivo*100).toFixed(1)+'%' : '—';
    const vnStr = vn !== null ? (vn>0?'+':'')+vn.toFixed(1)+'%' : '—';
    const vrStr = vr !== null ? (vr>0?'+':'')+vr.toFixed(1)+'%' : '—';
    const vrColor = vr !== null ? (vr>2 ? 'color:var(--green)' : vr>-10 ? 'color:var(--amber)' : 'color:var(--red)') : '';
    let badge = '';
    if (s.nueva) badge = ' <span class="badge badge-new">Nueva</span>';
    if (s.eliminada25) badge = ' <span class="badge badge-gone">Eliminada 2025</span>';
    const rowBg = s.nueva ? 'new-row' : s.eliminada25 ? 'gone-row' : '';
    const hasProgs = s.programas && s.programas.length > 0;

    // Fila principal
    const mainRow = `<tr class="sec-row ${rowBg}" id="sec-row-${idx}" ${hasProgs ? `onclick="toggleSecDetail(${idx})"` : ''}>
      <td class="name">${s.label}${badge}
        ${s.nota ? `<br><span style="font-size:10px;color:var(--mist);font-weight:400">${s.nota}</span>` : ''}
      </td>
      <td class="mono-hi yr-col">${s.val ? '$'+fmt(s.val) : '<span class="na">pendiente</span>'}</td>
      <td class="pct yr-col" style="color:var(--mist)">${pct}</td>
      ${showCmp ? `
        <td class="mono yr-cmp">${secCmp?.val ? '$'+fmt(secCmp.val) : '—'}</td>
        <td class="cmp-vn yr-cmp">${vnStr}</td>
        <td class="cmp-vr yr-cmp ${vr!==null ? (vr>2?'ok':vr>-10?'warn':'bad') : ''}">${vrStr}</td>
      ` : ''}
      <td style="min-width:120px">
        <div style="display:flex;flex-direction:column;gap:2px">
          <div style="height:7px;background:var(--bg2);border-radius:2px;overflow:hidden">
            <div style="height:100%;width:${(s.val||0)/maxVal*100}%;background:rgba(13,148,136,.7);border-radius:2px"></div>
          </div>
          ${showCmp && secCmp ? `<div style="height:7px;background:var(--bg2);border-radius:2px;overflow:hidden">
            <div style="height:100%;width:${(secCmp.val||0)/maxVal*100}%;background:rgba(217,119,6,.6);border-radius:2px"></div>
          </div>` : ''}
        </div>
      </td>
    </tr>`;

    // Fila detalle (programas expandibles)
    const colSpan = 4 + (showCmp ? 3 : 0);
    let detailContent = '';
    if (hasProgs) {
      const maxProg = Math.max(...s.programas.filter(p=>p.val>0).map(p=>p.val));
      const cmpProgs = secCmp?.programas || [];
      const maxProgCmp = cmpProgs.length ? Math.max(...cmpProgs.filter(p=>p.val>0).map(p=>p.val)) : 0;
      const maxAll = Math.max(maxProg, maxProgCmp);

      const legenda = showCmp ? `<div style="display:flex;gap:1.5rem;margin-bottom:.5rem;font-size:11px;font-weight:600">
        <span style="display:flex;align-items:center;gap:5px"><span style="display:inline-block;width:14px;height:8px;border-radius:2px;background:rgba(13,148,136,.75)"></span>${activeYear}</span>
        <span style="display:flex;align-items:center;gap:5px"><span style="display:inline-block;width:14px;height:8px;border-radius:2px;background:rgba(180,83,9,.55)"></span>${cmpYear}</span>
      </div>` : '';
      detailContent = `<div class="sec-detail-inner">
        ${legenda}
        <div class="sec-detail-header">
          <span>Programa</span>
          <span>Ejecución${showCmp ? ' comparativa' : ''}</span>
          <span style="text-align:right">${activeYear} ($M)</span>
          <span style="text-align:right">${showCmp ? cmpYear+' · var.' : ''}</span>
        </div>
        ${s.programas.filter(p => p.val > 0).map(p => {
          const pc = findProgCmp(p.label, cmpProgs);
          const pvn = (pc?.val) ? ((p.val - pc.val)/pc.val*100) : null;
          const pvr = (pvn !== null && ipc) ? ((1+pvn/100)/(1+ipc)-1)*100 : null;
          const vrCol = pvr!==null?(pvr>2?'#15803d':pvr>-5?'#b45309':'#b91c1c'):'var(--mist)';
          const pct   = s.val ? (p.val/s.val*100).toFixed(1) : '';
          return `<div class="sec-prog-row">
            <span class="sec-prog-label">${p.label}<br><span style="font-size:10px;color:var(--mist);font-weight:400">${pct}% de la sec.</span></span>
            <div class="sec-prog-bar-wrap">
              <div style="display:flex;align-items:center;gap:3px;height:10px;position:relative">
                ${pc ? `<div style="flex:${pc.val/maxAll};height:8px;background:rgba(180,83,9,.55);border-radius:2px;transition:flex .4s"></div>` : ''}
                <div style="flex:${p.val/maxAll};height:10px;background:rgba(13,148,136,.80);border-radius:2px;transition:flex .4s"></div>
                <div style="flex:${1 - Math.max(p.val,pc?.val||0)/maxAll};min-width:0"></div>
              </div>
            </div>
            <span class="sec-prog-val">$${fmt(p.val)}M</span>
            <span class="sec-prog-cmp">
              ${pc
                ? `<span style="color:var(--ink2);font-size:10px">$${fmt(pc.val)}M</span>`
                  + (pvn!==null ? `<br><span style="font-size:10px;color:var(--ink3)">${pvn>0?'+':''}${pvn.toFixed(1)}% nom</span>` : '')
                  + (pvr!==null ? `<br><span style="font-weight:700;font-size:11px;color:${vrCol}">${pvr>0?'+':''}${pvr.toFixed(1)}% real</span>` : '')
                : (showCmp ? `<span style="color:var(--mist);font-size:10px">sin par</span>` : '')
              }
            </span>
          </div>`;
        }).join('')}
      </div>`;
    }

    const detailRow = `<tr class="sec-detail-row" id="sec-detail-${idx}">
      <td colspan="${colSpan}">${detailContent || '<div style="padding:.5rem 1rem;font-size:11px;color:var(--mist)">Sin desglose disponible.</div>'}</td>
    </tr>`;

    return mainRow + detailRow;
  }).join('');

  document.getElementById('tbody-sec').innerHTML = rows;

  // Panel lateral — barras con comparación
  const legend = showCmp ? `<div style="display:flex;gap:1rem;margin-bottom:.75rem;font-size:11px;color:var(--ink3)">
    <span><span style="display:inline-block;width:10px;height:10px;border-radius:2px;background:rgba(13,148,136,.7);margin-right:4px"></span>${activeYear}</span>
    <span><span style="display:inline-block;width:10px;height:10px;border-radius:2px;background:rgba(217,119,6,.6);margin-right:4px"></span>${cmpYear}</span>
  </div>` : '';

  document.getElementById('sec-bars-title').textContent = `Distribución · ${activeYear}${showCmp ? ' vs ' + cmpYear : ''}`;
  const topSec = [...secActivo].filter(s=>s.val>0).sort((a,b)=>b.val-a.val).slice(0,12);
  const maxB = Math.max(...topSec.map(s=>s.val||0), ...(showCmp ? topSec.map(s => dc.secretarias.find(c=>c.label===s.label)?.val||0) : [0]));

  document.getElementById('bars-sec').innerHTML = legend + topSec.map(s => {
    const sc = showCmp ? dc.secretarias.find(c=>c.label===s.label) : null;
    return `<div style="margin-bottom:10px">
      <div style="display:flex;justify-content:space-between;font-size:10.5px;color:var(--ink2);margin-bottom:3px">
        <span style="font-weight:500;max-width:160px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${s.label}</span>
        <span style="font-family:'JetBrains Mono',monospace;font-size:9px;color:var(--navy)">$${fmt(s.val)}M</span>
      </div>
      <div style="background:var(--bg2);border-radius:2px;height:10px;overflow:hidden;position:relative;margin-bottom:2px">
        ${sc ? `<div style="position:absolute;top:0;left:0;width:${(sc.val||0)/maxB*100}%;height:100%;background:rgba(217,119,6,.5);border-radius:2px"></div>` : ''}
        <div style="position:absolute;top:0;left:0;width:${(s.val||0)/maxB*100}%;height:100%;background:rgba(13,148,136,.7);border-radius:2px"></div>
      </div>
      ${sc ? `<div style="font-size:9px;color:var(--mist);text-align:right;font-family:'JetBrains Mono',monospace">$${fmt(sc.val)}M</div>` : ''}
    </div>`;
  }).join('');
}

/* ╔══════════════════════════════════════════════════════╗
   ║  RENDER — PERSONAL (con comparativa)                ║
   ╚══════════════════════════════════════════════════════╝ */
function renderPersonal() {
  const d   = DATA[activeYear];
  const p   = d.personal;
  const pc  = cmpYear !== 'none' ? DATA[parseInt(cmpYear)]?.personal : null;
  const ipc = d.ipc || 0;
  const showCmp = !!pc;
  document.getElementById('pers-titulo').textContent = `Planta de personal · ${activeYear}${showCmp ? ' vs ' + cmpYear : ''}`;

  // Variación solo nominal (para cantidades de personas)
  const vNom = (va, vb) => {
    if (!va || !vb) return null;
    const vn = (va - vb) / vb * 100;
    const col = vn > 2 ? '#15803d' : vn > -5 ? '#b45309' : '#b91c1c';
    return `<span style="font-family:'JetBrains Mono',monospace;font-size:11px;font-weight:700;color:${col}">${vn>0?'+':''}${vn.toFixed(1)}%</span>`;
  };

  // Variación nominal + real (para montos $)
  const vNomReal = (va, vb) => {
    if (!va || !vb) return null;
    const vn = (va - vb) / vb * 100;
    const vr = ipc ? ((1+vn/100)/(1+ipc)-1)*100 : null;
    const col = (vr??vn) > 2 ? '#15803d' : (vr??vn) > -5 ? '#b45309' : '#b91c1c';
    return `<span style="font-family:'JetBrains Mono',monospace;font-size:11px;font-weight:700;color:${col}">${vn>0?'+':''}${vn.toFixed(1)}% nom${vr!==null?' · '+(vr>0?'+':'')+vr.toFixed(1)+'% real':''}</span>`;
  };

  // ── TABLA RESUMEN ──
  const rows = [
    { label: 'Total empleados',     vA: p.total,        vC: pc?.total,        fmt: fmtInt, isMoney: false },
    { label: 'Planta permanente',   vA: p.permanente,   vC: pc?.permanente,   fmt: fmtInt, isMoney: false },
    { label: 'Planta mensualizada', vA: p.mensualizado, vC: pc?.mensualizado, fmt: fmtInt, isMoney: false },
    { label: 'Gasto total personal',vA: p.gastoTotal,   vC: pc?.gastoTotal,   fmt: v=>`$${fmt(v)} M`, isMoney: true },
    { label: 'Paritaria acumulada', vA: p.paritaria,    vC: pc?.paritaria,    fmt: v=>`${v}%`, isMoney: false },
  ].filter(r => r.vA);

  document.getElementById('kpi-personal').innerHTML = `
    <div style="grid-column:1/-1">
      <table style="width:100%;border-collapse:collapse;font-size:13px">
        <thead>
          <tr>
            <th style="text-align:left;padding:8px 12px;background:var(--navy);color:#fff;font-weight:600;letter-spacing:.03em">Concepto</th>
            <th style="text-align:right;padding:8px 12px;background:rgba(13,148,136,.85);color:#fff;font-weight:700">${activeYear}</th>
            ${showCmp ? `<th style="text-align:right;padding:8px 12px;background:rgba(180,83,9,.80);color:#fff;font-weight:700">${cmpYear}</th>
            <th style="text-align:right;padding:8px 12px;background:var(--navy);color:#fff;font-weight:600">Variación</th>` : ''}
          </tr>
        </thead>
        <tbody>
          ${rows.map((r,i) => {
            const varHTML = showCmp && r.vC ? (r.isMoney ? vNomReal(r.vA, r.vC) : vNom(r.vA, r.vC)) : '';
            return `<tr style="border-bottom:1px solid var(--borde);${i%2===1?'background:var(--card2)':''}">
              <td style="padding:9px 12px;font-weight:600;color:var(--ink)">${r.label}</td>
              <td style="padding:9px 12px;text-align:right;font-family:'JetBrains Mono',monospace;font-weight:700;color:rgba(13,148,136,1)">${r.fmt(r.vA)}</td>
              ${showCmp ? `<td style="padding:9px 12px;text-align:right;font-family:'JetBrains Mono',monospace;color:rgba(180,83,9,.85)">${r.vC ? r.fmt(r.vC) : '—'}</td>
              <td style="padding:9px 12px;text-align:right">${varHTML||'—'}</td>` : ''}
            </tr>`;
          }).join('')}
        </tbody>
      </table>
    </div>
  `;

  // ── Planta por secretaría ──
  const secEl = document.getElementById('bars-planta-sec');
  if (p.porSecretaria && p.porSecretaria.length) {
    const totalPlanta = p.porSecretaria.reduce((s,x)=>s+(x.val||0),0);
    const allVals = [...p.porSecretaria.map(s=>s.val||0), ...(pc?.porSecretaria?.map(s=>s.val||0)||[])];
    const maxS = Math.max(...allVals, 1);
    const legHTML = showCmp ? `<div style="display:flex;gap:1.5rem;margin-bottom:.875rem;font-size:12px;font-weight:600">
      <span style="display:flex;align-items:center;gap:5px"><span style="display:inline-block;width:12px;height:12px;border-radius:3px;background:rgba(13,148,136,.80)"></span>${activeYear}</span>
      <span style="display:flex;align-items:center;gap:5px"><span style="display:inline-block;width:12px;height:12px;border-radius:3px;background:rgba(180,83,9,.65)"></span>${cmpYear}</span>
      <span style="margin-left:auto;font-size:10px;color:var(--mist);font-weight:400">% = de la planta total · var. = solo nominal (cant. personas)</span>
    </div>` : '';
    secEl.innerHTML = legHTML + p.porSecretaria.map(s => {
      const sc = pc?.porSecretaria?.find(c=>c.label===s.label);
      const pct = ((s.val||0)/totalPlanta*100).toFixed(1);
      return `<div style="margin-bottom:10px">
        <div style="display:flex;justify-content:space-between;align-items:baseline;margin-bottom:3px;gap:.5rem">
          <span style="font-size:12px;font-weight:500;color:var(--ink)">${s.label}</span>
          <div style="display:flex;gap:.75rem;align-items:baseline;flex-shrink:0">
            ${sc ? `<span style="font-family:'JetBrains Mono',monospace;font-size:11px;color:rgba(180,83,9,.85)">${sc.val}</span>` : ''}
            <span style="font-family:'JetBrains Mono',monospace;font-weight:700;color:rgba(13,148,136,1);font-size:12px">${s.val}</span>
            <span style="font-family:'JetBrains Mono',monospace;font-size:10px;color:var(--mist)">${pct}%</span>
            ${sc ? (vNom(s.val, sc.val)||'') : ''}
          </div>
        </div>
        <div style="height:11px;background:var(--bg2);border-radius:3px;overflow:hidden;position:relative">
          ${sc ? `<div style="position:absolute;top:0;left:0;width:${(sc.val||0)/maxS*100}%;height:100%;background:rgba(180,83,9,.55);border-radius:3px"></div>` : ''}
          <div style="position:absolute;top:0;left:0;width:${(s.val||0)/maxS*100}%;height:100%;background:rgba(13,148,136,.80);border-radius:3px"></div>
        </div>
      </div>`;
    }).join('');
  } else {
    secEl.innerHTML = '<p style="color:var(--mist);font-size:12px;font-style:italic">Sin datos para este año.</p>';
  }

  // ── Componentes del gasto ──
  document.querySelector('.card.v5 .card-title').textContent =
    `Gasto en personal por componente · ${activeYear}${showCmp ? ' vs ' + cmpYear : ''}`;
  if (p.componentes && p.componentes.length) {
    const totalComp = p.componentes.reduce((s,c)=>s+(c.val||0),0);
    const allC = [...p.componentes.map(c=>c.val||0), ...(pc?.componentes?.map(c=>c.val||0)||[])];
    const maxC = Math.max(...allC, 1);
    const legCompHTML = showCmp ? `<div style="display:flex;gap:1.5rem;margin-bottom:.875rem;font-size:12px;font-weight:600">
      <span style="display:flex;align-items:center;gap:5px"><span style="display:inline-block;width:12px;height:12px;border-radius:3px;background:rgba(13,148,136,.80)"></span>${activeYear}</span>
      <span style="display:flex;align-items:center;gap:5px"><span style="display:inline-block;width:12px;height:12px;border-radius:3px;background:rgba(180,83,9,.65)"></span>${cmpYear}</span>
      <span style="margin-left:auto;font-size:10px;color:var(--mist);font-weight:400">var. nominal + real</span>
    </div>` : '';
    document.getElementById('bars-componentes').innerHTML = legCompHTML + p.componentes.map(c => {
      const cc = pc?.componentes?.find(x=>x.label===c.label);
      const pct = ((c.val||0)/totalComp*100).toFixed(1);
      return `<div style="margin-bottom:10px">
        <div style="display:flex;justify-content:space-between;align-items:baseline;margin-bottom:3px;gap:.5rem">
          <span style="font-size:12px;font-weight:500;color:var(--ink)">${c.label}</span>
          <div style="display:flex;gap:.75rem;align-items:baseline;flex-shrink:0">
            ${cc ? `<span style="font-family:'JetBrains Mono',monospace;font-size:11px;color:rgba(180,83,9,.85)">$${fmt(cc.val)}M</span>` : ''}
            <span style="font-family:'JetBrains Mono',monospace;font-weight:700;color:rgba(13,148,136,1);font-size:12px">$${fmt(c.val)}M</span>
            <span style="font-family:'JetBrains Mono',monospace;font-size:10px;color:var(--mist)">${pct}%</span>
            ${cc ? (vNomReal(c.val, cc.val)||'') : ''}
          </div>
        </div>
        <div style="height:11px;background:var(--bg2);border-radius:3px;overflow:hidden;position:relative">
          ${cc ? `<div style="position:absolute;top:0;left:0;width:${(cc.val||0)/maxC*100}%;height:100%;background:rgba(180,83,9,.55);border-radius:3px"></div>` : ''}
          <div style="position:absolute;top:0;left:0;width:${(c.val||0)/maxC*100}%;height:100%;background:rgba(13,148,136,.80);border-radius:3px"></div>
        </div>
      </div>`;
    }).join('');
  } else {
    document.getElementById('bars-componentes').innerHTML = '<p style="color:var(--mist);font-size:12px;font-style:italic">Sin datos para este año.</p>';
  }
}

/* ╔══════════════════════════════════════════════════════╗
   ║  RENDER — METODOLOGÍA                                ║
   ╚══════════════════════════════════════════════════════╝ */
function renderMetodologia() {
  const statusMap = { confirmed:'✅ Confirmado', pending:'⏳ Pendiente', partial:'🔶 Parcial' };
  const colorMap  = { confirmed:'var(--green)', pending:'var(--mist)', partial:'var(--amber)' };
  document.getElementById('data-status').innerHTML = Object.keys(DATA).map(y => {
    const d = DATA[y];
    return `
      <div style="display:flex;align-items:center;justify-content:space-between;padding:.625rem .875rem;background:var(--card2);border:1px solid var(--borde);border-radius:var(--r);gap:1rem">
        <span style="font-family:'JetBrains Mono',monospace;font-size:1rem;font-weight:700;color:var(--navy)">${y}</span>
        <span style="font-size:12px;color:${colorMap[d.status]};font-weight:600">${statusMap[d.status]}</span>
        <span style="font-size:11px;color:var(--mist);flex:1;text-align:right">${d.fuente}</span>
      </div>
    `;
  }).join('');
}

/* ╔══════════════════════════════════════════════════════╗
   ║  CALCULADORA DE VARIACIÓN REAL                       ║
   ╚══════════════════════════════════════════════════════╝ */

/* ── CATEGORÍAS DE CONCEPTOS ── */
const CATS = {
  totales: [
    { label: 'Gasto total ejecutado',  key: 'res.ejecutado' },
    { label: 'Ingresos corrientes',    key: 'res.ingCorrientes' },
    { label: 'Gastos corrientes',      key: 'res.gasCorrientes' },
    { label: 'Ahorro corriente',       key: 'res.ahorroCorriente' },
    { label: 'Resultado Art. 43',      key: 'res.superavitArt43' },
    { label: 'Gastos de capital',      key: 'res.gastosCapital' },
    { label: 'Saldo de caja',          key: 'res.saldoCajaFin' },
    { label: 'Deuda flotante',         key: 'res.deudaFlotante' },
  ],
  objeto: [
    { label: 'Personal',              key: 'gas.0' },
    { label: 'Serv. no personales',   key: 'gas.1' },
    { label: 'Bienes de uso',         key: 'gas.2' },
    { label: 'Transferencias',        key: 'gas.3' },
    { label: 'Servicio deuda',        key: 'gas.4' },
    { label: 'Bienes de consumo',     key: 'gas.5' },
    { label: 'Activos financieros',   key: 'gas.6' },
  ],
  recursos: [
    { label: 'Tasas municipales',     key: 'rec.0' },
    { label: 'Coparticipación',       key: 'rec.1' },
    { label: 'Transf. prov.',         key: 'rec.2' },
    { label: 'Rentas propiedad',      key: 'rec.3' },
    { label: 'Multas y derechos',     key: 'rec.4' },
    { label: 'Venta bienes/serv.',    key: 'rec.5' },
  ],
  secretarias: [], // se rellena dinámicamente desde DATA
  programas:   [], // se rellena dinámicamente desde DATA
  personal: [
    { label: 'Gasto total personal',  key: 'pers.gastoTotal' },
    { label: 'Planta total (nro.)',   key: 'pers.total' },
    { label: 'Permanente (nro.)',     key: 'pers.permanente' },
    { label: 'Mensualizado (nro.)',   key: 'pers.mensualizado' },
  ],
};

// Estado de la calculadora
const calcState = {
  a: { cat: 'totales', key: null },
  b: { cat: 'totales', key: null },
};

// getValFromKey moved into buildDynamicCats block above

function getLabelFromKey(year, key) {
  if (!key) return '';
  const [tipo, campo] = key.split('.');
  const d = DATA[parseInt(year)];
  if (tipo === 'sec')  return d?.secretarias?.[parseInt(campo)]?.label ?? key;
  if (tipo === 'prog') return d?.gastos?.programas?.[parseInt(campo)]?.label ?? key;
  // Static labels
  for (const cat of Object.values(CATS)) {
    const found = cat.find(c => c.key === key);
    if (found) return found.label;
  }
  return key;
}

// Estado del selector de programas
const progState = { a: '', b: '' };

function getValFromKey(year, key) {
  if (!key) return null;
  const d = DATA[parseInt(year)];
  if (!d) return null;
  if (key.startsWith('secprog.')) {
    const parts = key.split('.');
    return d.secretarias?.[parseInt(parts[1])]?.programas?.[parseInt(parts[2])]?.val ?? null;
  }
  if (key.startsWith('rec.tasas.')) {
    const idx = parseInt(key.split('.')[2]);
    return d.recursos?.tasas?.[idx]?.val ?? null;
  }
  const [tipo, campo] = key.split('.');
  if (tipo === 'res')  return d.resumen?.[campo] ?? null;
  if (tipo === 'gas')  return d.gastos?.porObjeto?.[parseInt(campo)]?.val ?? null;
  if (tipo === 'rec')  return d.recursos?.tipos?.[parseInt(campo)]?.val ?? null;
  if (tipo === 'pers') return d.personal?.[campo] ?? null;
  if (tipo === 'sec')  return d.secretarias?.[parseInt(campo)]?.val ?? null;
  if (tipo === 'prog') return d.gastos?.programas?.[parseInt(campo)]?.val ?? null;
  return null;
}

function buildDynamicCats(year) {
  const d = DATA[parseInt(year)];
  CATS.secretarias = (d?.secretarias || [])
    .filter(s => s.val)
    .map((s, i) => ({ label: s.label, key: `sec.${i}` }));
  // Programas: siempre desde secretarias[].programas para tener todos
  const progs = [];
  (d?.secretarias || []).forEach((s, si) => {
    (s.programas || []).forEach((p, pi) => {
      progs.push({ label: p.label, key: `secprog.${si}.${pi}`, sec: s.label, val: p.val });
    });
  });
  CATS.programas = progs;
  // Tasas municipales
  CATS.tasas = (d?.recursos?.tasas || [])
    .map((t, i) => ({ label: t.label, key: `rec.tasas.${i}`, val: t.val }));
}

function renderProgSelector(side) {
  const yr  = document.getElementById(`c${side}-year`).value;
  const d   = DATA[parseInt(yr)];
  buildDynamicCats(yr);
  const container = document.getElementById(`c${side}-items`);
  const progs = CATS.programas;
  const total = d?.gastos?.total || 1;

  if (!progs.length) {
    container.innerHTML = '<span style="color:var(--mist);font-size:11px;font-style:italic">Sin programas para este año.</span>';
    return;
  }

  const secs = [...new Set(progs.map(p => p.sec).filter(Boolean))].sort();
  if (!progState[side]) progState[side] = secs[0] || '';
  const currentSec = progState[side];
  const filtrados = currentSec ? progs.filter(p => p.sec === currentSec) : progs;

  container.innerHTML = `<div style="display:flex;flex-direction:column;gap:6px;width:100%">
    <select style="width:100%;padding:7px 10px;border:1.5px solid var(--borde);border-radius:var(--r);font-family:'DM Sans',sans-serif;font-size:13px;color:var(--ink);background:var(--card2);cursor:pointer;outline:none"
      onchange="progState['${side}']=this.value; renderProgSelector('${side}')">
      ${secs.map(s => `<option value="${s}" ${s===currentSec?'selected':''}>${s}</option>`).join('')}
    </select>
    <div style="display:flex;flex-direction:column;gap:2px;max-height:220px;overflow-y:auto;border:1.5px solid var(--borde);border-radius:var(--r);background:var(--card2);padding:3px">
      ${filtrados.map(item => {
        const isOn = calcState[side].key === item.key;
        const pct  = item.val && total ? (item.val/total*100).toFixed(1) : null;
        return `<div style="display:flex;justify-content:space-between;align-items:center;padding:6px 10px;border-radius:5px;cursor:pointer;font-size:12px;border:1px solid transparent;${isOn?'background:var(--teal);color:#fff;':'color:var(--ink2)'}"
          onclick="selectProgItem('${side}','${item.key}',this)"
          data-key="${item.key}">
          <span style="font-weight:500;flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${item.label}</span>
          <span style="font-family:'JetBrains Mono',monospace;font-size:10px;${isOn?'color:rgba(255,255,255,.8)':'color:var(--mist)'};flex-shrink:0;margin-left:8px">${item.val?'$'+item.val.toLocaleString('es-AR',{maximumFractionDigits:0})+'M':''} ${pct?pct+'%':''}</span>
        </div>`;
      }).join('')}
    </div>
  </div>`;
}

function selectProgItem(side, key, el) {
  calcState[side].key = key;
  // deselect all in list
  el.closest('div[style*="flex-direction:column"]').querySelectorAll('[data-key]').forEach(d => {
    d.style.background = ''; d.style.color = 'var(--ink2)';
    d.querySelector('span:last-child').style.color = 'var(--mist)';
  });
  el.style.background = 'var(--teal)'; el.style.color = '#fff';
  el.querySelector('span:last-child').style.color = 'rgba(255,255,255,.8)';
  const yr  = document.getElementById(`c${side}-year`).value;
  const val = getValFromKey(yr, key);
  if (val !== null) {
    document.getElementById(`c${side}-val`).value = val;
    document.getElementById(`c${side}-hint`).textContent = '← cargado automáticamente';
  } else {
    document.getElementById(`c${side}-val`).value = '';
    document.getElementById(`c${side}-hint`).textContent = 'Sin dato · ingresá el valor manualmente';
  }
  calcRun();
}

function renderItems(side, cat) {
  const yr    = document.getElementById(`c${side}-year`).value;
  buildDynamicCats(yr);
  const container = document.getElementById(`c${side}-items`);
  const currentKey = calcState[side].key;

  if (cat === 'programas') {
    renderProgSelector(side);
    return;
  }

  const items = CATS[cat] || [];
  if (!items.length) {
    container.innerHTML = '<span style="font-size:11px;color:var(--mist);font-style:italic">Sin datos para este año en esta categoría.</span>';
    return;
  }

  container.innerHTML = items.map(item => {
    const val = getValFromKey(yr, item.key);
    const hasVal = val !== null;
    const isOn = currentKey === item.key;
    return `<button 
      class="cat-item ${isOn ? 'on' : ''} ${!hasVal ? 'manual' : ''}" 
      onclick="selectItem('${side}','${item.key}',this)"
      title="${hasVal ? '$'+val.toLocaleString('es-AR',{maximumFractionDigits:1})+' M' : 'Sin dato'}"
    >${item.label}${hasVal ? '' : ' ·?'}</button>`;
  }).join('');
}

function setCat(side, cat, btn) {
  calcState[side].cat = cat;
  calcState[side].key = null;
  if (cat !== 'programas') progState[side] = '';
  document.querySelectorAll(`#c${side}-cats .cat-tab`).forEach(b => b.classList.remove('on'));
  btn.classList.add('on');
  renderItems(side, cat);
  document.getElementById(`c${side}-hint`).textContent = '';
}

function selectItem(side, key, btn) {
  // deselect if already on
  if (calcState[side].key === key) {
    calcState[side].key = null;
    btn.classList.remove('on');
    document.getElementById(`c${side}-val`).value = '';
    document.getElementById(`c${side}-hint`).textContent = '';
    calcRun();
    return;
  }
  calcState[side].key = key;
  document.querySelectorAll(`#c${side}-items .cat-item, #c${side}-items [data-key]`).forEach(b => { b.classList?.remove('on'); });
  btn.classList.add('on');
  const yr  = document.getElementById(`c${side}-year`).value;
  const val = getValFromKey(yr, key);
  if (val !== null) {
    document.getElementById(`c${side}-val`).value = val;
    document.getElementById(`c${side}-hint`).textContent = '← cargado automáticamente';
  } else {
    document.getElementById(`c${side}-val`).value = '';
    document.getElementById(`c${side}-hint`).textContent = 'Sin dato · ingresá el valor manualmente';
  }
  calcRun();
}

function setInf(val, btn) {
  document.getElementById('c-inf').value = val;
  document.querySelectorAll('.inf-pill').forEach(b => b.classList.remove('on'));
  btn.classList.add('on');
  calcRun();
}

function calcSyncA() {
  const yr = document.getElementById('ca-year').value;
  buildDynamicCats(yr);
  renderItems('a', calcState.a.cat);
  // reload value if a key was selected
  if (calcState.a.key) {
    const val = getValFromKey(yr, calcState.a.key);
    if (val !== null) {
      document.getElementById('ca-val').value = val;
      document.getElementById('ca-hint').textContent = '← cargado automáticamente';
    } else {
      document.getElementById('ca-hint').textContent = 'Sin dato para este año';
    }
  }
  calcRun();
}

function calcSyncB() {
  const yr = document.getElementById('cb-year').value;
  buildDynamicCats(yr);
  renderItems('b', calcState.b.cat);
  if (calcState.b.key) {
    const val = getValFromKey(yr, calcState.b.key);
    if (val !== null) {
      document.getElementById('cb-val').value = val;
      document.getElementById('cb-hint').textContent = '← cargado automáticamente';
    } else {
      document.getElementById('cb-hint').textContent = 'Sin dato para este año';
    }
  }
  calcRun();
}

// Init calculator items on load
function initCalc() {
  renderItems('a', 'totales');
  renderItems('b', 'totales');
}

function calcRun() {
  const va  = parseFloat(document.getElementById('ca-val').value);
  const vb  = parseFloat(document.getElementById('cb-val').value);
  const inf = parseFloat(document.getElementById('c-inf').value) / 100;
  const resCard = document.getElementById('calc-result-card');

  if (!va || !vb || isNaN(inf)) { resCard.style.display = 'none'; return; }

  const yrA = document.getElementById('ca-year').value;
  const yrB = document.getElementById('cb-year').value;
  const keyA = calcState.a.key;
  const keyB = calcState.b.key;
  const lblA = calcState.a.key ? getLabelFromKey(yrA, calcState.a.key) : 'Monto ingresado';
  const lblB = calcState.b.key ? getLabelFromKey(yrB, calcState.b.key) : 'Monto ingresado';

  const vn     = (vb - va) / va * 100;
  const vr     = ((1 + vn/100) / (1 + inf) - 1) * 100;
  const neutro = va * (1 + inf);

  // Render
  resCard.style.display = 'block';
  document.getElementById('cr-base').textContent      = '$' + va.toLocaleString('es-AR', {maximumFractionDigits:1}) + ' M';
  document.getElementById('cr-base-year').textContent  = yrA + (lblA ? ' · ' + lblA : '');
  document.getElementById('cr-comp').textContent       = '$' + vb.toLocaleString('es-AR', {maximumFractionDigits:1}) + ' M';
  document.getElementById('cr-comp-year').textContent  = yrB + (lblB ? ' · ' + lblB : '');
  document.getElementById('cr-vn').textContent         = (vn>0?'+':'') + vn.toFixed(1) + '%';
  document.getElementById('cr-inf-ref').textContent    = 'Inflación del período: ' + (inf*100).toFixed(1) + '%';
  document.getElementById('cr-neutro').textContent     = 'Neutro: $' + neutro.toLocaleString('es-AR',{maximumFractionDigits:0}) + ' M';

  const vrEl = document.getElementById('cr-vr');
  vrEl.textContent = (vr>0?'+':'') + vr.toFixed(1) + '%';
  vrEl.className = 'crc-val crc-highlight ' + (vr > 2 ? 'cr-ok' : vr < -5 ? 'cr-bad' : 'cr-warn');

  // Veredicto
  const verdictEl = document.getElementById('cr-verdict');
  let vClass, vText;
  if (vr > 10) {
    vClass = 'ok';
    vText = `<strong>Expansión real significativa (+${vr.toFixed(1)}%).</strong> El monto creció por encima de la inflación del período. En términos de poder adquisitivo, representa un aumento real de recursos.`;
  } else if (vr > 2) {
    vClass = 'ok';
    vText = `<strong>Leve expansión real (+${vr.toFixed(1)}%).</strong> El monto supera apenas la inflación del período. Crecimiento real moderado.`;
  } else if (vr > -2) {
    vClass = 'warn';
    vText = `<strong>Variación real neutra (${vr.toFixed(1)}%).</strong> El monto acompañó aproximadamente la inflación del período. En términos reales, el gasto o recurso se mantuvo estable.`;
  } else if (vr > -10) {
    vClass = 'warn';
    vText = `<strong>Ajuste real moderado (${vr.toFixed(1)}%).</strong> El monto creció nominalmente pero no alcanzó a cubrir la inflación. Representa una reducción real del ${Math.abs(vr).toFixed(1)}%.`;
  } else {
    vClass = 'bad';
    vText = `<strong>Recorte real significativo (${vr.toFixed(1)}%).</strong> El monto quedó muy por debajo de la inflación del período. La pérdida de poder adquisitivo es de ${Math.abs(vr).toFixed(1)} puntos porcentuales.`;
  }
  verdictEl.className = 'crc-verdict ' + vClass;
  verdictEl.innerHTML = vText;
}

/* ╔══════════════════════════════════════════════════════╗
   ║  NAVEGACIÓN                                          ║
   ╚══════════════════════════════════════════════════════╝ */
function setView(id, btn) {
  activeView = id;
  document.querySelectorAll('.wrap').forEach(w => w.classList.remove('on'));
  document.getElementById('v-' + id).classList.add('on');
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('on'));
  btn.classList.add('on');
  renderCurrentView();
}

function setYear(yr, btn) {
  activeYear = yr;
  document.querySelectorAll('.year-btn').forEach(b => b.classList.remove('on'));
  btn.classList.add('on');
  // Actualizar comparador: quitar el año activo de las opciones
  const sel = document.getElementById('cmp-select');
  Array.from(sel.options).forEach(opt => {
    opt.disabled = opt.value === String(yr);
    if (opt.value === String(yr) && cmpYear === String(yr)) {
      sel.value = 'none';
      cmpYear   = 'none';
    }
  });
  const d = DATA[yr];
  const statusTxt = d.status === 'confirmed' ? `<span style="color:var(--green)">Datos confirmados</span>` : d.status === 'partial' ? `<span style="color:var(--amber)">Datos parciales</span>` : `<span style="color:var(--mist)">Pendiente de carga</span>`;
  document.getElementById('year-status').innerHTML = `Año activo: <strong style="color:var(--navy)">${yr}</strong> · ${statusTxt}`;

  // Header chips
  if (d.resumen) {
    document.getElementById('chip-ejecutado').textContent = `$${(d.resumen.ejecutado/1000).toFixed(0)}B`;
    document.getElementById('chip-resultado').textContent = `$${fmt(d.resumen.resultadoArt44)} M`;
  } else {
    document.getElementById('chip-ejecutado').textContent = '—';
    document.getElementById('chip-resultado').textContent = '—';
  }
  document.getElementById('chip-planta').textContent = d.personal?.total ? fmtInt(d.personal.total) : '—';
  renderCurrentView();
}

function setCmp(val) {
  cmpYear = val;
  const btn = document.getElementById('btn-print-cmp');
  if (btn) btn.style.display = val !== 'none' ? '' : 'none';
  renderCurrentView();
}

function renderCurrentView() {
  switch (activeView) {
    case 'resumen':     renderResumen(); break;
    case 'recursos':    renderRecursos(); renderTortas(); break;
    case 'gastos':      renderGastos(); renderTortas(); break;
    case 'secretarias': renderSecretarias(); break;
    case 'personal':    renderPersonal(); break;
    case 'metodologia': renderMetodologia(); break;
  }
}

function renderCurrentView() {
  switch (activeView) {
    case 'resumen':     renderResumen(); break;
    case 'recursos':    renderRecursos(); renderTortas(); break;
    case 'gastos':      renderGastos(); renderTortas(); break;
    case 'secretarias': renderSecretarias(); break;
    case 'personal':    renderPersonal(); break;
    case 'deuda':       renderDeuda(); break;
    case 'metodologia': renderMetodologia(); break;
  }
}

/* ╔══════════════════════════════════════════════════════╗
   ║  DEUDA PÚBLICA                                       ║
   ╚══════════════════════════════════════════════════════╝ */
function renderDeuda() {
  const years = [2024, 2025, 2026].filter(y => DATA[y]);

  // Datos de deuda por año
  const servicioDeuda = {
    2024: DATA[2024]?.gastos?.porObjeto?.find(o => o.label.toLowerCase().includes('deuda'))?.val || 0,
    2025: DATA[2025]?.gastos?.porObjeto?.find(o => o.label.toLowerCase().includes('deuda'))?.val || 0,
    2026: DATA[2026]?.gastos?.porObjeto?.find(o => o.label.toLowerCase().includes('deuda'))?.val || 0,
  };
  const deudaFlotante = {
    2023: 1666.68,  // inferido del servicio de deuda 2024
    2024: DATA[2024]?.resumen?.deudaFlotante || 0,
    2025: DATA[2025]?.resumen?.deudaFlotante || 0,
  };

  // KPIs
  const df24 = deudaFlotante[2024];
  const df25 = deudaFlotante[2025];
  const varDf = df24 ? ((df25 - df24) / df24 * 100) : null;
  const colDf = varDf > 0 ? '#b91c1c' : '#15803d';  // deuda: rojo si sube

  document.getElementById('kpi-deuda').innerHTML = `
    <div class="kpi amber">
      <div class="kpi-label">Deuda flotante 2023</div>
      <div class="kpi-value">$${fmt(deudaFlotante[2023])} M</div>
      <div class="kpi-sub">Pagada durante 2024</div>
    </div>
    <div class="kpi amber">
      <div class="kpi-label">Deuda flotante 2024</div>
      <div class="kpi-value">$${fmt(df24)} M</div>
      <div class="kpi-sub">Pagada durante 2025</div>
      <div class="kpi-delta warn">+${(((df24 - deudaFlotante[2023]) / deudaFlotante[2023]) * 100).toFixed(1)}% vs 2023</div>
    </div>
    <div class="kpi red">
      <div class="kpi-label">Deuda flotante 2025</div>
      <div class="kpi-value">$${fmt(df25)} M</div>
      <div class="kpi-sub">Pagada en Q1 2026</div>
      ${varDf !== null ? `<div class="kpi-delta down">+${varDf.toFixed(1)}% vs 2024</div>` : ''}
    </div>
    <div class="kpi">
      <div class="kpi-label">Servicio deuda 2025</div>
      <div class="kpi-value">$${fmt(servicioDeuda[2025])} M</div>
      <div class="kpi-sub">${((servicioDeuda[2025] / (DATA[2025]?.gastos?.total || 1)) * 100).toFixed(1)}% del gasto total</div>
      <div class="kpi-delta down">+${(((servicioDeuda[2025] - servicioDeuda[2024]) / servicioDeuda[2024]) * 100).toFixed(1)}% vs 2024</div>
    </div>
  `;

  // Barras evolución servicio deuda
  const maxS = Math.max(servicioDeuda[2024], servicioDeuda[2025], servicioDeuda[2026]);
  document.getElementById('bars-deuda-evol').innerHTML = [
    { año: 2024, val: servicioDeuda[2024] },
    { año: 2025, val: servicioDeuda[2025] },
    { año: 2026, val: servicioDeuda[2026], nota: 'Q1 real sin anualizar' },
  ].map(r => `
    <div style="margin-bottom:12px">
      <div style="display:flex;justify-content:space-between;font-size:12px;margin-bottom:4px">
        <span style="font-weight:600;color:var(--ink)">${r.año}${r.nota ? `<span style="font-size:10px;color:var(--mist);font-weight:400"> · ${r.nota}</span>` : ''}</span>
        <span style="font-family:'JetBrains Mono',monospace;font-weight:700;color:rgba(13,148,136,1)">$${fmt(r.val)} M</span>
      </div>
      <div style="background:var(--bg2);border-radius:3px;height:14px;overflow:hidden">
        <div style="width:${r.val/maxS*100}%;height:100%;background:rgba(220,38,38,.70);border-radius:3px;transition:width .4s"></div>
      </div>
    </div>`).join('');

  // Barras deuda flotante
  const maxF = Math.max(...Object.values(deudaFlotante));
  document.getElementById('bars-deuda-flotante').innerHTML = [
    { año: 2023, val: deudaFlotante[2023], nota: 'inferido' },
    { año: 2024, val: deudaFlotante[2024] },
    { año: 2025, val: deudaFlotante[2025] },
  ].map(r => `
    <div style="margin-bottom:12px">
      <div style="display:flex;justify-content:space-between;font-size:12px;margin-bottom:4px">
        <span style="font-weight:600;color:var(--ink)">${r.año}${r.nota ? `<span style="font-size:10px;color:var(--mist);font-weight:400"> · ${r.nota}</span>` : ''}</span>
        <span style="font-family:'JetBrains Mono',monospace;font-weight:700;color:rgba(220,38,38,.85)">$${fmt(r.val)} M</span>
      </div>
      <div style="background:var(--bg2);border-radius:3px;height:14px;overflow:hidden">
        <div style="width:${r.val/maxF*100}%;height:100%;background:rgba(220,38,38,.70);border-radius:3px;transition:width .4s"></div>
      </div>
    </div>`).join('');
}

/* ╔══════════════════════════════════════════════════════╗
   ║  BUSCADOR DE PROGRAMAS                               ║
   ╚══════════════════════════════════════════════════════╝ */
function searchPrograms(query) {
  const resultsEl = document.getElementById('prog-search-results');
  const countEl   = document.getElementById('prog-search-count');
  const q = query.trim().toLowerCase();

  if (q.length < 2) {
    resultsEl.style.display = 'none';
    countEl.textContent = '';
    return;
  }

  // Buscar en todos los años
  const hits = [];
  [2024, 2025, 2026].forEach(yr => {
    const d = DATA[yr];
    if (!d?.secretarias) return;
    d.secretarias.forEach(sec => {
      (sec.programas || []).forEach(prog => {
        if (prog.label.toLowerCase().includes(q)) {
          hits.push({ yr, sec: sec.label, prog: prog.label, val: prog.val });
        }
      });
    });
  });

  countEl.textContent = hits.length ? `${hits.length} resultado${hits.length > 1 ? 's' : ''}` : 'Sin resultados';

  if (!hits.length) {
    resultsEl.style.display = 'block';
    resultsEl.innerHTML = `<div style="font-size:12px;color:var(--mist);padding:.5rem 0">Sin resultados para "${query}"</div>`;
    return;
  }

  // Agrupar por programa
  const porProg = {};
  hits.forEach(h => {
    if (!porProg[h.prog]) porProg[h.prog] = [];
    porProg[h.prog].push(h);
  });

  resultsEl.style.display = 'block';
  resultsEl.innerHTML = Object.entries(porProg).map(([prog, rows]) => {
    const highlighted = prog.replace(new RegExp(q, 'gi'), m => `<mark style="background:rgba(13,148,136,.2);border-radius:2px;padding:0 2px">${m}</mark>`);
    return `<div style="border:1px solid var(--borde);border-radius:var(--r2);padding:.75rem 1rem;margin-bottom:.5rem;background:var(--card)">
      <div style="font-weight:600;font-size:12.5px;color:var(--ink);margin-bottom:.4rem">${highlighted}</div>
      <div style="display:flex;gap:1rem;flex-wrap:wrap">
        ${rows.map(r => `
          <span style="font-size:11px;color:var(--ink2)">
            <strong style="color:var(--navy)">${r.yr}</strong>
            · ${r.sec}
            · <span style="font-family:'JetBrains Mono',monospace;font-weight:700;color:rgba(13,148,136,1)">$${fmt(r.val)}M</span>
          </span>`).join('')}
      </div>
    </div>`;
  }).join('');
}

/* ╔══════════════════════════════════════════════════════╗
   ║  EXPORTAR A WORD                                     ║
   ╚══════════════════════════════════════════════════════╝ */
function exportWord() {
  const d  = DATA[activeYear];
  const dc = cmpYear !== 'none' ? DATA[parseInt(cmpYear)] : null;
  const r  = d?.resumen;
  const rc = dc?.resumen;
  const g  = d?.gastos;
  const ipc = d?.ipc || 0;
  const today = new Date().toLocaleDateString('es-AR', { day:'2-digit', month:'long', year:'numeric' });

  const varStr = (va, vb) => {
    if (!va || !vb) return '';
    const vn = ((va-vb)/vb*100);
    const vr = ipc ? (((1+vn/100)/(1+ipc))-1)*100 : null;
    return vn > 0
      ? `+${vn.toFixed(1)}% nom${vr !== null ? ` / +${vr.toFixed(1)}% real` : ''}`
      : `${vn.toFixed(1)}% nom${vr !== null ? ` / ${vr.toFixed(1)}% real` : ''}`;
  };

  const tableStyle = 'border-collapse:collapse;width:100%;font-size:11pt;margin-bottom:14pt';
  const thStyle    = 'background:#1e3a5f;color:#fff;padding:6pt 8pt;text-align:left;border:1px solid #ccc';
  const tdStyle    = 'padding:5pt 8pt;border:1px solid #ccc;vertical-align:top';
  const td2Style   = tdStyle + ';background:#f1f5f9';

  const secTable = d?.secretarias?.filter(s=>s.val>0).sort((a,b)=>b.val-a.val).map((s,i) => {
    const sc = dc?.secretarias?.find(c => c.label===s.label || (SEC_EQUIV[s.label]===c.label) || (SEC_EQUIV[c.label]===s.label));
    const vs = varStr(s.val, sc?.val);
    return `<tr>
      <td style="${i%2===0?tdStyle:td2Style}">${s.label}</td>
      <td style="${i%2===0?tdStyle:td2Style};text-align:right">${sc ? '$'+fmt(sc.val)+' M' : '—'}</td>
      <td style="${i%2===0?tdStyle:td2Style};text-align:right;font-weight:bold">$${fmt(s.val)} M</td>
      <td style="${i%2===0?tdStyle:td2Style};text-align:right">${vs}</td>
    </tr>`;
  }).join('') || '';

  const objTable = g?.porObjeto?.map((o,i) => {
    const oc = dc?.gastos?.porObjeto?.[i];
    const vo = varStr(o.val, oc?.val);
    return `<tr>
      <td style="${i%2===0?tdStyle:td2Style}">${o.label}</td>
      <td style="${i%2===0?tdStyle:td2Style};text-align:right">${oc ? '$'+fmt(oc.val)+' M' : '—'}</td>
      <td style="${i%2===0?tdStyle:td2Style};text-align:right;font-weight:bold">$${fmt(o.val)} M</td>
      <td style="${i%2===0?tdStyle:td2Style};text-align:right">${vo}</td>
    </tr>`;
  }).join('') || '';

  const cmpHeader = dc ? `<th style="${thStyle}">${cmpYear} ($M)</th>` : '';
  const cmpVarHeader = dc ? `<th style="${thStyle}">Variación</th>` : '';

  const html = `<!DOCTYPE html><html><head><meta charset="UTF-8">
<style>
  body { font-family: Arial, sans-serif; font-size: 11pt; color: #1a1a2e; margin: 2cm }
  h1 { font-size: 16pt; color: #1e3a5f; border-bottom: 2px solid #1e3a5f; padding-bottom: 6pt }
  h2 { font-size: 13pt; color: #1e3a5f; margin-top: 18pt; margin-bottom: 6pt }
  .sub { font-size: 9pt; color: #64748b; margin-bottom: 4pt }
  .footer { font-size: 8pt; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 8pt; margin-top: 20pt }
</style></head><body>

<h1>Análisis Presupuestario · Municipio de Tres de Febrero</h1>
<p class="sub">Período: ${activeYear}${dc ? ' vs ' + cmpYear : ''} · Elaborado: ${today} · Fuente: RAFAM oficial · Bloque HCD Tres de Febrero</p>
${d?.resumen?.alertaPrincipal ? `<p style="background:#fef9c3;border:1px solid #fbbf24;border-radius:4pt;padding:8pt 12pt;font-size:10pt">${d.resumen.alertaPrincipal.replace(/<[^>]+>/g,'')}</p>` : ''}

<h2>1. Resumen ejecutivo</h2>
<table style="${tableStyle}"><thead><tr>
  <th style="${thStyle}">Indicador</th>
  ${cmpHeader}<th style="${thStyle}">${activeYear}</th>${cmpVarHeader}
</tr></thead><tbody>
${[
  ['Ejecutado (devengado)', r?.ejecutado, rc?.ejecutado],
  ['Ingresos corrientes (percibido)', r?.ingCorrientes, rc?.ingCorrientes],
  ['Gastos corrientes', r?.gasCorrientes, rc?.gasCorrientes],
  ['Gastos de capital', r?.gastosCapital, rc?.gastosCapital],
  ['Resultado Art. 43', r?.superavitArt43, rc?.superavitArt43],
  ['Resultado Art. 44 (LOM)', r?.resultadoArt44, rc?.resultadoArt44],
  ['Deuda flotante', r?.deudaFlotante, rc?.deudaFlotante],
  ['Saldo de caja final', r?.saldoCajaFin, rc?.saldoCajaFin],
].filter(([,va]) => va != null).map(([label, va, vb], i) => `<tr>
  <td style="${i%2===0?tdStyle:td2Style}">${label}</td>
  ${dc ? `<td style="${i%2===0?tdStyle:td2Style};text-align:right">${vb ? '$'+fmt(vb)+' M' : '—'}</td>` : ''}
  <td style="${i%2===0?tdStyle:td2Style};text-align:right;font-weight:bold">$${fmt(va)} M</td>
  ${dc ? `<td style="${i%2===0?tdStyle:td2Style};text-align:right">${varStr(va,vb)}</td>` : ''}
</tr>`).join('')}
</tbody></table>

<h2>2. Gastos por objeto</h2>
<table style="${tableStyle}"><thead><tr>
  <th style="${thStyle}">Objeto</th>${cmpHeader}<th style="${thStyle}">${activeYear} ($M)</th>${cmpVarHeader}
</tr></thead><tbody>${objTable}</tbody></table>

<h2>3. Gastos por secretaría</h2>
<table style="${tableStyle}"><thead><tr>
  <th style="${thStyle}">Secretaría</th>${cmpHeader}<th style="${thStyle}">${activeYear} ($M)</th>${cmpVarHeader}
</tr></thead><tbody>${secTable}</tbody></table>

<div class="footer">
Valores en millones de pesos corrientes (M ARS). Variación real deflactada por IPC ${activeYear}: ${(ipc*100).toFixed(1)}% (INDEC).
Datos: RAFAM Municipalidad de Tres de Febrero. Uso interno del Bloque HCD.
</div>
</body></html>`;

  const blob = new Blob(['\ufeff' + html], { type: 'application/msword' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  a.download = `presupuesto_3f_${activeYear}${dc ? '_vs_' + cmpYear : ''}.doc`;
  a.click();
  URL.revokeObjectURL(url);
}

/* ═══════ INIT ═══════ */
renderResumen();
initCalc();
// Tortas se renderizan al entrar a Gastos/Recursos

/* ╔══════════════════════════════════════════════════════╗
   ║  EXPORTACIÓN A EXCEL                                 ║
   ╚══════════════════════════════════════════════════════╝ */

function xlsxDownload(wb, filename) {
  XLSX.writeFile(wb, filename);
}

function sheetFromRows(headers, rows) {
  const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);
  // Column widths
  ws['!cols'] = headers.map(() => ({ wch: 22 }));
  ws['!cols'][0] = { wch: 38 };
  return ws;
}

// ── Resumen ──
function exportResumen() {
  const d = DATA[activeYear];
  if (!d.resumen) { alert('Sin datos para este año.'); return; }
  const r = d.resumen;
  const wb = XLSX.utils.book_new();

  const rows = [
    ['Ejecutado (devengado)', r.ejecutado],
    ['Percibido total', r.percibido],
    ['Presupuesto aprobado original', r.presupAprobado],
    ['Superávit Art. 43', r.superavitArt43],
    ['Resultado Art. 44', r.resultadoArt44],
    ['Saldo de caja inicio', r.saldoCajaIni],
    ['Saldo de caja cierre', r.saldoCajaFin],
    ['Deuda flotante', r.deudaFlotante],
    ['Ingresos corrientes percibidos', r.ingCorrientes],
    ['Gastos corrientes', r.gasCorrientes],
    ['Ahorro corriente', r.ahorroCorriente],
    ['Recursos de capital', r.recursosCapital],
    ['Gastos de capital', r.gastosCapital],
  ];

  const ws = sheetFromRows(['Concepto', `${activeYear} ($M)`], rows);
  XLSX.utils.book_append_sheet(wb, ws, 'Resumen');
  xlsxDownload(wb, `3F_Resumen_${activeYear}.xlsx`);
}

/* ╔══════════════════════════════════════════════════════╗
   ║  IMPRIMIR COMPARATIVA                                ║
   ╚══════════════════════════════════════════════════════╝ */
function printComparativa() {
  if (cmpYear === 'none') return;
  const d  = DATA[activeYear];
  const dc = DATA[parseInt(cmpYear)];
  const r  = d.resumen;
  const rc = dc?.resumen;
  const g  = d.gastos;
  const gc = dc?.gastos;
  const res = d.recursos;
  const resc = dc?.recursos;
  const ipc = d.ipc || 0;
  const today = new Date().toLocaleDateString('es-AR', {day:'2-digit',month:'long',year:'numeric'});

  const pct  = (v, t) => t ? (v/t*100).toFixed(1)+'%' : '—';
  const fmtM = v => v != null ? '$'+fmt(v)+' M' : '—';
  const varRow = (label, va, vb) => {
    if (va == null || vb == null) return '';
    const vn = (va-vb)/vb*100;
    const vr = ipc ? ((1+vn/100)/(1+ipc)-1)*100 : null;
    const col = (vr??vn)>2?'#15803d':(vr??vn)>-5?'#92400e':'#b91c1c';
    return `<tr>
      <td>${label}</td>
      <td style="text-align:right">${fmtM(vb)}</td>
      <td style="text-align:right;color:rgba(13,108,164,1);font-weight:700">${fmtM(va)}</td>
      <td style="text-align:right;color:${col};font-weight:700">${vn>0?'+':''}${vn.toFixed(1)}% nom</td>
      <td style="text-align:right;color:${col};font-weight:700">${vr!==null?(vr>0?'+':'')+vr.toFixed(1)+'% real':'—'}</td>
    </tr>`;
  };

  // ── 1. Resumen ejecutivo ──
  const resumenRows = r && rc ? [
    ['Ejecutado (devengado)',    r.ejecutado,      rc.ejecutado],
    ['Ingresos corrientes perc.',r.ingCorrientes,  rc.ingCorrientes],
    ['Gastos corrientes',        r.gasCorrientes,  rc.gasCorrientes],
    ['Ahorro corriente',         r.ahorroCorriente,rc.ahorroCorriente],
    ['Gastos de capital',        r.gastosCapital,  rc.gastosCapital],
    ['Resultado Art. 43',        r.superavitArt43, rc.superavitArt43],
    ['Resultado Art. 44 (LOM)',  r.resultadoArt44, rc.resultadoArt44],
    ['Deuda flotante',           r.deudaFlotante,  rc.deudaFlotante],
    ['Saldo de caja final',      r.saldoCajaFin,   rc.saldoCajaFin],
  ].map(([l,va,vb]) => varRow(l,va,vb)).join('') : '<tr><td colspan="5">Sin datos</td></tr>';

  // ── 2. Por objeto del gasto ──
  const objetoRows = g?.porObjeto?.map((o,i) => {
    const oc = gc?.porObjeto?.[i];
    return varRow(o.label, o.val, oc?.val);
  }).join('') || '';

  // ── 3. Por secretaría ──
  const secRows = d.secretarias?.filter(s=>s.val>0).sort((a,b)=>b.val-a.val).map(s => {
    const sc = dc?.secretarias?.find(c => c.label===s.label ||
      (SEC_EQUIV[c.label]===s.label) || (SEC_EQUIV[s.label]===c.label));
    return varRow(s.label, s.val, sc?.val);
  }).join('') || '';

  // ── 4. Recursos percibidos por tipo ──
  const recRows = res?.tipos?.map((t,i) => {
    const tc = resc?.tipos?.[i];
    return varRow(t.label, t.val, tc?.val);
  }).join('') || '';

  // ── 5. Tasas municipales ──
  const tasaRows = res?.tasas?.map((t,i) => {
    const tc = resc?.tasas?.[i];
    return varRow(t.label, t.val, tc?.val);
  }).join('') || '';

  const theadHTML = `<thead><tr style="background:#1d4ed8;color:#fff">
    <th style="text-align:left;padding:6px 8px">Concepto</th>
    <th style="text-align:right;padding:6px 8px">${cmpYear} ($M)</th>
    <th style="text-align:right;padding:6px 8px">${activeYear} ($M)</th>
    <th style="text-align:right;padding:6px 8px">Var. nominal</th>
    <th style="text-align:right;padding:6px 8px">Var. real (IPC ${(ipc*100).toFixed(1)}%)</th>
  </tr></thead>`;

  const section = (titulo, rows) => `
    <h2 style="font-size:13px;font-weight:700;color:#1e3a5f;border-bottom:2px solid #1d4ed8;padding-bottom:4px;margin:18px 0 8px">${titulo}</h2>
    <table style="width:100%;border-collapse:collapse;font-size:11px">
      ${theadHTML}
      <tbody>${rows}</tbody>
    </table>`;

  const html = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>Comparativa presupuestaria ${cmpYear}–${activeYear} · Tres de Febrero</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0 }
    body { font-family: 'Segoe UI', Arial, sans-serif; font-size: 11px; color: #1a1a2e; padding: 20px 28px }
    h1 { font-size: 16px; color: #1e3a5f; margin-bottom: 2px }
    .sub { font-size: 10px; color: #64748b; margin-bottom: 4px }
    table { page-break-inside: avoid }
    tbody tr:nth-child(even) { background: #f1f5f9 }
    tbody td { padding: 5px 8px; border-bottom: 1px solid #e2e8f0 }
    .footer { margin-top: 20px; font-size: 9px; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 8px }
    @media print {
      body { padding: 10px 16px }
      @page { margin: 12mm 10mm; size: A4 portrait }
    }
  </style>
</head>
<body>
  <h1>Comparativa presupuestaria · Municipio de Tres de Febrero</h1>
  <div class="sub">Período: ${cmpYear} vs ${activeYear} · IPC ${activeYear}: ${(ipc*100).toFixed(1)}% · Inflación real acumulada usada para deflactar</div>
  <div class="sub">Generado: ${today} · Fuente: RAFAM oficial · Elaboración: Bloque HCD Tres de Febrero</div>

  ${section('1. Resumen ejecutivo', resumenRows)}
  ${section('2. Gastos por objeto', objetoRows)}
  ${section('3. Gastos por secretaría', secRows)}
  ${section('4. Recursos percibidos por tipo', recRows)}
  ${section('5. Tasas municipales (percibido)', tasaRows)}

  <div class="footer">
    Valores en millones de pesos corrientes (M ARS). Variación real = variación nominal deflactada por IPC INDEC del año ${activeYear}.
    Datos ${activeYear}: ${d.fuente || 'RAFAM'}. Datos ${cmpYear}: ${dc?.fuente || 'RAFAM'}.
  </div>
</body>
</html>`;

  const win = window.open('', '_blank', 'width=900,height=700');
  win.document.write(html);
  win.document.close();
  win.focus();
  setTimeout(() => win.print(), 400);
}

// ── Recursos ──
function exportRecursos() {
  const d = DATA[activeYear];
  if (!d.recursos) { alert('Sin datos para este año.'); return; }
  const r = d.recursos;
  const wb = XLSX.utils.book_new();

  // Hoja 1: totales
  const wsTot = sheetFromRows(
    ['Concepto', `${activeYear} ($M)`],
    [
      ['Total devengado', r.totalDevengado],
      ['Total percibido', r.totalPercibido],
      ['Origen municipal (percibido)', r.origenMunicipal],
      ['Origen provincial (percibido)', r.origenProvincial],
      ['Origen nacional (percibido)', r.origenNacional],
    ]
  );
  XLSX.utils.book_append_sheet(wb, wsTot, 'Totales');

  // Hoja 2: por tipo
  const wsTipo = sheetFromRows(
    ['Tipo de recurso', `${activeYear} ($M)`],
    r.tipos.map(t => [t.label, t.val])
  );
  XLSX.utils.book_append_sheet(wb, wsTipo, 'Por tipo');

  // Hoja 3: tributarios detalle
  const wsTrib = sheetFromRows(
    ['Rubro', `${activeYear} ($M)`, '% del total', 'Origen'],
    r.tributarios.map(t => [t.label, t.val, ((t.val / r.totalPercibido)*100).toFixed(1)+'%', t.orig])
  );
  XLSX.utils.book_append_sheet(wb, wsTrib, 'Tributarios');

  // Hoja 4: fondos afectados
  const wsFondos = sheetFromRows(
    ['Fondo', 'Saldo inicial ($M)', 'Ingresos ($M)', 'Egresos ($M)', 'Saldo cierre ($M)'],
    r.fondos.map(f => [f.label, f.si, f.ing, f.eg, f.sc])
  );
  XLSX.utils.book_append_sheet(wb, wsFondos, 'Fondos afectados');

  xlsxDownload(wb, `3F_Recursos_${activeYear}.xlsx`);
}

// ── Gastos ──
function exportGastos() {
  const d = DATA[activeYear];
  if (!d.gastos) { alert('Sin datos para este año.'); return; }
  const g = d.gastos;
  const wb = XLSX.utils.book_new();

  // Hoja 1: por objeto
  const wsObj = sheetFromRows(
    ['Objeto del gasto', `${activeYear} devengado ($M)`, '% del total', 'Impago ($M)'],
    g.porObjeto.map(o => [o.label, o.val, o.pct+'%', o.impago])
  );
  XLSX.utils.book_append_sheet(wb, wsObj, 'Por objeto');

  // Hoja 2: programas principales
  const wsProg = sheetFromRows(
    ['Programa', `${activeYear} ($M)`],
    g.programas.map(p => [p.label, p.val])
  );
  XLSX.utils.book_append_sheet(wb, wsProg, 'Programas principales');

  // Hoja 3: resumen financiero
  const wsRes = sheetFromRows(
    ['Concepto', `${activeYear} ($M)`],
    [
      ['Total devengado', g.total],
      ['Total pagado', g.pagado],
      ['Deuda flotante', g.deudaFlotante],
      ['% deuda / devengado', ((g.deudaFlotante/g.total)*100).toFixed(1)+'%'],
    ]
  );
  XLSX.utils.book_append_sheet(wb, wsRes, 'Resumen financiero');

  xlsxDownload(wb, `3F_Gastos_${activeYear}.xlsx`);
}

// ── Secretarías ──
function exportSecretarias() {
  const d  = DATA[activeYear];
  const dc = cmpYear !== 'none' ? DATA[parseInt(cmpYear)] : null;
  const wb = XLSX.utils.book_new();
  const ipc = d.ipc || 0;
  const totalActivo = d.secretarias.reduce((s,i) => s + (i.val||0), 0);

  const headers = ['Secretaría / Área', `${activeYear} ($M)`, '% del total'];
  if (dc) headers.push(`${cmpYear} ($M)`, 'Var. nominal (%)', 'Var. real (%)');
  headers.push('Notas');

  const rows = d.secretarias.map(s => {
    const secCmp = dc ? dc.secretarias.find(c => c.label === s.label) : null;
    const vn = (s.val && secCmp?.val) ? ((s.val - secCmp.val) / secCmp.val * 100).toFixed(1) : '';
    const vr = (vn !== '' && ipc) ? (((1+parseFloat(vn)/100)/(1+ipc)-1)*100).toFixed(1) : '';
    const row = [
      s.label,
      s.val || '',
      s.val ? ((s.val/totalActivo)*100).toFixed(1)+'%' : '',
    ];
    if (dc) row.push(secCmp?.val || '', vn ? vn+'%' : '', vr ? vr+'%' : '');
    row.push(s.nota || '');
    return row;
  });

  const ws = sheetFromRows(headers, rows);
  XLSX.utils.book_append_sheet(wb, ws, `Secretarías ${activeYear}`);
  xlsxDownload(wb, `3F_Secretarias_${activeYear}.xlsx`);
}

// ── Personal ──
function exportPersonal() {
  const p = DATA[activeYear].personal;
  const wb = XLSX.utils.book_new();

  // Hoja 1: resumen planta
  const wsRes = sheetFromRows(
    ['Concepto', `${activeYear}`],
    [
      ['Total empleados', p.total || ''],
      ['Planta permanente', p.permanente || ''],
      ['Planta mensualizada', p.mensualizado || ''],
      ['Gasto total personal ($M)', p.gastoTotal || ''],
      ['Paritaria acumulada (%)', p.paritaria || ''],
    ]
  );
  XLSX.utils.book_append_sheet(wb, wsRes, 'Resumen');

  // Hoja 2: por secretaría
  if (p.porSecretaria && p.porSecretaria.length) {
    const wsSec = sheetFromRows(
      ['Secretaría', 'Empleados'],
      p.porSecretaria.map(s => [s.label, s.val])
    );
    XLSX.utils.book_append_sheet(wb, wsSec, 'Por secretaría');
  }

  // Hoja 3: componentes del gasto
  if (p.componentes && p.componentes.length) {
    const wsComp = sheetFromRows(
      ['Componente', `${activeYear} ($M)`],
      p.componentes.map(c => [c.label, c.val])
    );
    XLSX.utils.book_append_sheet(wb, wsComp, 'Componentes gasto');
  }

  xlsxDownload(wb, `3F_Personal_${activeYear}.xlsx`);
}

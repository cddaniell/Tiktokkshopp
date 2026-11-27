/* VetCamp · página do cliente: mostra o resumo de um animal compartilhado pelo veterinário ou pelo haras.
   Só lê o link recebido (portal/<código>); o banco recusa links vencidos e não deixa listar outros. */
(function(){
  'use strict';
  const app=document.getElementById('app'),CFG=window.SAMVET_FIREBASE||{};
  const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const br=d=>d?String(d).slice(0,10).replace(/[^0-9-]/g,'').split('-').reverse().join('/'):'—';
  const hoje=()=>{const d=new Date();d.setMinutes(d.getMinutes()-d.getTimezoneOffset());return d.toISOString().slice(0,10)};
  const fim=msg=>{app.innerHTML=`<div class="box vazio"><h1>VetCamp</h1><p>${esc(msg)}</p></div>`};
  const tok=new URLSearchParams(location.search).get('t')||'';
  if(!/^[A-Za-z0-9]{24,40}$/.test(tok))return fim('Link inválido. Peça um novo link a quem compartilhou.');
  const demo=String(CFG.projectId||'').startsWith('demo-');
  const base=demo?`http://${location.hostname}:8080/v1`:'https://firestore.googleapis.com/v1';
  const url=`${base}/projects/${encodeURIComponent(CFG.projectId)}/databases/(default)/documents/portal/${tok}`+(demo?'':`?key=${encodeURIComponent(CFG.apiKey||'')}`);
  fetch(url).then(r=>{if(r.status===403||r.status===404)throw new Error('vencido');if(!r.ok)throw new Error('rede');return r.json()}).then(doc=>{
    const f=doc.fields||{};let d;try{d=JSON.parse((f.dados&&f.dados.stringValue)||'{}')}catch(e){return fim('Não foi possível abrir este link.')}
    const ate=+((f.ate&&(f.ate.integerValue||f.ate.doubleValue))||0);
    const foto=typeof d.foto==='string'&&/^data:image\/(jpeg|png|webp);base64,/.test(d.foto)?d.foto:'';
    const linha=(a)=>a.filter(Boolean).map(esc).join(' · ');
    document.title=`${d.nome||'Animal'} · VetCamp`;
    app.innerHTML=`<header class="top">${foto?`<img src="${foto}" alt="Foto de ${esc(d.nome)}">`:''}<div><h1>${esc(d.nome)}</h1><div class="meta">${linha([d.especie,d.raca,d.sexo,d.pelagem,d.nasc?'nasc. '+br(d.nasc):''])}</div><div class="meta">${linha([d.tutor,d.local])}</div></div></header>
    ${(d.carencia||[]).map(c=>`<div class="alert">${c.t==='leite'?'<b>Leite em carência</b>':'<b>Em carência</b> (abate / competição)'} de ${esc(c.m)} até <b>${br(c.ate)}</b></div>`).join('')}
    ${d.gest?`<div class="box"><b>Prenhe</b> · parto previsto ${br(d.gest.parto)}</div>`:''}
    ${(d.proximos||[]).length?`<div class="box"><h2>Próximos cuidados</h2><table>${d.proximos.map(x=>`<tr><td>${br(x.d)}${x.h?' '+esc(x.h):''}</td><td class="${x.d<hoje()?'late':''}">${esc(x.t)}</td></tr>`).join('')}</table></div>`:''}
    <div class="box"><h2>Carteira de vacinas e vermífugos</h2>${(d.vacinas||[]).length?`<table><tr><th>Data</th><th>Produto</th><th>Próxima</th></tr>${d.vacinas.map(v=>`<tr><td>${br(v.d)}</td><td>${esc(v.n)}<br><span class="meta">${linha([v.t,v.lote?'lote '+v.lote:''])}</span></td><td>${br(v.prox)}</td></tr>`).join('')}</table>`:'<p class="meta">Nenhum registro.</p>'}</div>
    ${(d.oficiais||[]).length?`<div class="box"><h2>Exames oficiais</h2><table><tr><th>Exame</th><th>Coleta</th><th>Resultado</th><th>Validade</th></tr>${d.oficiais.map(x=>`<tr><td>${esc(x.t)}</td><td>${br(x.d)}</td><td>${esc(x.r)}</td><td class="${x.val&&x.val<hoje()?'late':'ok'}">${br(x.val)}</td></tr>`).join('')}</table></div>`:''}
    ${d.ultimo&&(d.ultimo.diag||d.ultimo.orient)?`<div class="box"><h2>Último atendimento · ${br(d.ultimo.d)}</h2>${d.ultimo.diag?`<p><b>Diagnóstico:</b> ${esc(d.ultimo.diag)}</p>`:''}${d.ultimo.orient?`<p><b>Orientações:</b> ${esc(d.ultimo.orient)}</p>`:''}</div>`:''}
    ${d.clinica||d.vet||d.tel?`<div class="box"><h2>${esc(d.clinica||'Responsável')}</h2><p class="meta" style="margin:0">${linha([d.vet,d.crmv?'CRMV '+d.crmv:'',d.tel])}</p></div>`:''}
    <footer>Atualizado em ${d.gerado?new Date(d.gerado).toLocaleDateString('pt-BR'):'—'}${ate?' · link válido até '+new Date(ate).toLocaleDateString('pt-BR'):''}<br>Feito com VetCamp</footer>`;
  }).catch(e=>fim(e.message==='vencido'?'Este link venceu ou foi desativado. Peça um novo a quem compartilhou.':'Sem conexão. Tente de novo em instantes.'));
})();

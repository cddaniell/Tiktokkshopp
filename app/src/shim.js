/* VetCamp · versão site próprio.
   Liga o VetCamp ao Firebase (login por e-mail, banco Firestore, arquivos no Storage)
   oferecendo a mesma interface window.claude.use(...) que o app usa dentro do Claude.
   Assim o mesmo vetcamp.html roda nos dois lugares. */
(function(){
  'use strict';
  window.SAMVET_STANDALONE=true;
  const CFG=window.SAMVET_FIREBASE||{};
  const configurado=!!(CFG.apiKey&&CFG.projectId);
  const DEMO=String(CFG.projectId||'').startsWith('demo-');

  /* ---------- tela de login ---------- */
  const css=`
  #auth{position:fixed;inset:0;z-index:100;background:var(--bg,#f6eee3);display:flex;align-items:center;justify-content:center;padding:24px max(16px,env(safe-area-inset-left,0px)) 24px max(16px,env(safe-area-inset-right,0px));overflow:auto}
  #auth[hidden]{display:none!important}
  #auth .ab{width:min(420px,100%);display:grid;gap:14px;margin:auto;position:relative}
  #auth{flex-direction:column;justify-content:flex-start;padding:0 0 24px}
  #auth .ab{padding:0 max(16px,env(safe-area-inset-left,0px));box-sizing:border-box;width:min(452px,100%);margin-top:-46px}
  #auth .acena{position:relative;flex:none;width:100%;height:270px;overflow:hidden;background:linear-gradient(color-mix(in srgb,var(--bg,#f6eee3) 28%,transparent),color-mix(in srgb,var(--bg,#f6eee3) 28%,transparent)),#e9c48f url(img/login-campo.jpg) 52% 30%/cover no-repeat}
  #auth .acena::after{content:"";position:absolute;inset:auto 0 0 0;height:110px;background:linear-gradient(transparent,var(--bg,#f6eee3))}
  #auth .acena .frase{display:none}
  #auth .ab .alogo{background:var(--card,#fbf6ef);-webkit-mask:none;mask:none;border-radius:50%;width:92px;height:92px;box-shadow:0 4px 14px rgb(60 30 10/.25);display:grid;place-items:center;border:3px solid var(--card,#fbf6ef)}
  #auth .ab .alogo::before{content:"";width:62px;height:62px;background:var(--brand,#5b381b);-webkit-mask:var(--logo) center/contain no-repeat;mask:var(--logo) center/contain no-repeat}
  @media (min-width:900px){
    #auth{flex-direction:row;padding:0;align-items:stretch}
    #auth .acena{position:fixed;inset:0;width:auto;height:auto;z-index:0;background:var(--bg,#f6eee3) url(img/login-campo.jpg) no-repeat;background-size:auto 100%;background-position:calc(46vw - 107vh) center}
    #auth .acena::after{inset:0;height:auto;background:linear-gradient(90deg,color-mix(in srgb,var(--bg,#f6eee3) 30%,transparent) 0%,color-mix(in srgb,var(--bg,#f6eee3) 30%,transparent) 44%,color-mix(in srgb,var(--bg,#f6eee3) 85%,transparent) 60%,var(--bg,#f6eee3) 68%)}
    #auth .acena .frase{z-index:1;right:auto;left:5vw;width:min(30vw,520px)}
    #auth .acena .frase{display:block;position:absolute;left:8%;right:8%;top:9%;color:#3d2410}
    #auth .acena .frase b{display:block;font:800 clamp(30px,3.2vw,44px)/1.1 Archivo,system-ui,sans-serif;letter-spacing:.01em}
    #auth .acena .frase span{display:block;margin-top:10px;font-size:17px;color:#5b381b;max-width:30em}
    #auth .acena ul{list-style:none;padding:0;margin:22px 0 0;display:grid;gap:10px}
    #auth .acena li{position:relative;background:rgb(251 246 239/.82);border:1px solid #d8c1a2;border-radius:12px;padding:10px 14px 10px 40px;font-size:15px;color:#3d2410;box-shadow:0 2px 8px rgb(60 30 10/.08)}
    #auth .acena li::before{content:"✓";position:absolute;left:12px;top:9px;width:20px;height:20px;border-radius:50%;background:#965a27;color:#fff;font:700 12px/20px system-ui;text-align:center}
    #auth .acena li strong{color:#5b381b}
    #auth .ab{margin:auto 4vw auto auto;padding:32px 40px;width:min(500px,40%);z-index:1}
  }
  #auth .alogo{width:96px;height:96px;margin:0 auto;background:var(--brand,#5b381b);-webkit-mask:var(--logo) center/contain no-repeat;mask:var(--logo) center/contain no-repeat}
  #auth h1{font:800 34px Archivo,system-ui,sans-serif;letter-spacing:.04em;text-align:center;margin:0;color:var(--brand,#5b381b)}
  #auth .sub{text-align:center;color:var(--mute,#76583d);margin:-8px 0 4px}
  #auth .tabs2{display:grid;grid-template-columns:1fr 1fr;background:var(--panel,#ecdcc6);border-radius:12px;padding:4px}
  #auth .tabs2 button{border:0;background:none;min-height:42px;border-radius:9px;font-weight:700;color:var(--mute,#76583d)}
  #auth .tabs2 button[aria-pressed=true]{background:var(--card,#fbf6ef);color:var(--ink,#33210f);box-shadow:0 1px 3px rgb(0 0 0/.12)}
  #auth form{display:grid;gap:10px;background:var(--card,#fbf6ef);border:1px solid var(--line,#d8c1a2);border-radius:16px;padding:18px}
  #auth label{font-size:14px;font-weight:700;display:grid;gap:4px}
  #auth input{min-height:46px;padding:8px 12px;border:1px solid var(--line,#d8c1a2);border-radius:10px;background:var(--bg,#f6eee3);font-size:16px;color:inherit}
  #auth .ok2{min-height:48px;border:0;border-radius:10px;background:var(--act,#965a27);color:var(--actink,#fff);font-weight:700;font-size:16px}
  #auth .ok2[disabled]{opacity:.6}
  #auth .lnk{border:0;background:none;color:var(--act,#965a27);font-weight:700;text-decoration:underline;padding:4px;justify-self:center}
  #auth .msg{font-size:14px;border-radius:10px;padding:10px 12px;display:none}
  #auth .msg.on{display:block}#auth .msg.err{background:color-mix(in srgb,var(--warn,#b3242c) 12%,transparent);color:var(--warn,#b3242c)}#auth .msg.inf{background:var(--note,#f3e1bf)}
  #auth .gbtn{display:flex;align-items:center;justify-content:center;gap:10px;min-height:48px;border:1px solid var(--line,#d8c1a2);border-radius:10px;background:#fff;color:#1f1f1f;font-weight:700;font-size:16px}
  #auth .gbtn[disabled]{opacity:.6}
  #auth .ou{display:flex;align-items:center;gap:10px;color:var(--mute,#76583d);font-size:13px}#auth .ou::before,#auth .ou::after{content:"";flex:1;height:1px;background:var(--line,#d8c1a2)}
  #auth .volta{display:grid;gap:10px;background:var(--card,#fbf6ef);border:1px solid var(--line,#d8c1a2);border-radius:16px;padding:16px;text-align:center}
  #auth .volta img{width:56px;height:56px;border-radius:50%;object-fit:cover;margin:0 auto}
  #auth .volta b{font-size:18px}#auth .volta span{color:var(--mute,#76583d);font-size:14px;word-break:break-all}
  #auth.entrando .ab>*:not(.alogo):not(h1):not(#a_carr){display:none!important}
  #auth #a_carr{display:none;text-align:center;color:var(--mute,#76583d);font-weight:700}#auth.entrando #a_carr{display:block}
  #auth #a_carr i{display:block;width:34px;height:34px;margin:0 auto 10px;border:4px solid var(--line,#d8c1a2);border-top-color:var(--act,#965a27);border-radius:50%;animation:agira .8s linear infinite}
  @keyframes agira{to{transform:rotate(360deg)}}
  #auth .rod{font-size:12px;color:var(--mute,#76583d);text-align:center}#auth .rod a{color:inherit}
  /* ---------- página de apresentação (antes do login) ---------- */
  #auth.lp-on{display:block;padding:0}
  #auth.lp-on>.acena,#auth.lp-on>.ab{display:none!important}
  #auth:not(.lp-on)>.lp{display:none}
  #auth .lp{color:var(--ink,#33210f);font-size:16px;line-height:1.55}
  .lp a{color:inherit}
  .lp .lpbar{position:sticky;top:0;z-index:5;display:flex;align-items:center;gap:12px;padding:12px max(16px,4vw);background:color-mix(in srgb,var(--bg,#f6eee3) 88%,transparent);backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);border-bottom:1px solid color-mix(in srgb,var(--line,#d8c1a2) 60%,transparent)}
  .lp .lpmarca{display:flex;align-items:center;gap:8px;font:800 22px Archivo,system-ui,sans-serif;color:var(--brand,#5b381b);margin-right:auto;text-decoration:none}
  .lp .lpmarca i{width:34px;height:34px;background:var(--brand,#5b381b);-webkit-mask:var(--logo) center/contain no-repeat;mask:var(--logo) center/contain no-repeat}
  .lp .lplinks{display:none;gap:22px;margin-right:18px}.lp .lplinks a{text-decoration:none;font-weight:600;color:var(--mute,#76583d)}.lp .lplinks a:hover{color:var(--ink,#33210f)}
  .lp .bt{display:inline-flex;align-items:center;justify-content:center;min-height:42px;padding:0 16px;border-radius:10px;font-weight:700;font-size:15px;border:1px solid var(--act,#965a27);cursor:pointer;text-decoration:none;white-space:nowrap}
  .lp .bt.cheio{background:var(--act,#965a27);color:var(--actink,#fff)}.lp .bt.vazio{background:transparent;color:var(--act,#965a27)}
  .lp .bt.gr{min-height:52px;padding:0 24px;font-size:17px}
  .lp .hero{position:relative;display:flex;align-items:flex-end;background:var(--bg,#f6eee3) url(img/login-campo.jpg) 44% top/auto 52vh no-repeat}
  .lp .hero::before{content:"";position:absolute;inset:0;background:linear-gradient(180deg,color-mix(in srgb,var(--bg,#f6eee3) 22%,transparent) 0%,color-mix(in srgb,var(--bg,#f6eee3) 30%,transparent) 36vh,var(--bg,#f6eee3) 52vh)}
  .lp .hero>div{position:relative;z-index:1;padding:40vh max(16px,4vw) 40px;max-width:640px}
  .lp .selo{display:inline-block;font-size:13px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:var(--act,#965a27);margin-bottom:10px}
  .lp h2{font:800 clamp(32px,5.4vw,58px)/1.06 Archivo,system-ui,sans-serif;margin:0;color:var(--brand,#5b381b);letter-spacing:-.01em}
  .lp .hero p{font-size:clamp(16px,1.6vw,19px);color:var(--ink,#33210f);margin:16px 0 24px;max-width:34em}
  .lp .ctas{display:flex;gap:10px;flex-wrap:wrap}
  .lp section.bl{padding:64px max(16px,4vw);max-width:1180px;margin:0 auto}
  .lp h3{font:800 clamp(26px,3.4vw,38px)/1.15 Archivo,system-ui,sans-serif;margin:0 0 8px;color:var(--brand,#5b381b)}
  .lp .lead{color:var(--mute,#76583d);margin:0 0 32px;max-width:40em}
  .lp .grade{display:grid;gap:16px;grid-template-columns:1fr}
  .lp .card{background:var(--card,#fbf6ef);border:1px solid var(--line,#d8c1a2);border-radius:16px;padding:22px}
  .lp .card h4{margin:12px 0 6px;font-size:18px;color:var(--ink,#33210f)}.lp .card p{margin:0;color:var(--mute,#76583d);font-size:15px}
  .lp .ic{width:44px;height:44px;border-radius:12px;display:grid;place-items:center;background:color-mix(in srgb,var(--act,#965a27) 14%,transparent);color:var(--act,#965a27)}
  .lp .ic svg{width:24px;height:24px;fill:none;stroke:currentColor;stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round}
  .lp .faixa{position:relative;background:var(--panel,#ecdcc6) center/cover no-repeat}
  .lp .faixa.f1{background-image:url(img/lp-baias.jpg);background-position:70% center}.lp .faixa.f2{background-image:url(img/lp-haras.jpg);background-position:75% 60%}
  .lp .faixa::before{content:"";position:absolute;inset:0;background:linear-gradient(180deg,var(--bg,#f6eee3) 0%,color-mix(in srgb,var(--bg,#f6eee3) 84%,transparent) 14%,color-mix(in srgb,var(--bg,#f6eee3) 58%,transparent) 50%,color-mix(in srgb,var(--bg,#f6eee3) 70%,transparent) 86%,var(--bg,#f6eee3) 100%)}
  .lp .faixa>section{position:relative}
  .lp .faixa h3,.lp .faixa .lead{text-shadow:0 1px 10px color-mix(in srgb,var(--bg,#f6eee3) 90%,transparent)}
  .lp .hero::after{content:"";position:absolute;left:0;right:0;bottom:0;height:140px;background:linear-gradient(180deg,transparent,var(--bg,#f6eee3));pointer-events:none}
  .lp .publico .card ul{margin:12px 0 0;padding-left:18px;color:var(--mute,#76583d);font-size:15px}.lp .publico .card li{margin:4px 0}
  .lp .passos{counter-reset:p}.lp .passos .card{position:relative;padding-top:26px}
  .lp .passos .card::before{counter-increment:p;content:counter(p);display:grid;place-items:center;width:36px;height:36px;border-radius:50%;background:var(--act,#965a27);color:var(--actink,#fff);font-weight:800}
  .lp .final{text-align:center;padding:64px max(16px,4vw);background:var(--brand,#5b381b);color:#fbf6ef}
  .lp .final h3{color:#fbf6ef}.lp .final p{color:#ecdcc6;margin:0 auto 24px;max-width:34em}
  .lp .final .bt.cheio{background:#fbf6ef;color:#5b381b;border-color:#fbf6ef}.lp .final .bt.vazio{color:#fbf6ef;border-color:#fbf6ef}
  .lp footer{display:flex;flex-wrap:wrap;gap:8px 20px;justify-content:space-between;padding:22px max(16px,4vw);font-size:14px;color:var(--mute,#76583d)}
  .lp .lpbar{overflow:hidden}
  .lp .lpcav{position:absolute;left:0;top:50%;width:69px;height:46px;margin-top:-24px;pointer-events:none;opacity:0;will-change:transform;z-index:2;background:url(img/cavalo-sprite.webp) 0 0/900% 100% no-repeat}
  .lp .lpbar .lpsome{transition:opacity .15s linear}
  @media (prefers-reduced-motion:reduce){.lp .lpcav{display:none}}
  #auth .voltalp{justify-self:start;border:0;background:none;color:var(--act,#965a27);font-weight:700;padding:6px 0;font-size:15px;cursor:pointer}
  @media (max-width:420px){.lp .lpbar .bt{padding:0 12px;font-size:14px;min-height:38px}.lp .lpmarca{font-size:19px}.lp .lpmarca i{width:28px;height:28px}}
  @media (min-width:760px){.lp .grade{grid-template-columns:repeat(2,1fr)}}
  @media (min-width:900px){
    .lp .lplinks{display:flex}
    .lp .hero{min-height:min(86vh,720px);align-items:center;background-position:right 30% center;background-size:cover}
    .lp .hero::before{background:linear-gradient(90deg,var(--bg,#f6eee3) 0%,color-mix(in srgb,var(--bg,#f6eee3) 88%,transparent) 34%,color-mix(in srgb,var(--bg,#f6eee3) 20%,transparent) 62%,transparent 80%)}
    .lp .hero>div{padding-top:60px;padding-bottom:60px}
    .lp .grade.tres{grid-template-columns:repeat(3,1fr)}
  }
  #verifbar{position:sticky;top:0;z-index:6;background:var(--note,#f3e1bf);color:var(--ink,#33210f);font-size:14px;padding:8px max(16px,env(safe-area-inset-left,0px));display:flex;gap:10px;align-items:center;justify-content:center;flex-wrap:wrap}
  #verifbar button{border:1px solid var(--line,#d8c1a2);background:var(--card,#fbf6ef);border-radius:8px;min-height:34px;padding:0 10px;font-weight:700;color:inherit}`;
  const st=document.createElement('style');st.textContent=css;document.head.appendChild(st);

  const tela=document.createElement('div');tela.id='auth';tela.setAttribute('role','dialog');tela.setAttribute('aria-label','Entrar no VetCamp');
  tela.innerHTML=`<div class="lp" id="lp"><header class="lpbar"><span class="lpcav" aria-hidden="true"></span><a class="lpmarca" href="#lp-topo" data-lptopo><i class="lpsome" aria-hidden="true"></i><span class="lpsome">VetCamp</span></a><nav class="lplinks" aria-label="Seções"><a class="lpsome" href="#lp-recursos">Recursos</a><a class="lpsome" href="#lp-publico">Para quem</a><a class="lpsome" href="#lp-como">Como funciona</a></nav><button type="button" class="bt vazio" data-lp="entrar">Entrar</button><button type="button" class="bt cheio" data-lp="criar">Cadastre-se</button></header><div class="hero" id="lp-topo"><div><span class="selo">Prontuário veterinário de campo</span><h2>O cuidado com seus cavalos, organizado do pasto ao prontuário.</h2><p>O VetCamp reúne atendimentos, vacinas, reprodução, fotos e financeiro de equinos e grandes animais em um só lugar, no celular e no computador.</p><div class="ctas"><button type="button" class="bt cheio gr" data-lp="criar">Criar minha conta</button><button type="button" class="bt vazio gr" data-lp="entrar">Já tenho conta</button></div></div></div><section class="bl" id="lp-recursos"><h3>Tudo o que o atendimento a campo precisa</h3><p class="lead">Ferramentas pensadas para a rotina de quem trabalha com cavalos e grandes animais.</p><div class="grade tres"><div class="card"><span class="ic"><svg viewBox="0 0 24 24"><rect x="5" y="3" width="14" height="18" rx="2"/><path d="M9 3v3h6V3M9 11h6M9 15h4"/></svg></span><h4>Prontuário completo</h4><p>Histórico de cada animal com anamnese, exame clínico, evolução, prescrições e documentos em PDF.</p></div><div class="card"><span class="ic"><svg viewBox="0 0 24 24"><path d="M18 2l4 4M17 7l-9 9-3 1 1-3 9-9M14 4l6 6M11 7l2 2M8 10l2 2M3 21l3-3"/></svg></span><h4>Vacinas e vermifugação</h4><p>Calendário sanitário com avisos de reforço e controle de carência de medicamentos.</p></div><div class="card"><span class="ic"><svg viewBox="0 0 24 24"><path d="M12 21s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 11c0 5.6-7 10-7 10z"/></svg></span><h4>Reprodução</h4><p>Controle de ciclos, coberturas, diagnóstico de gestação, previsão de parto e exame andrológico.</p></div><div class="card"><span class="ic"><svg viewBox="0 0 24 24"><path d="M4 7h3l2-3h6l2 3h3v12H4z"/><circle cx="12" cy="13" r="3.5"/></svg></span><h4>Fotos do atendimento</h4><p>Registre a evolução de feridas e lesões e compare a primeira com a última foto.</p></div><div class="card"><span class="ic"><svg viewBox="0 0 24 24"><path d="M3 6h18v12H3z"/><circle cx="12" cy="12" r="2.5"/><path d="M6 9v.01M18 15v.01"/></svg></span><h4>Financeiro e orçamentos</h4><p>Orçamentos, faturas, despesas e o custo de cada animal, prontos para enviar ao cliente.</p></div><div class="card"><span class="ic"><svg viewBox="0 0 24 24"><circle cx="9" cy="8" r="3"/><path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6"/><circle cx="17" cy="9" r="2.4"/><path d="M16 14c2.8 0 5 2.2 5 5"/></svg></span><h4>Equipe e clínica</h4><p>Trabalhe com veterinários, estagiários e financeiro, cada um com o acesso certo.</p></div></div></section><div class="faixa f1"><section class="bl publico" id="lp-publico"><h3>Feito para quem vive o campo</h3><p class="lead">Ao entrar, você escolhe o modo que combina com a sua rotina. Dá para trocar depois.</p><div class="grade"><div class="card"><span class="ic"><svg viewBox="0 0 24 24"><rect x="5" y="3" width="14" height="18" rx="2"/><path d="M9 3v3h6V3M9 11h6M9 15h4"/></svg></span><h4>Veterinários de grandes animais</h4><p>Para atendimentos em haras, fazendas e propriedades.</p><ul><li>Fichas clínicas e receituário</li><li>Agenda e lembretes do dia</li><li>Orçamentos e cobrança por cliente</li></ul></div><div class="card"><span class="ic"><svg viewBox="0 0 24 24"><path d="M12 21s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 11c0 5.6-7 10-7 10z"/></svg></span><h4>Haras e fazendas</h4><p>Para proprietários que querem o plantel organizado.</p><ul><li>Trato, pesagens e manejo</li><li>Gastos por animal e relatórios</li><li>Genealogia, provas e reprodução</li></ul></div></div></section></div><section class="bl" id="lp-como"><h3>Como funciona</h3><p class="lead">Comece em poucos minutos.</p><div class="grade tres passos"><div class="card"><h4>Crie sua conta</h4><p>Com e-mail e senha ou com a sua conta Google.</p></div><div class="card"><h4>Escolha o seu perfil</h4><p>Veterinário ou proprietário de haras e fazenda.</p></div><div class="card"><h4>Cadastre os animais</h4><p>E acompanhe tudo no celular, até com o aplicativo fechado recebendo alertas.</p></div></div></section><div class="faixa f2"><section class="bl"><div class="grade tres"><div class="card"><span class="ic"><svg viewBox="0 0 24 24"><rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/></svg></span><h4>Dados protegidos</h4><p>Cada conta acessa somente os próprios dados, guardados na nuvem com acesso protegido.</p></div><div class="card"><span class="ic"><svg viewBox="0 0 24 24"><rect x="7" y="2" width="10" height="20" rx="2"/><path d="M11 18h2"/></svg></span><h4>No celular e no computador</h4><p>Instale na tela de início do celular e use também no computador, com tudo sincronizado.</p></div><div class="card"><span class="ic"><svg viewBox="0 0 24 24"><path d="M6 16V11a6 6 0 0 1 12 0v5l2 2H4zM10 21h4"/></svg></span><h4>Alertas no horário certo</h4><p>Lembretes de atendimentos, vacinas e tarefas do dia direto no seu celular.</p></div></div></section></div><div class="final"><h3>Pronto para organizar o seu plantel?</h3><p>Crie sua conta e comece a registrar seus atendimentos hoje mesmo.</p><div class="ctas" style="justify-content:center"><button type="button" class="bt cheio gr" data-lp="criar">Cadastre-se</button><button type="button" class="bt vazio gr" data-lp="entrar">Entrar</button></div></div><footer><span>© VetCamp · Prontuário veterinário</span><a href="privacidade.html" target="_blank" rel="noopener">Política de privacidade</a></footer></div><div class="acena" aria-hidden="true">
<div class="frase"><b>Menos caderno, mais controle no campo.</b><span>Pare de perder informação em anotações soltas, planilhas e mensagens. Com o VetCamp, cada animal tem a história completa na palma da mão.</span><ul><li><strong>Veterinário:</strong> chegue na propriedade sabendo todo o histórico, prescreva e já envie o orçamento.</li><li><strong>Haras e fazenda:</strong> vacinas, reprodução e o custo de cada animal sem depender de planilha.</li><li><strong>Para os dois:</strong> lembretes no celular para nenhuma data passar em branco.</li></ul></div></div><div class="ab"><button type="button" class="voltalp" id="a_voltalp">← Conhecer o VetCamp</button><div class="alogo" aria-hidden="true"></div><h1>VetCamp</h1><p class="sub">Prontuário veterinário · equinos, grandes e pequenos animais</p><div id="a_carr" role="status"><i aria-hidden="true"></i>Entrando na sua conta…</div>
   <div class="tabs2" role="group" aria-label="Entrar ou criar conta"><button type="button" data-m="entrar" aria-pressed="true">Entrar</button><button type="button" data-m="criar" aria-pressed="false">Criar conta</button></div>
   <div class="msg" id="a_msg" role="status"></div>
   
   
   <form id="a_form" novalidate>
    <label id="l_nome" hidden>Seu nome<input id="a_nome" autocomplete="name" placeholder="Como quer ser chamado(a)"></label>
    <label>E-mail<input id="a_email" type="email" autocomplete="email" inputmode="email" required></label>
    <label id="l_senha">Senha<input id="a_senha" type="password" autocomplete="current-password" required minlength="6" maxlength="128"></label>
    <label id="l_senha2" hidden>Repita a senha<input id="a_senha2" type="password" autocomplete="new-password"></label>
    <button class="ok2" id="a_ok">Entrar</button>
    <button type="button" class="lnk" id="a_esq">Esqueci minha senha</button>
   </form>
   <div class="ou"><span>ou</span></div>
   <button type="button" class="gbtn" id="a_google"><svg viewBox="0 0 48 48" width="20" height="20" aria-hidden="true"><path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z"/><path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/><path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z"/><path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z"/></svg><span id="a_gtxt">Entrar com Google</span></button>
   <div class="volta" id="a_volta" hidden><img id="a_vfoto" alt=""><b id="a_vnome"></b><span id="a_vmail"></span><button type="button" class="ok2" id="a_vbtn">Continuar</button><button type="button" class="lnk" id="a_outra">Usar outra conta</button></div><p class="rod">Ao criar conta você concorda com a <a href="privacidade.html" target="_blank" rel="noopener">política de privacidade</a>.</p></div>`;
  const montar=()=>{document.body.appendChild(tela);
    // usa a mesma logo da barra do app
    const lg=document.querySelector('.top .logo');if(lg){const m=getComputedStyle(lg).webkitMaskImage||getComputedStyle(lg).maskImage;if(m&&m!=='none')tela.style.setProperty('--logo',m)}};
  if(document.body)montar();else document.addEventListener('DOMContentLoaded',montar);
  const $=id=>document.getElementById(id);
  let modo='entrar',recuperar=false;
  const msg=(t,tipo='err')=>{const m=$('a_msg');m.textContent=t||'';m.className='msg'+(t?' on '+tipo:'')};
  const ERROS={'auth/invalid-email':'E-mail inválido. Confira se digitou certo.','auth/missing-email':'Digite seu e-mail.','auth/user-not-found':'E-mail ou senha incorretos.','auth/wrong-password':'E-mail ou senha incorretos.','auth/invalid-credential':'E-mail ou senha incorretos.','auth/invalid-login-credentials':'E-mail ou senha incorretos.',
    'auth/email-already-in-use':'Já existe uma conta com este e-mail. Toque em Entrar.','auth/weak-password':'A senha precisa ter pelo menos 6 caracteres.','auth/too-many-requests':'Muitas tentativas. Espere alguns minutos e tente de novo.','auth/network-request-failed':'Sem internet. Conecte e tente de novo.','auth/missing-password':'Digite sua senha.',
    'auth/operation-not-allowed':'O login com Google ainda não foi ligado no Firebase (Authentication › Método de login › Google).','auth/unauthorized-domain':'Este endereço não está liberado para login. Adicione-o em Authentication › Configurações › Domínios autorizados.',
    'auth/account-exists-with-different-credential':'Já existe uma conta com este e-mail usando senha. Entre com e-mail e senha.','auth/popup-blocked':'O navegador bloqueou a janela do Google. Tente de novo.','auth/web-storage-unsupported':'Este navegador está bloqueando o login. Desative a navegação privada e tente de novo.'};
  const traduz=e=>ERROS[e&&e.code]||('Não foi possível concluir ('+((e&&e.code)||'erro')+').');
  function setModo(m){modo=m;recuperar=false;
    tela.querySelectorAll('[data-m]').forEach(b=>b.setAttribute('aria-pressed',b.dataset.m===m));
    $('l_nome').hidden=$('l_senha2').hidden=m!=='criar';$('l_senha').hidden=false;$('a_esq').hidden=m!=='entrar';
    $('a_senha').autocomplete=m==='criar'?'new-password':'current-password';$('a_ok').textContent=m==='criar'?'Criar conta':'Entrar';$('a_gtxt').textContent=m==='criar'?'Criar conta com Google':'Entrar com Google';msg('')}
  tela.addEventListener('click',e=>{const b=e.target.closest('[data-m]');if(b)setModo(b.dataset.m)});
  // apresentação: aparece para quem ainda não tem conta lembrada neste aparelho
  const abrirLogin=m=>{tela.classList.remove('lp-on');setModo(m);tela.scrollTop=0;setTimeout(()=>{try{(m==='criar'?$('a_nome'):($('a_email').value?$('a_senha'):$('a_email'))).focus()}catch(e){}},50)};
  const abrirLp=()=>{tela.classList.add('lp-on');tela.scrollTop=0};
  tela.addEventListener('click',e=>{const b=e.target.closest('[data-lp]');if(b){abrirLogin(b.dataset.lp);return}
    if(e.target.closest('#a_voltalp'))abrirLp();
    const a=e.target.closest('.lp a[href^="#lp-"]');if(a){e.preventDefault();const t=document.getElementById(a.getAttribute('href').slice(1));if(t)tela.scrollTo({top:t.offsetTop-(a.hasAttribute('data-lptopo')?t.offsetTop:64),behavior:'smooth'})}});
  // cavalinho na barra da apresentação: anda da esquerda até "Entrar" conforme a página rola (e volta ao subir)
  let cavQ=0,cavX0=null;
  function cavalinho(){cavQ=0;if(!tela.classList.contains('lp-on'))return;
    const bar=tela.querySelector('.lpbar'),cav=tela.querySelector('.lpcav'),alvo=tela.querySelector('.lpbar [data-lp=entrar]');if(!bar||!cav||!alvo)return;
    const max=tela.scrollHeight-tela.clientHeight,p=max>0?Math.min(1,Math.max(0,tela.scrollTop/max)):0;
    const w=cav.offsetWidth,ini=-w,fim=alvo.offsetLeft-w-10,x=ini+(fim-ini)*p,frente=x+w;
    // indo para a direita olha para a direita; voltando (rolando para cima) vira para a esquerda
    if(cavX0!==null&&Math.abs(x-cavX0)>.5)cav.dataset.dir=x>cavX0?1:-1;cavX0=x;
    const q=Math.floor(Math.abs(x)/14)%9;cav.style.backgroundPosition=(q*12.5)+'% 0';
    cav.style.opacity=p>0?1:0;cav.style.transform=`translateX(${x}px) scaleX(${cav.dataset.dir||1})`;
    bar.querySelectorAll('.lpsome').forEach(el=>{const r=el.getBoundingClientRect(),b0=bar.getBoundingClientRect(),l=r.left-b0.left;
      const o=r.width?1-Math.min(1,Math.max(0,(frente-l)/r.width)):1;el.style.opacity=o;el.style.visibility=o<.02?'hidden':''});
  }
  // no computador a foto da esquerda fica parada (fixa); a rodinha do mouse em cima dela também rola o login
  tela.addEventListener('wheel',e=>{if(tela.classList.contains('lp-on')||!e.target.closest('.acena'))return;tela.scrollTop+=e.deltaMode===1?e.deltaY*16:e.deltaY;e.preventDefault()},{passive:false});
  tela.addEventListener('scroll',()=>{if(!cavQ)cavQ=requestAnimationFrame(cavalinho)},{passive:true});
  addEventListener('resize',()=>{if(!cavQ)cavQ=requestAnimationFrame(cavalinho)});
  const querLp=()=>{const l=lerL();return !(l&&l.email)};

  /* ---------- lembrar a conta neste aparelho ---------- */
  // Fica conectado; só pede login de novo depois de 4 dias sem abrir o VetCamp (e-mail e nome continuam salvos).
  const INATIVO=4*24*3600*1000,LK='vetcamp-lembrar';
  const lerL=()=>{try{return JSON.parse(localStorage.getItem(LK)||'null')}catch(e){return null}};
  const gravarL=o=>{try{if(o)localStorage.setItem(LK,JSON.stringify(o));else localStorage.removeItem(LK)}catch(e){}};
  const provDe=u=>(u.providerData||[]).some(p=>p&&p.providerId==='google.com')?'google':'senha';
  function lembrar(u){gravarL({uid:u.uid,email:u.email||'',nome:u.displayName||'',foto:u.photoURL||'',prov:provDe(u),verif:!!u.emailVerified,ultimo:Date.now()})}
  const tocarUso=()=>{const l=lerL();if(l&&usuario&&l.uid===usuario.uid&&l.ultimo){l.ultimo=Date.now();gravarL(l)}};
  function mostrarVolta(){
    const l=lerL(),v=$('a_volta');if(!v)return;
    if(!l||!l.email){v.hidden=true;return}
    v.hidden=false;$('a_vnome').textContent='Olá de novo'+(l.nome?', '+l.nome.split(' ')[0]:'')+'!';$('a_vmail').textContent=l.email;
    const f=$('a_vfoto');if(l.foto&&/^https:/.test(l.foto)){f.src=l.foto;f.hidden=false}else f.hidden=true;
    $('a_vbtn').textContent=l.prov==='google'?'Continuar com Google':'Continuar';
    if(l.prov!=='google'){$('a_email').value=l.email}
  }
  const entrando=on=>tela.classList.toggle('entrando',!!on);
  // sessão rápida: quem entrou nos últimos 4 dias abre direto, sem ver a tela de login
  const L0=lerL(),rapida=!!(L0&&L0.uid&&L0.ultimo&&Date.now()-L0.ultimo<INATIVO&&configurado);
  let redir=false;try{redir=sessionStorage.getItem('vetcamp-redir')==='1';sessionStorage.removeItem('vetcamp-redir')}catch(e){}
  if(rapida)tela.hidden=true;else if(redir)entrando(true);else if(querLp())tela.classList.add('lp-on');

  /* ---------- Firebase ---------- */
  let auth=null,fs=null,storage=null;
  let resolverPronto;const pronto=new Promise(r=>resolverPronto=r);
  let usuario=null,appIniciado=false;
  if(rapida){usuario={uid:L0.uid,email:L0.email,displayName:L0.nome,photoURL:L0.foto||null,emailVerified:!!L0.verif,providerData:[{providerId:L0.prov==='google'?'google.com':'password'}],provisorio:true};appIniciado=true}

  function iniciar(){
    if(!configurado){msg('Configuração do Firebase pendente. Preencha o arquivo firebase-config.js.','inf');$('a_ok').disabled=true;return}
    // o login com Google passa por CFG.authDomain (vetcamp.web.app), liberado no Google Cloud
    firebase.initializeApp(CFG);
    if(CFG.appCheckKey&&firebase.appCheck&&!DEMO){try{firebase.appCheck().activate(new firebase.appCheck.ReCaptchaV3Provider(CFG.appCheckKey),true)}catch(e){}}
    auth=firebase.auth();fs=firebase.firestore();
    if(DEMO){auth.useEmulator('http://'+location.hostname+':9099',{disableWarnings:true});fs.useEmulator(location.hostname,8080)}
    fs.settings({ignoreUndefinedProperties:true,merge:true});
    if(!DEMO)fs.enablePersistence({synchronizeTabs:true}).catch(()=>{});
    if(CFG.storageBucket&&CFG.storage!==false&&firebase.storage){storage=firebase.storage();if(DEMO)storage.useEmulator(location.hostname,9199)}
    auth.languageCode='pt';
    if(rapida)resolverPronto(true); // abre já com a conta guardada; o Firebase confirma a sessão em seguida
    auth.getRedirectResult().catch(err=>{entrando(false);if(err&&err.code)msg(traduz(err))});
    auth.onAuthStateChanged(async u=>{
      const l=lerL();
      if(u&&l&&l.uid===u.uid&&l.ultimo&&Date.now()-l.ultimo>INATIVO){
        // mais de 4 dias sem usar: pede o login de novo, mas mantém e-mail e nome salvos
        l.ultimo=0;gravarL(l);await auth.signOut();return}
      if(u){
        const trocou=appIniciado&&usuario&&usuario.uid!==u.uid;
        usuario=u;lembrar(u);entrando(false);
        if(trocou||(appIniciado&&!tela.hidden&&tela.dataset.reabrir==='1')){location.reload();return}
        tela.hidden=true;barraVerificacao();appIniciado=true;resolverPronto(true)}
      else{
        usuario=null;entrando(false);
        if(appIniciado){tela.dataset.reabrir='1';const lv=lerL();if(lv){lv.ultimo=0;gravarL(lv)}}
        mostrarVolta();if(!appIniciado&&querLp()&&tela.dataset.reabrir!=='1')abrirLp();tela.hidden=false;if(!tela.classList.contains('lp-on'))setTimeout(()=>{try{($('a_email').value?$('a_senha'):$('a_email')).focus()}catch(e){}},50)}
    });
    addEventListener('visibilitychange',()=>{if(!document.hidden)tocarUso()});setInterval(tocarUso,600000);
  }
  const instalado=()=>matchMedia('(display-mode: standalone)').matches||navigator.standalone===true;
  const iosApp=()=>navigator.standalone===true||(instalado()&&/iPhone|iPad|iPod/.test(navigator.userAgent));
  async function entrarGoogle(dica){
    if(!auth)return;const b=$('a_google');b.disabled=true;msg('');
    const prov=new firebase.auth.GoogleAuthProvider();prov.setCustomParameters(dica?{login_hint:dica}:{prompt:'select_account'});
    const redirecionar=async()=>{try{sessionStorage.setItem('vetcamp-redir','1')}catch(e){}entrando(true);await auth.signInWithRedirect(prov)};
    try{
      if(iosApp())await redirecionar();
      else{await auth.signInWithPopup(prov);entrando(true)}
    }catch(err){
      if(err&&['auth/popup-blocked','auth/operation-not-supported-in-environment','auth/cancelled-popup-request'].includes(err.code)){try{await redirecionar();return}catch(e2){err=e2}}
      entrando(false);
      if(!err||!['auth/popup-closed-by-user','auth/cancelled-popup-request','auth/user-cancelled'].includes(err.code))msg(traduz(err));
    }finally{b.disabled=false}
  }
  document.addEventListener('click',e=>{
    if(!e.target.closest)return;
    if(e.target.closest('#a_google'))entrarGoogle();
    else if(e.target.closest('#a_vbtn')){const l=lerL();if(l&&l.prov==='google')entrarGoogle(l.email);else{$('a_email').value=(l&&l.email)||'';$('a_senha').focus()}}
    else if(e.target.closest('#a_outra')){gravarL(null);$('a_volta').hidden=true;$('a_email').value='';$('a_senha').value='';$('a_email').focus()}
  });
  let falhas=0,bloqueioAte=0;
  document.addEventListener('submit',async e=>{
    if(e.target.id!=='a_form')return;e.preventDefault();if(!auth)return;
    const email=$('a_email').value.trim(),senha=$('a_senha').value;
    const espera=Math.ceil((bloqueioAte-Date.now())/1000);if(espera>0){msg('Muitas tentativas. Aguarde '+espera+' s e tente de novo.');return}
    $('a_ok').disabled=true;msg('');const txtOk=$('a_ok').textContent;if(!recuperar)$('a_ok').textContent=modo==='criar'?'Criando conta…':'Entrando…';
    try{
      if(recuperar){await auth.sendPasswordResetEmail(email);msg('Enviamos um link para '+email+' criar uma nova senha. Confira também a caixa de spam.','inf');recuperar=false;$('l_senha').hidden=false;$('a_ok').textContent='Entrar'}
      else if(modo==='criar'){
        const nome=$('a_nome').value.trim();
        if(!nome){msg('Digite seu nome.');return}
        if(!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)){msg('E-mail inválido. Confira se digitou certo.');return}
        if(senha!==$('a_senha2').value){msg('As senhas não são iguais.');return}
        const fraca=/^(.)\1+$/.test(senha)||/^(?:0?123456789?0?|12345678|87654321|senha\d*|password\d*|qwerty\d*|abc12345|vetcamp\d*)$/i.test(senha)||senha.toLowerCase()===email.toLowerCase().split('@')[0];
        if(senha.length<8||fraca){msg(senha.length<8?'Use uma senha com pelo menos 8 caracteres.':'Essa senha é fácil de adivinhar. Misture letras e números.');return}
        const r=await auth.createUserWithEmailAndPassword(email,senha);
        await r.user.updateProfile({displayName:nome});
        lembrar(r.user);
        try{await r.user.sendEmailVerification()}catch(_){}
      }else await auth.signInWithEmailAndPassword(email,senha);
      if(!recuperar)entrando(true);
    }catch(err){msg(traduz(err));if(err&&/credential|password|user-not-found/.test(err.code||'')){falhas++;if(falhas>=5){bloqueioAte=Date.now()+30000*Math.min(4,falhas-4);msg('Muitas tentativas erradas. Aguarde '+Math.round((bloqueioAte-Date.now())/1000)+' s. Se esqueceu a senha, use "Esqueci minha senha".')}}}
    finally{$('a_ok').disabled=false;if($('a_ok').textContent.endsWith('…'))$('a_ok').textContent=txtOk}
  });
  document.addEventListener('click',e=>{if(e.target&&e.target.id==='a_esq'){recuperar=true;$('l_senha').hidden=true;$('a_ok').textContent='Enviar link para nova senha';msg('Digite seu e-mail e toque no botão. Você vai receber um link para criar uma nova senha.','inf')}});

  function barraVerificacao(){
    const velho=document.getElementById('verifbar');if(velho)velho.remove();
    if(!usuario||usuario.emailVerified||DEMO)return;
    const b=document.createElement('div');b.id='verifbar';b.innerHTML='<span>Confirme seu e-mail: enviamos um link para <b></b>.</span><button type="button" id="vb_re">Reenviar</button><button type="button" id="vb_ok">Já confirmei</button><button type="button" id="vb_x" aria-label="Fechar aviso">×</button>';
    b.querySelector('b').textContent=usuario.email;document.body.prepend(b);
    b.querySelector('#vb_re').onclick=async()=>{try{await usuario.sendEmailVerification();b.querySelector('span').textContent='Link reenviado. Confira também a caixa de spam.'}catch(e){b.querySelector('span').textContent=traduz(e)}};
    b.querySelector('#vb_ok').onclick=async()=>{await usuario.reload();usuario=auth.currentUser;if(usuario.emailVerified)b.remove();else b.querySelector('span').textContent='Ainda não confirmado. Abra o link do e-mail e toque aqui de novo.'};
    b.querySelector('#vb_x').onclick=()=>b.remove();
  }

  /* ---------- interface usada pelo VetCamp ---------- */
  const iniciais=n=>{const s=String(n||'?').trim().split(/\s+/);return((s[0]||'?')[0]+((s[1]||'')[0]||'')).toUpperCase()};
  const avatar=n=>'data:image/svg+xml;base64,'+btoa(unescape(encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64"><rect width="64" height="64" rx="32" fill="#965a27"/><text x="32" y="41" font-family="Arial" font-size="26" font-weight="700" fill="#fff" text-anchor="middle">${iniciais(n)}</text></svg>`)));
  const nomeDe=u=>u.displayName||String(u.email||'').split('@')[0];
  const userNs={
    me:async()=>({id:usuario.uid,name:nomeDe(usuario),email:usuario.email,avatarUrl:usuario.photoURL||avatar(nomeDe(usuario)),color:'#965a27'}),
    id:async()=>usuario.uid,isOwner:async()=>true,canEdit:async()=>true,can:async()=>true,
    profiles:async ids=>Object.fromEntries((ids||[]).map(i=>[i,{id:i,name:i===usuario.uid?nomeDe(usuario):'',isMe:i===usuario.uid}]))};
  const nomeArquivo=n=>String(n||'arquivo').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^\w .()-]/g,'-').replace(/\s+/g,' ').trim()||'arquivo';
  const downloadsNs={save:async({filename,data})=>{filename=nomeArquivo(filename);const blob=data instanceof Blob?data:new Blob([data]);const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=filename;a.rel='noopener';a.style.display='none';document.body.appendChild(a);a.click();setTimeout(()=>{a.remove();URL.revokeObjectURL(url)},60000);return{status:'saved'}}};
  const assetsNs=()=>storage&&{upload:async blob=>{const tipo=blob.type||'application/octet-stream';const ext=(tipo.split('/')[1]||'bin').replace(/[^a-z0-9]/gi,'').slice(0,5);
    const ref=storage.ref(`users/${usuario.uid}/arquivos/${Date.now().toString(36)}-${Math.random().toString(36).slice(2,8)}.${ext}`);
    const s=await ref.put(blob,{contentType:tipo});const url=await s.ref.getDownloadURL();return{id:url,url,sizeBytes:blob.size,contentType:tipo}}};
  function dictationNs(){
    const SR=window.SpeechRecognition||window.webkitSpeechRecognition;if(!SR)return null;
    let rec=null,cbs={state:[],final:[],partial:[]};const emit=(k,v)=>cbs[k].forEach(f=>{try{f(v)}catch(e){}});
    return{onState:f=>cbs.state.push(f),onFinal:f=>cbs.final.push(f),onPartial:f=>cbs.partial.push(f),
      start:()=>new Promise((ok,erro)=>{try{rec=new SR();rec.lang='pt-BR';rec.continuous=true;rec.interimResults=true;
        rec.onstart=()=>{emit('state',{state:'listening'});ok()};
        rec.onresult=ev=>{for(let i=ev.resultIndex;i<ev.results.length;i++){const t=ev.results[i][0].transcript;emit(ev.results[i].isFinal?'final':'partial',{text:t.trim()})}};
        rec.onerror=ev=>{if(ev.error==='not-allowed'){erro({code:'not_granted'})}};
        rec.onend=()=>emit('state',{state:'idle',reason:'stopped'});rec.start()}catch(e){erro({code:'unavailable'})}}),
      stop:async()=>{try{rec&&rec.stop()}catch(e){}}};
  }
  window.claude={use:async nome=>{
    if(!configurado)return null;await pronto;
    if(nome==='db')return fs;if(nome==='user')return userNs;if(nome==='downloads')return downloadsNs;
    if(nome==='assets')return assetsNs()||null;if(nome==='dictation')return dictationNs();return null}};

  window.SAMVET_AUTH={
    email:()=>usuario&&usuario.email,verificado:()=>!!(usuario&&(usuario.emailVerified||DEMO)),
    async sair(){
      if(!navigator.onLine&&!confirm2())return;
      try{await Promise.race([fs.waitForPendingWrites(),new Promise(r=>setTimeout(r,4000))])}catch(e){}
      const pfx='samvet-'+usuario.uid.replace(/[^A-Za-z0-9]/g,'').slice(-10)+'-';
      try{Object.keys(localStorage).filter(k=>k.startsWith(pfx)).forEach(k=>localStorage.removeItem(k))}catch(e){}
      const lv=lerL();if(lv){lv.ultimo=0;gravarL(lv)}
      await auth.signOut();try{await fs.terminate();await fs.clearPersistence()}catch(e){}location.reload()},
    async trocarSenha(){try{await auth.sendPasswordResetEmail(usuario.email);return 'Enviamos um link para '+usuario.email+' criar uma nova senha.'}catch(e){return traduz(e)}},
    async reenviar(){try{await usuario.sendEmailVerification();return 'Link de confirmação reenviado para '+usuario.email+'.'}catch(e){return traduz(e)}}};
  function confirm2(){const t=document.getElementById('toast');if(t){t.textContent='Você está sem internet. Conecte antes de sair, para não perder o que ainda não foi enviado.';t.classList.add('on');setTimeout(()=>t.classList.remove('on'),4000)}return false}

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>{setModo('entrar');iniciar()});else{setModo('entrar');iniciar()}

  /* Android: guarda o convite de instalação para o botão "Instalar agora" da aba Conta */
  addEventListener('beforeinstallprompt',e=>{e.preventDefault();window.__instalarApp=e});
  addEventListener('appinstalled',()=>{window.__instalarApp=null});

  /* aplicativo instalável (funciona aberto mesmo com sinal fraco) */
  if('serviceWorker' in navigator&&location.protocol==='https:')addEventListener('load',()=>navigator.serviceWorker.register('sw.js').catch(()=>{}));
})();

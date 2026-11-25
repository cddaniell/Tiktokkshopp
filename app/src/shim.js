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
  #auth .ab{width:min(420px,100%);display:grid;gap:14px}
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
  #auth .rod{font-size:12px;color:var(--mute,#76583d);text-align:center}#auth .rod a{color:inherit}
  #verifbar{position:sticky;top:0;z-index:6;background:var(--note,#f3e1bf);color:var(--ink,#33210f);font-size:14px;padding:8px max(16px,env(safe-area-inset-left,0px));display:flex;gap:10px;align-items:center;justify-content:center;flex-wrap:wrap}
  #verifbar button{border:1px solid var(--line,#d8c1a2);background:var(--card,#fbf6ef);border-radius:8px;min-height:34px;padding:0 10px;font-weight:700;color:inherit}`;
  const st=document.createElement('style');st.textContent=css;document.head.appendChild(st);

  const tela=document.createElement('div');tela.id='auth';tela.setAttribute('role','dialog');tela.setAttribute('aria-label','Entrar no VetCamp');
  tela.innerHTML=`<div class="ab"><div class="alogo" aria-hidden="true"></div><h1>VetCamp</h1><p class="sub">Prontuário veterinário · equinos, grandes e pequenos animais</p>
   <div class="tabs2" role="group" aria-label="Entrar ou criar conta"><button type="button" data-m="entrar" aria-pressed="true">Entrar</button><button type="button" data-m="criar" aria-pressed="false">Criar conta</button></div>
   <div class="msg" id="a_msg" role="status"></div>
   <button type="button" class="gbtn" id="a_google"><svg viewBox="0 0 48 48" width="20" height="20" aria-hidden="true"><path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z"/><path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/><path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z"/><path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z"/></svg><span id="a_gtxt">Entrar com Google</span></button>
   <div class="ou"><span>ou com e-mail e senha</span></div>
   <form id="a_form" novalidate>
    <label id="l_nome" hidden>Seu nome<input id="a_nome" autocomplete="name" placeholder="Como quer ser chamado(a)"></label>
    <label>E-mail<input id="a_email" type="email" autocomplete="email" inputmode="email" required></label>
    <label id="l_senha">Senha<input id="a_senha" type="password" autocomplete="current-password" required minlength="6"></label>
    <label id="l_senha2" hidden>Repita a senha<input id="a_senha2" type="password" autocomplete="new-password"></label>
    <button class="ok2" id="a_ok">Entrar</button>
    <button type="button" class="lnk" id="a_esq">Esqueci minha senha</button>
   </form>
   <p class="rod">Ao criar conta você concorda com a <a href="privacidade.html" target="_blank" rel="noopener">política de privacidade</a>.</p></div>`;
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

  /* ---------- Firebase ---------- */
  let auth=null,fs=null,storage=null;
  let resolverPronto;const pronto=new Promise(r=>resolverPronto=r);
  let usuario=null;

  function iniciar(){
    if(!configurado){msg('Configuração do Firebase pendente. Preencha o arquivo firebase-config.js.','inf');$('a_ok').disabled=true;return}
    // o login com Google passa por CFG.authDomain (vetcamp.web.app), liberado no Google Cloud
    firebase.initializeApp(CFG);
    auth=firebase.auth();fs=firebase.firestore();
    if(DEMO){auth.useEmulator('http://'+location.hostname+':9099',{disableWarnings:true});fs.useEmulator(location.hostname,8080)}
    fs.settings({ignoreUndefinedProperties:true,merge:true});
    if(!DEMO)fs.enablePersistence({synchronizeTabs:true}).catch(()=>{});
    if(CFG.storageBucket&&CFG.storage!==false&&firebase.storage){storage=firebase.storage();if(DEMO)storage.useEmulator(location.hostname,9199)}
    auth.languageCode='pt';
    auth.getRedirectResult().catch(err=>{if(err&&err.code)msg(traduz(err))});
    auth.onAuthStateChanged(u=>{
      if(u){usuario=u;tela.hidden=true;barraVerificacao();resolverPronto(true)}
      else{usuario=null;tela.hidden=false;setTimeout(()=>{try{$('a_email').focus()}catch(e){}},50)}
    });
  }
  const instalado=()=>matchMedia('(display-mode: standalone)').matches||navigator.standalone===true;
  document.addEventListener('click',async e=>{
    if(!e.target.closest||!e.target.closest('#a_google')||!auth)return;
    const b=$('a_google');b.disabled=true;msg('');
    const prov=new firebase.auth.GoogleAuthProvider();prov.setCustomParameters({prompt:'select_account'});
    try{
      if(instalado())await auth.signInWithRedirect(prov);
      else await auth.signInWithPopup(prov);
    }catch(err){
      if(err&&['auth/popup-blocked','auth/operation-not-supported-in-environment','auth/cancelled-popup-request'].includes(err.code)){try{await auth.signInWithRedirect(prov);return}catch(e2){err=e2}}
      if(!err||!['auth/popup-closed-by-user','auth/cancelled-popup-request','auth/user-cancelled'].includes(err.code))msg(traduz(err));
    }finally{b.disabled=false}
  });
  document.addEventListener('submit',async e=>{
    if(e.target.id!=='a_form')return;e.preventDefault();if(!auth)return;
    const email=$('a_email').value.trim(),senha=$('a_senha').value;
    $('a_ok').disabled=true;msg('');
    try{
      if(recuperar){await auth.sendPasswordResetEmail(email);msg('Enviamos um link para '+email+' criar uma nova senha. Confira também a caixa de spam.','inf');recuperar=false;$('l_senha').hidden=false;$('a_ok').textContent='Entrar'}
      else if(modo==='criar'){
        const nome=$('a_nome').value.trim();
        if(!nome){msg('Digite seu nome.');return}
        if(senha!==$('a_senha2').value){msg('As senhas não são iguais.');return}
        const r=await auth.createUserWithEmailAndPassword(email,senha);
        await r.user.updateProfile({displayName:nome});
        try{await r.user.sendEmailVerification()}catch(_){}
      }else await auth.signInWithEmailAndPassword(email,senha);
    }catch(err){msg(traduz(err))}
    finally{$('a_ok').disabled=false}
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
      await auth.signOut();try{await fs.terminate();await fs.clearPersistence()}catch(e){}location.reload()},
    async trocarSenha(){try{await auth.sendPasswordResetEmail(usuario.email);return 'Enviamos um link para '+usuario.email+' criar uma nova senha.'}catch(e){return traduz(e)}},
    async reenviar(){try{await usuario.sendEmailVerification();return 'Link de confirmação reenviado para '+usuario.email+'.'}catch(e){return traduz(e)}}};
  function confirm2(){const t=document.getElementById('toast');if(t){t.textContent='Você está sem internet. Conecte antes de sair, para não perder o que ainda não foi enviado.';t.classList.add('on');setTimeout(()=>t.classList.remove('on'),4000)}return false}

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>{setModo('entrar');iniciar()});else{setModo('entrar');iniciar()}

  /* aplicativo instalável (funciona aberto mesmo com sinal fraco) */
  if('serviceWorker' in navigator&&location.protocol==='https:')addEventListener('load',()=>navigator.serviceWorker.register('sw.js').catch(()=>{}));
})();

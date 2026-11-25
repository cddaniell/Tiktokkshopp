// VetCamp: e-mail de boas-vindas sempre que uma conta nova é criada (e-mail/senha ou Google).
// Envio pelo Brevo (plano gratuito: 300 e-mails/dia). Precisa do plano Blaze no Firebase.
// Configuração (arquivo .env gerado na publicação, nunca no repositório):
//   BREVO_API_KEY    chave da API do Brevo
//   EMAIL_REMETENTE  e-mail remetente verificado no Brevo (ex.: contato@seudominio.com.br)
//   SITE_URL         endereço do site (padrão https://vetcamp.web.app)
const functions = require('firebase-functions/v1');
const admin = require('firebase-admin');
admin.initializeApp();

const esc = s => String(s || '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const primeiroNome = (nome, email) => {
  const n = String(nome || '').trim() || String(email || '').split('@')[0];
  return n.split(/\s+/)[0].slice(0, 60);
};

function montarEmail(nome, site) {
  const n = esc(nome);
  const assunto = `Parabéns, ${nome}! Sua conta no VetCamp está pronta`;
  const html = `<!doctype html><html lang="pt-BR"><body style="margin:0;background:#f4f1ea;font-family:Arial,Helvetica,sans-serif;color:#2b2b2b">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f4f1ea;padding:24px 12px"><tr><td align="center">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border-radius:14px;overflow:hidden">
<tr><td style="background:#3d5a3a;color:#ffffff;padding:22px 26px;font-size:22px;font-weight:bold">VetCamp</td></tr>
<tr><td style="padding:26px">
<h1 style="margin:0 0 12px;font-size:22px;color:#3d5a3a">Parabéns, ${n}! 🎉</h1>
<p style="margin:0 0 14px;font-size:16px;line-height:1.5">Sua conta no <b>VetCamp</b> foi criada com sucesso. Seja muito bem-vindo(a)!</p>
<p style="margin:0 0 8px;font-size:16px;line-height:1.5">Para começar:</p>
<ol style="margin:0 0 18px;padding-left:20px;font-size:15px;line-height:1.6">
<li>Cadastre seu primeiro paciente em <b>+ Paciente</b>.</li>
<li>Em <b>Conta</b>, preencha os dados da clínica, seu CRMV e sua assinatura.</li>
<li>No celular, coloque o VetCamp na tela inicial para abrir como aplicativo.</li>
<li>Trabalha em equipe? Em <b>Conta › Equipe e clínica</b>, crie sua clínica e convide a equipe.</li>
</ol>
<p style="margin:0 0 22px" align="center"><a href="${esc(site)}" style="display:inline-block;background:#3d5a3a;color:#ffffff;text-decoration:none;padding:12px 26px;border-radius:999px;font-weight:bold;font-size:16px">Abrir o VetCamp</a></p>
<p style="margin:0;font-size:13px;color:#777;line-height:1.5">Você recebeu este e-mail porque criou uma conta no VetCamp com este endereço. Se não foi você, ignore esta mensagem.</p>
</td></tr></table></td></tr></table></body></html>`;
  const texto = `Parabéns, ${nome}!\n\nSua conta no VetCamp foi criada com sucesso. Seja muito bem-vindo(a)!\n\nPara começar:\n1. Cadastre seu primeiro paciente em "+ Paciente".\n2. Em Conta, preencha os dados da clínica, seu CRMV e sua assinatura.\n3. No celular, coloque o VetCamp na tela inicial.\n4. Trabalha em equipe? Em Conta › Equipe e clínica, crie sua clínica e convide a equipe.\n\nAbrir o VetCamp: ${site}\n`;
  return { assunto, html, texto };
}

async function enviarBoasVindas(user, deps = {}) {
  const env = deps.env || process.env;
  const fetchFn = deps.fetch || fetch;
  const esperar = deps.esperar || (ms => new Promise(r => setTimeout(r, ms)));
  const buscar = deps.buscarUsuario || (uid => admin.auth().getUser(uid));
  if (!env.BREVO_API_KEY || !env.EMAIL_REMETENTE) { console.log('Boas-vindas: Brevo não configurado'); return 'sem-config'; }
  if (!user || !user.email) return 'sem-email';
  // no cadastro por e-mail o nome é gravado logo depois da criação da conta: espera um pouco e relê
  let nome = user.displayName;
  if (!nome) { await esperar(6000); try { nome = (await buscar(user.uid)).displayName; } catch (e) { /* segue com o e-mail */ } }
  const p = primeiroNome(nome, user.email);
  const site = env.SITE_URL || 'https://vetcamp.web.app';
  const m = montarEmail(p, site);
  const r = await fetchFn(env.BREVO_URL || 'https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: { 'api-key': env.BREVO_API_KEY, 'content-type': 'application/json', accept: 'application/json' },
    body: JSON.stringify({
      sender: { name: 'VetCamp', email: env.EMAIL_REMETENTE },
      to: [{ email: user.email, name: String(nome || p).slice(0, 120) }],
      subject: m.assunto, htmlContent: m.html, textContent: m.texto, tags: ['boas-vindas'],
    }),
  });
  if (!r.ok) { const t = await r.text().catch(() => ''); console.error('Boas-vindas: falha no envio', r.status, t.slice(0, 300)); return 'falhou'; }
  return 'enviado';
}

exports.boasVindas = functions.region('southamerica-east1').runWith({ maxInstances: 5, timeoutSeconds: 60 })
  .auth.user().onCreate(user => enviarBoasVindas(user));
exports._teste = { montarEmail, enviarBoasVindas, primeiroNome };

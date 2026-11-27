// VetCamp: robô de notificações. Roda de hora em hora (GitHub Actions) e manda, no horário que cada pessoa escolheu,
// os lembretes do dia ou, quando não há nada, uma dica dia sim, dia não. Funciona com o app fechado (Firebase Cloud Messaging).
// A agenda de cada conta fica em notif/<conta> e é escrita pelo próprio app.
// SIMULAR=1 não envia nada: só mostra o que mandaria (para testes).
import { initializeApp, applicationDefault } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getMessaging } from 'firebase-admin/messaging';

const SIMULAR = process.env.SIMULAR === '1';
const AGORA = process.env.AGORA ? new Date(process.env.AGORA) : new Date();
const MSG = {
  vet: ['Prepare-se para o próximo atendimento: confira vacinas, vermífugos e o kit de campo.', 'Que tal revisar as fichas dos animais internados e as medicações do turno?', 'Dica: mande o resumo do atendimento ao tutor pelo WhatsApp. O cliente adora.', 'Revise os retornos da semana e confirme os horários com os clientes.', 'Lance os valores dos atendimentos de ontem para o caixa ficar em dia.', 'Tem AIE ou mormo vencendo? Confira a Agenda antes da próxima visita.', 'Faça um backup do VetCamp: Conta › Backup.', 'Confira o estoque: nada pior que faltar medicamento no campo.'],
  prop: ['Hora de conferir o feno e a ração: quantos dias ainda duram?', 'Prepare-se: confira as vacinas e os vermífugos do plantel.', 'Que tal pesar os animais e acompanhar o ganho de peso?', 'Revise as tarefas do tratador para hoje.', 'Confira se as faturas e pensões do mês já foram cobradas.', 'Tire uma foto atualizada dos seus cavalos para a ficha.', 'Vai viajar com algum animal? Confira a validade do AIE e do mormo.'],
};
// data e hora locais da pessoa
function local(tz) {
  const f = new Intl.DateTimeFormat('en-CA', { timeZone: tz || 'America/Sao_Paulo', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', hourCycle: 'h23' });
  const p = Object.fromEntries(f.formatToParts(AGORA).map(x => [x.type, x.value]));
  return { dia: `${p.year}-${p.month}-${p.day}`, hora: +p.hour };
}
const ontemDe = d => new Date(Date.parse(d + 'T12:00:00Z') - 864e5).toISOString().slice(0, 10);

export function decidir(n) {
  if (!n || !n.on || !Array.isArray(n.tokens) || !n.tokens.length) return null;
  let tz = n.tz; try { new Intl.DateTimeFormat('en', { timeZone: tz }); } catch { tz = 'America/Sao_Paulo'; }
  const { dia, hora } = local(tz), env = n.enviado || {};
  if (hora < (+n.hora || 7) || env.dia === dia) return null;
  const its = (n.dia !== false && n.porDia && Array.isArray(n.porDia[dia])) ? n.porDia[dia].filter(x => typeof x === 'string').slice(0, 6) : [];
  if (its.length) return { dia, enviado: { ...env, dia }, title: `VetCamp · ${its.length} para hoje`, body: its.slice(0, 4).join('\n') + (its.length > 4 ? `\n+ ${its.length - 4}` : ''), tag: 'vetcamp-dia' };
  if (n.motiv !== false && env.motiv !== ontemDe(dia) && env.motiv !== dia) {
    const l = MSG[n.perfil === 'prop' ? 'prop' : 'vet'], i = (+env.i || 0) % l.length;
    return { dia, enviado: { ...env, dia, motiv: dia, i: i + 1 }, title: 'VetCamp', body: l[i], tag: 'vetcamp-motiv' };
  }
  return { dia, enviado: { ...env, dia }, nada: true };
}

async function main() {
  initializeApp({ credential: applicationDefault() });
  const db = getFirestore(), fcm = getMessaging();
  const snap = await db.collection('notif').where('on', '==', true).get();
  let enviados = 0, contas = 0;
  for (const doc of snap.docs) {
    const n = doc.data(), d = decidir(n);
    if (!d) continue; contas++;
    const upd = { enviado: d.enviado };
    if (!d.nada) {
      const tokens = n.tokens.map(t => t && t.t).filter(Boolean);
      if (SIMULAR) { console.log(`[simulado] ${doc.id.slice(0, 6)}… → ${d.title}: ${d.body.replace(/\n/g, ' | ')}`); enviados++; }
      else {
        const r = await fcm.sendEachForMulticast({ tokens, data: { title: d.title, body: d.body, tag: d.tag, url: 'https://vetcamp.web.app/' }, webpush: { headers: { Urgency: 'high', TTL: '43200' } } });
        enviados += r.successCount;
        // tira os aparelhos que não existem mais
        const ruins = r.responses.map((x, i) => (!x.success && /registration-token-not-registered|invalid-registration-token|invalid-argument/.test(x.error?.code || '')) ? tokens[i] : null).filter(Boolean);
        if (ruins.length) upd.tokens = n.tokens.filter(t => !ruins.includes(t.t));
      }
    }
    await doc.ref.set(upd, { merge: true });
  }
  console.log(`Contas no horário: ${contas} · avisos enviados: ${enviados}${SIMULAR ? ' (simulado)' : ''}`);
}
if (process.argv[1] && process.argv[1].endsWith('notificar.mjs')) main().catch(e => { console.error('Falha no robô de notificações:', e.message); process.exit(1); });

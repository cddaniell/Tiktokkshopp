# VetCamp · site próprio

O VetCamp roda em dois lugares, com o **mesmo código** (`vetcamp.html`):

| Onde | Login | Endereço |
|---|---|---|
| Dentro do Claude (artifact) | conta Claude | https://claude.ai/artifact/D2CL9WbAYCemogA4goCkSN |
| Site próprio | e-mail e senha do próprio VetCamp | **https://vetcamp.web.app** (projeto Firebase `vetcamp-1704e`; o endereço antigo vetcamp-1704e.web.app continua funcionando) |

O script `scripts/build_app.py` gera o site (`app/public/index.html`) a partir do `vetcamp.html`.
Toda mudança feita no VetCamp vale para os dois.

## Configurar uma vez (cerca de 20 minutos)

### 1. Criar o projeto no Firebase
1. Acesse https://console.firebase.google.com e entre com sua conta Google.
2. **Adicionar projeto** → nome `vetcamp` → pode desligar o Google Analytics → **Criar projeto**.

### 2. Ligar o login por e-mail
1. No menu, **Criação › Authentication › Vamos começar**.
2. Aba **Método de login** → **E-mail/senha** → **Ativar** → **Salvar**.
3. (Opcional) Aba **Modelos** → mude o idioma dos e-mails para **Português (Brasil)**.

### 2b. (Opcional) Login com Google
1. **Authentication › Método de login › Adicionar novo provedor › Google**.
2. Ligue **Ativar**, escolha o **e-mail de suporte** (o seu) e **Salvar**.
Na tela inicial do VetCamp aparece o botão **Entrar com Google**.

### 3. Criar o banco de dados
1. **Criação › Firestore Database › Criar banco de dados**.
2. Local: **southamerica-east1 (São Paulo)**. Modo: **produção**.

### 4. Registrar o site e copiar a configuração
1. Engrenagem **⚙ › Configurações do projeto** → em "Seus apps", toque no ícone **</>** (Web).
2. Apelido `vetcamp` → marque **Também configurar o Firebase Hosting** → **Registrar app**.
3. Copie o bloco `firebaseConfig` e **mande para o Claude**. Ele preenche o arquivo `app/public/firebase-config.js`.
   (Esses valores não são senhas: são feitos para ficar no site.)

### 5. Deixar o GitHub publicar sozinho
1. **⚙ › Configurações do projeto › Contas de serviço** → **Gerar nova chave privada** → baixa um arquivo `.json`.
   Guarde com cuidado: esse arquivo **é** uma senha.
2. No GitHub, abra o repositório → **Settings › Secrets and variables › Actions › New repository secret**:
   - `FIREBASE_SERVICE_ACCOUNT` → cole **todo** o conteúdo do arquivo `.json`.
   - `FIREBASE_PROJECT_ID` → o ID do projeto (aparece em Configurações do projeto, ex.: `vetcamp-1a2b3`).
3. Dê permissão à chave: abra https://console.cloud.google.com/iam-admin/iam?project=SEU-PROJETO,
   edite (✏️) a conta `firebase-adminsdk-...` e adicione os papéis **Administrador do Firebase**
   e **Usuário da conta de serviço**. Sem isso a publicação falha com "does not have permission".
4. Pronto: a cada mudança, o GitHub publica o site sozinho (aba **Actions** mostra o andamento).
   Também dá para publicar na mão em **Actions › Publicar VetCamp › Run workflow**.

### 6. (Opcional) Anexos de arquivos
Fotos de perfil e dos animais já funcionam. Para anexar PDF e raio-X:
1. Mude o projeto para o plano **Blaze** (pede cartão; no volume de uma clínica o custo costuma ser zero ou centavos).
2. **Criação › Storage › Vamos começar** (local São Paulo).
3. Peça ao Claude para ligar `storage: true` no `firebase-config.js`.

### 7. (Opcional) Seu domínio
1. Compre o domínio (ex.: `vetcamp.com.br` no https://registro.br).
2. Firebase → **Hosting › Adicionar domínio personalizado** → siga as instruções (copiar 2 registros para o registro.br).
3. Em **Authentication › Configurações › Domínios autorizados**, confira se o domínio aparece.

## Passar os dados do VetCamp do Claude para o site
1. No VetCamp do Claude: **Conta › Baixar backup**.
2. No site novo: crie a conta, vá em **Conta › Importar backup** e escolha o arquivo.
Cada pessoa faz isso com a própria conta.

## Clínica com equipe (só no site próprio)
Cada pessoa tem o **espaço pessoal** (só dela) e pode participar de uma ou mais **clínicas**. A troca é feita em **Conta › Equipe e clínica**.
- **Criar clínica:** quem cria vira **Dono** e pode atender como veterinário(a). Pode copiar os dados pessoais para a clínica; os pessoais continuam guardados.
- **Convidar:** o dono digita o e-mail e escolhe o papel. Depois avisa a pessoa pelo botão de WhatsApp ou de e-mail. A pessoa entra no site com aquele e-mail (confirmado) e toca em **Aceitar**.
- **Papéis:**

| Papel | Pode |
|---|---|
| Dono | Tudo: atende, convida e remove pessoas, altera dados da clínica, preços e modelos, vê o caixa |
| Veterinário(a) | Prontuário completo, receitas e documentos com o **próprio** nome, CRMV e assinatura, agenda e estoque. Vê o caixa só se o dono liberar |
| Estagiário(a) | Cadastra animais e clientes, registra consultas, evolução e exames, aplica doses já prescritas. Não prescreve, não emite documentos e não vê valores |
| Financeiro | Caixa, cobranças, Pix, despesas, orçamentos e relatórios. Vê as fichas sem alterar o prontuário |

- **Agenda:** cada agendamento tem o veterinário responsável, com o filtro "Só a minha agenda".
- **Relatórios:** tabela "Por veterinário(a)" com consultas, faturado e recebido.
- **Permissões conferidas no servidor:** as regras do banco (`firestore.rules`) recusam o que o papel não permite, mesmo que alguém tente fora do app.
- **Haras atendido por clínicas diferentes:** cada clínica tem os próprios dados. Entre clínicas, compartilhe por PDF (ficha, carteira de sanidade).
- Dentro do Claude (artifact) cada pessoa continua com o próprio VetCamp; a equipe funciona no site.

## Como as contas são protegidas
- Cada pessoa só lê e grava os próprios dados; na clínica, só os membros acessam, conforme o papel (`firestore.rules` e `storage.rules`).
- Senhas ficam com o serviço de login do Google, nunca no banco.
- A página `privacidade.html` é um modelo de política de privacidade (LGPD): preencha os campos entre colchetes.

## Testar no computador (para desenvolvedores)
```
python3 scripts/build_app.py
npx firebase-tools emulators:start --project demo-samvet --only auth,firestore,storage,hosting
```
Com um `firebase-config.js` cujo `projectId` comece com `demo-`, o site usa os simuladores locais.

## Situação
- Projeto Firebase: `vetcamp-1704e`
- Segredos do GitHub (`FIREBASE_SERVICE_ACCOUNT`, `FIREBASE_PROJECT_ID`) cadastrados em 25/11/2026.

## Segurança e proteção contra sobrecarga
Já ativo no site (gratuito):
- **Hospedagem do Firebase atrás da rede do Google**, que absorve picos de acesso e ataques de negação de serviço (DDoS) na entrada.
- **Cabeçalhos de segurança** (`firebase.json`): política de conteúdo (CSP) que bloqueia scripts de sites estranhos, proteção contra o site ser embutido em páginas falsas, HTTPS obrigatório (HSTS), `nosniff`, `Referrer-Policy` e `Permissions-Policy`.
- **Banco (`firestore.rules`)**: cada conta só acessa os próprios dados, só nas coleções que o app usa, com limite de campos por registro; o resto fica fechado.
- **Arquivos (`storage.rules`)**: só imagem ou PDF, até 20 MB, só na pasta da própria conta.
- **No app**: gravações seguidas do mesmo registro viram uma só, proteção contra clique duplo, tela redesenhada em lote, lista de pacientes em páginas de 80, pausa progressiva após 5 senhas erradas, limites de tamanho em anexos e backups.

## O que depende de você (gratuito, só configurar)
1. **Alerta de orçamento no Google Cloud** (recomendado): https://console.cloud.google.com/billing → Orçamentos e alertas → crie um orçamento de, por exemplo, R$ 20 com alerta por e-mail. Se algo estranho gerar uso, você fica sabendo na hora.
2. **Proteção contra enumeração de e-mail**: Firebase › Authentication › Configurações › marque *Proteção contra enumeração de e-mails*.
3. **App Check (reCAPTCHA v3)**: confere que quem acessa o banco é o VetCamp de verdade e não um robô.
   - Crie a chave em https://www.google.com/recaptcha/admin (tipo reCAPTCHA v3, domínio `vetcamp.web.app`).
   - Firebase › App Check › registre o app da Web com essa chave.
   - Mande a **chave do site** (a pública) para o Claude colocar em `appCheckKey`. Depois de 1 a 2 dias sem erros, ligue a **aplicação obrigatória** para Firestore e Storage no App Check.
4. **Monitor de disponibilidade** (avisa se o site cair): UptimeRobot (https://uptimerobot.com) ou Better Stack têm plano gratuito. Cadastre `https://vetcamp.web.app`. Confira nos termos se o plano gratuito permite uso comercial.

## O que é pago (para você decidir)
- **Plano Blaze do Firebase** (paga só o que passar do gratuito; pede cartão): necessário para anexos de PDF e raio-X no Storage.
- **Domínio próprio** (ex.: `vetcamp.com.br`, cerca de R$ 40/ano no registro.br).
- **WhatsApp automático** (lembretes enviados sozinhos): exige a API oficial do WhatsApp Business, cobrada por conversa.
- **Monitor de erros** como o Sentry: tem plano gratuito limitado; os pagos começam por volta de US$ 26/mês.
- **Lojas**: Google Play (taxa única de US$ 25) e App Store (US$ 99/ano).
- **Planos pagos do VetCamp (cobrar dos usuários)**: precisa de plano Blaze, de um meio de pagamento (ex.: Mercado Pago, Stripe ou Asaas) e de CNPJ. Pode ser feito depois: a separação por clínica e por papel já está pronta para limitar recursos por plano.
- **E-mail de convite enviado sozinho**: hoje o dono avisa pelo WhatsApp ou pelo próprio e-mail. O envio automático precisa de Blaze e de um serviço de e-mail (ex.: a extensão "Trigger Email" do Firebase com SendGrid ou Brevo).

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

## Como as contas são protegidas
- Cada pessoa só lê e grava os próprios dados (`firestore.rules` e `storage.rules`).
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

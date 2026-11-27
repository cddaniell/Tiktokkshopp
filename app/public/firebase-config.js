/* Configuração do Firebase do VetCamp.
   Cole aqui os valores do Console do Firebase:
   Configurações do projeto › Seus apps › App da Web › Configuração do SDK (opção "Config").
   Estes valores não são senhas: são feitos para ficar no site. A proteção dos dados
   vem das regras de segurança (firestore.rules e storage.rules). */
window.SAMVET_FIREBASE = {
  apiKey: "AIzaSyDDFXIyk98wt5riMolK_2yDl4UBnnV7y3k",
  authDomain: "vetcamp.web.app",
  projectId: "vetcamp-1704e",
  storageBucket: "vetcamp-1704e.firebasestorage.app",
  messagingSenderId: "236606054255",
  appId: "1:236606054255:web:3c636c2e721cb249eb529a",
  // Anexos (PDF, raio-X) usam o Storage, que exige o plano Blaze no Firebase.
  // Se ainda não ativou, deixe false: o resto do VetCamp funciona normalmente.
  storage: false,
  // Proteção extra (App Check): cole aqui a "chave do site" do reCAPTCHA v3 depois de criar
  // em https://www.google.com/recaptcha/admin e registrar em Firebase › App Check. Vazio = desligado.
  appCheckKey: "",
  // Notificações com o app fechado (celular e computador): cole a "chave pública" (par de chaves)
  // de Firebase › Configurações do projeto › Cloud Messaging › Certificados push da Web. Vazio = desligado.
  vapidKey: "BAgjsWmWGyBuOhQiTZe8eOyoZwlZjCK-yH-_jzWGazCakBpLYXHTebJckxM8vH8scY7SjesMORHEl94QzQCY_Dg"
};

/* Configuração do Firebase do VetCamp.
   Cole aqui os valores do Console do Firebase:
   Configurações do projeto › Seus apps › App da Web › Configuração do SDK (opção "Config").
   Estes valores não são senhas: são feitos para ficar no site. A proteção dos dados
   vem das regras de segurança (firestore.rules e storage.rules). */
window.SAMVET_FIREBASE = {
  apiKey: "AIzaSyBG1GBaK-nsNw9gdUNYOkx2QH35qWKsKV0",
  authDomain: "vetcamp-47e18.firebaseapp.com",
  projectId: "vetcamp-47e18",
  storageBucket: "vetcamp-47e18.firebasestorage.app",
  messagingSenderId: "92286542877",
  appId: "1:92286542877:web:f464441e03a8e7e47252f4",
  // Anexos (PDF, raio-X) usam o Storage, que exige o plano Blaze no Firebase.
  // Se ainda não ativou, deixe false: o resto do VetCamp funciona normalmente.
  storage: false
};

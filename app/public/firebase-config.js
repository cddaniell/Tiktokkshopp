/* Configuração do Firebase do SAMVET.
   Cole aqui os valores do Console do Firebase:
   Configurações do projeto › Seus apps › App da Web › Configuração do SDK (opção "Config").
   Estes valores não são senhas: são feitos para ficar no site. A proteção dos dados
   vem das regras de segurança (firestore.rules e storage.rules). */
window.SAMVET_FIREBASE = {
  apiKey: "",
  authDomain: "",
  projectId: "",
  storageBucket: "",
  messagingSenderId: "",
  appId: "",
  // Anexos (PDF, raio-X) usam o Storage, que exige o plano Blaze no Firebase.
  // Se ainda não ativou, deixe false: o resto do SAMVET funciona normalmente.
  storage: false
};

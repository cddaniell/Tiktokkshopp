# VetCamp

- O nome oficial do aplicativo é **VetCamp** (antes chamado SAMVET). Use sempre "VetCamp" em textos visíveis.
- Quando o usuário falar "Sonnet" ou "SamVet" (ditado por voz), ele quer dizer **VetCamp**, o aplicativo deste repositório: um prontuário veterinário. Não é o modelo Claude Sonnet.
- O app fica em `vetcamp.html` e está publicado como artifact em https://claude.ai/artifact/D2CL9WbAYCemogA4goCkSN
- Site próprio no ar: **https://vetcamp.web.app** (projeto Firebase `vetcamp-1704e`).
- O site próprio (Firebase) é gerado a partir do mesmo arquivo por `scripts/build_app.py`; veja `app/LEIA-ME.md`.
- Não renomear identificadores internos com "samvet" (chaves do localStorage, caminho `data/users/<id>/samvet/...` no banco, `window.SAMVET_*`): mudar isso faz os usuários perderem acesso aos dados já salvos.
- Responder sempre em português do Brasil.
- **Publicar só com autorização:** antes de qualquer `git push` (que publica o site pelo GitHub Actions) ou de publicar o artifact, mostrar o que mudou e pedir autorização ao usuário. Nunca publicar sem um "pode publicar".

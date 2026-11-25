# VetCamp

- O nome oficial do aplicativo é **VetCamp** (antes chamado SAMVET). Use sempre "VetCamp" em textos visíveis.
- Quando o usuário falar "Sonnet" ou "SamVet" (ditado por voz), ele quer dizer **VetCamp**, o aplicativo deste repositório: um prontuário veterinário. Não é o modelo Claude Sonnet.
- O app fica em `vetcamp.html` e está publicado como artifact em https://claude.ai/artifact/D2CL9WbAYCemogA4goCkSN
- O site próprio (Firebase) é gerado a partir do mesmo arquivo por `scripts/build_app.py`; veja `app/LEIA-ME.md`.
- Não renomear identificadores internos com "samvet" (chaves do localStorage, caminho `data/users/<id>/samvet/...` no banco, `window.SAMVET_*`): mudar isso faz os usuários perderem acesso aos dados já salvos.
- Responder sempre em português do Brasil.

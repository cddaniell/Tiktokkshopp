#!/usr/bin/env python3
"""Gera o site próprio do VetCamp (app/public/index.html) a partir de vetcamp.html.

O mesmo vetcamp.html continua sendo o app publicado dentro do Claude. Este script
embrulha esse conteúdo numa página completa e acrescenta o Firebase (login por
e-mail, banco e arquivos) pela ponte app/src/shim.js.

Uso:  python3 scripts/build_app.py
"""
import hashlib
import pathlib
import re

RAIZ = pathlib.Path(__file__).resolve().parent.parent
FONTE = RAIZ / "vetcamp.html"
SHIM = RAIZ / "app" / "src" / "shim.js"
SAIDA = RAIZ / "app" / "public"
FIREBASE_VERSAO = "10.12.2"
SDK = ["app", "auth", "firestore", "storage"]

PAGINA = """<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<meta name="theme-color" content="#5b381b">
<meta name="description" content="VetCamp: prontuário veterinário para equinos, grandes e pequenos animais.">
<link rel="manifest" href="manifest.webmanifest">
<link rel="icon" href="icons/icon-192.png">
<link rel="apple-touch-icon" href="icons/icon-180.png">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-title" content="VetCamp">
<style>:root{{padding-top:env(safe-area-inset-top,0px);padding-bottom:env(safe-area-inset-bottom,0px)}}html,body{{margin:0}}img{{max-width:100%}}[hidden]{{display:none!important}}</style>
</head>
<body>
{conteudo}
</body>
</html>
"""


def main() -> None:
    fonte = FONTE.read_text(encoding="utf-8")
    scripts = "".join(
        f'<script src="https://www.gstatic.com/firebasejs/{FIREBASE_VERSAO}/firebase-{m}-compat.js"></script>\n'
        for m in SDK
    )
    scripts += '<script src="firebase-config.js"></script>\n<script>\n' + SHIM.read_text(encoding="utf-8") + "\n</script>\n"
    # a ponte precisa rodar antes do script principal do VetCamp
    partes = re.split(r"(?m)^<script>$", fonte, maxsplit=1)
    if len(partes) != 2:
        raise SystemExit("Não encontrei o <script> principal em vetcamp.html")
    conteudo = partes[0] + scripts + "<script>" + partes[1]
    conteudo = conteudo.replace('<meta name="claude:viewport-fit-sides" content="cover">\n', "")
    html = PAGINA.format(conteudo=conteudo)
    SAIDA.mkdir(parents=True, exist_ok=True)
    (SAIDA / "index.html").write_text(html, encoding="utf-8")

    versao = hashlib.sha256(html.encode()).hexdigest()[:10]
    sw = (RAIZ / "app" / "src" / "sw.js").read_text(encoding="utf-8").replace("__VERSAO__", versao)
    (SAIDA / "sw.js").write_text(sw, encoding="utf-8")
    print(f"Gerado app/public/index.html ({len(html)//1024} KB) · versão {versao}")


if __name__ == "__main__":
    main()

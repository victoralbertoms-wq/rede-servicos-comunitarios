# Como Rodar o Projeto em Outro Computador
## Rede de Serviços Comunitários

---

## Visão Geral

O código fica no **GitHub**. Em qualquer computador novo, basta clonar o repositório, criar os arquivos `.env` e instalar as dependências. O banco de dados (Firebase) e as imagens (Cloudinary) ficam na nuvem — não precisam ser transferidos.

---

## Passo a Passo

### Etapa 1 — Instalar os programas necessários

Baixe e instale:

1. **Node.js 18+** → https://nodejs.org  
   (marque a opção "Add to PATH" durante a instalação)

2. **Git** → https://git-scm.com  
   (durante a instalação, escolha "Git from the command line and also from 3rd-party software")

3. **Firebase CLI** — após instalar o Node, abra o terminal e rode:
   ```bash
   npm install -g firebase-tools
   ```

Confirme que está tudo ok:
```bash
node --version    # ex: v20.11.0
npm --version     # ex: 10.2.4
git --version     # ex: git version 2.43.0
firebase --version
```

---

### Etapa 2 — Clonar o repositório

Abra o terminal (PowerShell no Windows, Terminal no Mac/Linux) e rode:

```bash
git clone https://github.com/victoralbertoms-wq/rede-servicos-comunitarios.git
cd rede-servicos-comunitarios
```

---

### Etapa 3 — Criar o arquivo `.env` da web

Dentro da pasta `web/`, crie um arquivo chamado **`.env`** (sem extensão, só o ponto e "env") com este conteúdo:

```env
VITE_FIREBASE_API_KEY=AIzaSyDzHsXE4jc8pvSwaDl171xVXbA_qqXBwf4
VITE_FIREBASE_AUTH_DOMAIN=rede-servicos.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=rede-servicos
VITE_FIREBASE_MESSAGING_SENDER_ID=1008910813540
VITE_FIREBASE_APP_ID=1:1008910813540:web:5b7ce8485fa4b095c25271
VITE_FIREBASE_MEASUREMENT_ID=
VITE_CLOUDINARY_CLOUD_NAME=dh3v2u54h
VITE_CLOUDINARY_UPLOAD_PRESET=rede-servicos
```

> O arquivo `.env` **não vai para o GitHub** (está no .gitignore). Por isso precisa ser criado manualmente em cada computador novo.

---

### Etapa 4 — Instalar as dependências e rodar

```bash
cd web
npm install
npm run dev
```

Abra o navegador em **http://localhost:3000** — o sistema vai aparecer.

---

### Etapa 5 — Autenticar no Firebase CLI (só se precisar fazer deploy)

Se precisar fazer deploy das regras ou do site a partir deste computador:

```bash
firebase login
```

Vai abrir o navegador para fazer login com a conta Google que tem acesso ao projeto Firebase.

---

## Fazer Alterações e Publicar

O site em produção é atualizado **automaticamente** quando você faz `git push`. Não precisa fazer deploy manual.

```bash
# 1. Fazer as alterações no código

# 2. Salvar no GitHub
git add .
git commit -m "descrição do que foi alterado"
git push
```

Depois de 1-2 minutos, o GitHub Actions faz o build e publica automaticamente em:  
**https://rede-servicos.web.app**

---

## Se Aparecer Erro de Credenciais do Git

No Windows, ao fazer `git push` pela primeira vez em um computador novo, pode aparecer erro de autenticação. Corrija assim:

```bash
git remote set-url origin https://victoralbertoms-wq:SEU_TOKEN@github.com/victoralbertoms-wq/rede-servicos-comunitarios.git
```

Para gerar um token:
1. Acesse https://github.com/settings/tokens
2. Clique em "Generate new token (classic)"
3. Marque os escopos: `repo` + `workflow`
4. Copie o token gerado e use no comando acima

---

## Resumo em 4 Comandos

```bash
# 1. Clonar
git clone https://github.com/victoralbertoms-wq/rede-servicos-comunitarios.git
cd rede-servicos-comunitarios

# 2. Criar web/.env com as credenciais (ver Etapa 3)

# 3. Instalar e rodar
cd web && npm install && npm run dev

# 4. Publicar mudanças
git add . && git commit -m "mudança" && git push
```

---

## O que NÃO precisa fazer

- **Não** precisa reconfigurar o Firebase — o projeto já está criado na nuvem
- **Não** precisa transferir banco de dados — o Firestore fica na nuvem
- **Não** precisa transferir imagens — o Cloudinary fica na nuvem
- **Não** precisa reconfigurar o GitHub Actions — já está configurado
- **Não** precisa fazer deploy manual — o `git push` já cuida disso

---

## Onde Ficam as Configurações do GitHub Actions

Caso precise verificar ou reconfigurar os secrets do GitHub:

1. Acesse: https://github.com/victoralbertoms-wq/rede-servicos-comunitarios/settings/secrets/actions
2. Os secrets necessários estão documentados em `docs/MANUAL-INSTALACAO.md`

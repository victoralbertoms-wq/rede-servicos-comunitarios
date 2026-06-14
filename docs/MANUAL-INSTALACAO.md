# Manual de Instalação
## Rede de Serviços Comunitários

---

## Pré-requisitos

Instale os programas abaixo antes de começar:

| Programa | Versão mínima | Download |
|---|---|---|
| Node.js | 18 ou superior | https://nodejs.org |
| Git | Qualquer | https://git-scm.com |
| Firebase CLI | Qualquer | `npm install -g firebase-tools` |
| Expo CLI (só mobile) | Qualquer | `npm install -g expo-cli` |

Verifique se está tudo instalado:
```bash
node --version      # deve mostrar v18.x ou superior
npm --version
git --version
firebase --version
```

---

## 1. Clonar o Repositório

```bash
git clone https://github.com/victoralbertoms-wq/rede-servicos-comunitarios.git
cd rede-servicos-comunitarios
```

---

## 2. Configurar a Web

### 2.1 Instalar dependências
```bash
cd web
npm install
```

### 2.2 Criar arquivo de variáveis de ambiente
Crie o arquivo `web/.env` com o conteúdo abaixo:

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

### 2.3 Rodar em desenvolvimento
```bash
npm run dev
```
Abra o navegador em: **http://localhost:3000**

### 2.4 Build de produção
```bash
npm run build
```
Os arquivos ficam em `web/dist/`.

---

## 3. Configurar o Mobile

### 3.1 Instalar dependências
```bash
cd mobile
npm install
```

### 3.2 Criar arquivo de variáveis de ambiente
Crie o arquivo `mobile/.env`:

```env
EXPO_PUBLIC_FIREBASE_API_KEY=AIzaSyDzHsXE4jc8pvSwaDl171xVXbA_qqXBwf4
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=rede-servicos.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=rede-servicos
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=1008910813540
EXPO_PUBLIC_FIREBASE_APP_ID=1:1008910813540:web:5b7ce8485fa4b095c25271
EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME=dh3v2u54h
EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET=rede-servicos
```

### 3.3 Rodar o app mobile
```bash
npx expo start
```
Escaneie o QR Code com o app **Expo Go** no celular (disponível na App Store e Play Store).

---

## 4. Configurar Firebase CLI

### 4.1 Autenticar no Firebase
```bash
firebase login
```
Vai abrir o navegador para login com a conta Google do projeto.

### 4.2 Implantar regras do Firestore
```bash
cd firebase
firebase deploy --only firestore:rules
```

### 4.3 Implantar site manualmente (opcional)
O deploy é automático pelo GitHub Actions a cada `git push`. Para deploy manual:
```bash
cd web
npm run build
cp -r dist ../firebase/dist
cd ../firebase
firebase deploy --only hosting
```

---

## 5. Configurar GitHub Actions (CI/CD)

Para que o deploy automático funcione, configure os **Secrets** no GitHub:

1. Acesse: `https://github.com/victoralbertoms-wq/rede-servicos-comunitarios/settings/secrets/actions`
2. Adicione os seguintes secrets:

| Secret | Valor |
|---|---|
| `FIREBASE_API_KEY` | `AIzaSyDzHsXE4jc8pvSwaDl171xVXbA_qqXBwf4` |
| `FIREBASE_AUTH_DOMAIN` | `rede-servicos.firebaseapp.com` |
| `FIREBASE_PROJECT_ID` | `rede-servicos` |
| `FIREBASE_MESSAGING_SENDER_ID` | `1008910813540` |
| `FIREBASE_APP_ID` | `1:1008910813540:web:5b7ce8485fa4b095c25271` |
| `FIREBASE_MEASUREMENT_ID` | (deixar vazio) |
| `CLOUDINARY_CLOUD_NAME` | `dh3v2u54h` |
| `CLOUDINARY_UPLOAD_PRESET` | `rede-servicos` |
| `FIREBASE_TOKEN` | token do `firebase login:ci` |
| `FIREBASE_SERVICE_ACCOUNT` | JSON da conta de serviço |

### Gerar FIREBASE_TOKEN:
```bash
firebase login:ci
```
Copie o token exibido e adicione como secret `FIREBASE_TOKEN`.

### Gerar FIREBASE_SERVICE_ACCOUNT:
1. Acesse Firebase Console → Configurações do projeto → Contas de serviço
2. Clique em "Gerar nova chave privada"
3. Copie o conteúdo do JSON gerado e cole no secret `FIREBASE_SERVICE_ACCOUNT`

---

## 6. Tornar Usuário Admin

Após criar a primeira conta no sistema:

1. Acesse o [Firebase Console](https://console.firebase.google.com/project/rede-servicos/firestore)
2. Vá em **Firestore Database** → coleção **`users`**
3. Abra o documento do seu usuário
4. Edite o campo `role` para `"admin"`
5. Salve

Agora você terá acesso ao Painel Admin em `/admin`.

---

## Resumo dos Comandos

```bash
# Clonar
git clone https://github.com/victoralbertoms-wq/rede-servicos-comunitarios.git
cd rede-servicos-comunitarios

# Web
cd web && npm install && npm run dev

# Mobile
cd mobile && npm install && npx expo start

# Regras Firestore
cd firebase && firebase deploy --only firestore:rules

# Deploy (ou só fazer git push)
git add . && git commit -m "atualização" && git push
```

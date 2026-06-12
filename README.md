# Rede de Serviços Comunitários

Plataforma completa para cadastro e divulgação de serviços profissionais dentro de comunidades privadas.

## Tecnologias

| Camada | Tecnologia |
|--------|-----------|
| Frontend Web | React.js 18 + Vite |
| Mobile | React Native + Expo SDK 50 |
| Backend | Firebase (BaaS) |
| Banco de Dados | Firestore |
| Autenticação | Firebase Authentication |
| Armazenamento | Firebase Storage |
| Hospedagem | Firebase Hosting |
| Notificações | Firebase Cloud Messaging |
| CI/CD | GitHub Actions |

---

## Arquitetura de Pastas

```
rede-servicos-comunitarios/
├── .github/
│   └── workflows/
│       └── deploy.yml          # CI/CD automático
├── firebase/
│   ├── firestore.rules         # Regras de segurança
│   ├── firestore.indexes.json  # Índices compostos
│   ├── storage.rules           # Regras de storage
│   └── firebase.json           # Configuração Firebase CLI
├── web/                        # App React.js
│   ├── public/
│   ├── src/
│   │   ├── firebase/           # Inicialização Firebase
│   │   ├── contexts/           # Contextos React
│   │   ├── hooks/              # Custom hooks
│   │   ├── components/         # Componentes reutilizáveis
│   │   ├── pages/              # Telas principais
│   │   ├── services/           # Serviços Firebase
│   │   ├── styles/             # CSS global + tema
│   │   └── utils/              # Utilitários
│   └── package.json
├── mobile/                     # App Expo/React Native
│   ├── src/
│   │   ├── firebase/
│   │   ├── contexts/
│   │   ├── navigation/
│   │   ├── screens/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── services/
│   │   └── utils/
│   ├── app.json
│   └── package.json
├── docker-compose.yml
└── README.md
```

---

## Modelagem Firestore

### Coleção `users`
```json
{
  "uid": "string",
  "displayName": "string",
  "email": "string",
  "photoURL": "string",
  "phone": "string",
  "role": "admin | community_admin | user",
  "communities": ["communityId"],
  "favorites": { "services": [], "companies": [] },
  "createdAt": "timestamp",
  "updatedAt": "timestamp"
}
```

### Coleção `communities`
```json
{
  "id": "string",
  "name": "string",
  "description": "string",
  "photoURL": "string",
  "logoURL": "string",
  "password": "string (hashed)",
  "adminIds": ["uid"],
  "memberCount": "number",
  "categories": ["string"],
  "isActive": "boolean",
  "createdAt": "timestamp"
}
```

### Coleção `community_members`
```json
{
  "communityId": "string",
  "userId": "string",
  "role": "admin | member",
  "status": "pending | approved | banned",
  "joinedAt": "timestamp"
}
```

### Coleção `services`
```json
{
  "id": "string",
  "userId": "string",
  "communityId": "string",
  "name": "string",
  "photoURL": "string",
  "category": "string",
  "specialty": "string",
  "description": "string",
  "phone": "string",
  "whatsapp": "string",
  "email": "string",
  "city": "string",
  "state": "string",
  "address": "string",
  "website": "string",
  "instagram": "string",
  "facebook": "string",
  "workingHours": "string",
  "rating": "number",
  "reviewCount": "number",
  "status": "pending | approved | rejected",
  "isSponsored": "boolean",
  "createdAt": "timestamp"
}
```

### Coleção `companies`
```json
{
  "id": "string",
  "userId": "string",
  "communityId": "string",
  "name": "string",
  "legalName": "string",
  "cnpj": "string",
  "photoURL": "string",
  "logoURL": "string",
  "category": "string",
  "description": "string",
  "phone": "string",
  "whatsapp": "string",
  "email": "string",
  "address": "string",
  "lat": "number",
  "lng": "number",
  "website": "string",
  "instagram": "string",
  "facebook": "string",
  "rating": "number",
  "reviewCount": "number",
  "status": "pending | approved | rejected",
  "createdAt": "timestamp"
}
```

### Coleção `reviews`
```json
{
  "id": "string",
  "targetId": "string",
  "targetType": "service | company",
  "userId": "string",
  "userName": "string",
  "userPhoto": "string",
  "rating": "number",
  "comment": "string",
  "createdAt": "timestamp"
}
```

### Coleção `messages`
```json
{
  "id": "string",
  "participants": ["uid"],
  "lastMessage": "string",
  "lastSenderId": "string",
  "updatedAt": "timestamp"
}
```

### Subcoleção `messages/{chatId}/messages`
```json
{
  "senderId": "string",
  "text": "string",
  "type": "text | location | contact",
  "read": "boolean",
  "createdAt": "timestamp"
}
```

---

## Instalação

### Pré-requisitos

- Node.js >= 18
- npm >= 9
- Firebase CLI: `npm install -g firebase-tools`
- Expo CLI: `npm install -g expo-cli`

### 1. Clonar o repositório

```bash
git clone https://github.com/SEU_USUARIO/rede-servicos-comunitarios.git
cd rede-servicos-comunitarios
```

### 2. Configurar Firebase

1. Acesse [console.firebase.google.com](https://console.firebase.google.com)
2. Crie um projeto chamado `rede-servicos-comunitarios`
3. Ative: Authentication, Firestore, Storage, Hosting, Cloud Messaging
4. Copie as credenciais do projeto

### 3. Variáveis de ambiente — Web

```bash
cd web
cp .env.example .env
# Edite .env com suas credenciais Firebase
```

### 4. Instalar dependências e rodar web

```bash
cd web
npm install
npm run dev
```

### 5. Instalar dependências e rodar mobile

```bash
cd mobile
npm install
npx expo start
```

---

## Deploy Web (Firebase Hosting)

```bash
cd web
npm run build
firebase login
firebase init hosting
firebase deploy
```

---

## Publicação na Google Play Store

1. Gere o APK/AAB: `cd mobile && eas build --platform android`
2. Acesse [play.google.com/console](https://play.google.com/console)
3. Crie novo aplicativo
4. Faça upload do `.aab`
5. Preencha ficha do app, screenshots, política de privacidade
6. Submeta para revisão

## Publicação na Apple App Store

1. Gere o IPA: `cd mobile && eas build --platform ios`
2. Acesse [appstoreconnect.apple.com](https://appstoreconnect.apple.com)
3. Crie novo app
4. Faça upload via Xcode ou Transporter
5. Preencha metadados, screenshots
6. Submeta para revisão

---

## Docker (ambiente local)

```bash
docker-compose up --build
```

Acesse: http://localhost:3000

---

## Licença

MIT © 2024 Rede de Serviços Comunitários

# Rede de Serviços Comunitários — CLAUDE.md

Guia rápido para o Claude Code entender e trabalhar neste projeto.

## Visão Geral

Plataforma web + mobile para cadastro e busca de serviços, empresas e comunidades.  
Stack: **React 18 + Vite** (web) · **React Native + Expo SDK 50** (mobile) · **Firebase** (Auth + Firestore + Hosting) · **Cloudinary** (imagens)

## Estrutura de Pastas

```
rede-servicos-comunitarios/
├── web/          → App React (Vite), roda em localhost:3000
├── mobile/       → App Expo (React Native)
├── firebase/     → Regras Firestore + config Firebase Hosting
└── .github/      → CI/CD via GitHub Actions (deploy automático no push)
```

## Credenciais e Variáveis de Ambiente

### web/.env
```
VITE_FIREBASE_API_KEY=AIzaSyDzHsXE4jc8pvSwaDl171xVXbA_qqXBwf4
VITE_FIREBASE_AUTH_DOMAIN=rede-servicos.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=rede-servicos
VITE_FIREBASE_MESSAGING_SENDER_ID=1008910813540
VITE_FIREBASE_APP_ID=1:1008910813540:web:5b7ce8485fa4b095c25271
VITE_FIREBASE_MEASUREMENT_ID=
VITE_CLOUDINARY_CLOUD_NAME=dh3v2u54h
VITE_CLOUDINARY_UPLOAD_PRESET=rede-servicos
```

### mobile/.env
Mesmos valores, prefixo `EXPO_PUBLIC_` em vez de `VITE_`.

## Comandos Principais

```bash
# Web — desenvolvimento
cd web && npm install && npm run dev

# Web — build de produção
cd web && npm run build

# Mobile
cd mobile && npm install && npx expo start

# Firebase — implantar regras Firestore
cd firebase && firebase deploy --only firestore:rules

# Deploy completo (feito automaticamente pelo GitHub Actions no git push)
git add . && git commit -m "mensagem" && git push
```

## Firebase

- **Projeto:** `rede-servicos`
- **Console:** https://console.firebase.google.com/project/rede-servicos
- **Hosting URL:** https://rede-servicos.web.app
- **Auth:** Email/senha habilitado
- **Firestore:** Banco principal (8 coleções)
- **Storage:** NÃO usado — imagens vão para Cloudinary

### Coleções Firestore

| Coleção | Descrição |
|---|---|
| `users` | Perfis de usuários |
| `communities` | Comunidades (campo `adminIds[]`) |
| `community_members` | Membros de cada comunidade |
| `services` | Serviços profissionais |
| `companies` | Empresas e comércios |
| `reviews` | Avaliações |
| `messages` | Chats (subcoleção `messages/{chatId}/messages`) |
| `notifications` | Notificações de usuários |

### Campos importantes por coleção

- **communities:** `adminIds: [uid]` — quem pode editar/excluir
- **services / companies:** `userId: uid` — dono do cadastro; `status: 'pending'|'approved'` — aprovação pelo admin
- **reviews:** `userId`, `targetId`, `targetType: 'service'|'company'`

## Cloudinary

- **Cloud name:** `dh3v2u54h`
- **Upload preset:** `rede-servicos` (modo **Unsigned** — obrigatório)
- **Console:** https://cloudinary.com/console
- Upload feito em `web/src/utils/cloudinary.js` e `mobile/src/utils/cloudinary.js`

## Arquitetura — Decisões Importantes

### Consultas Firestore sem índice composto
Nunca combinar `where()` + `orderBy()` em campos diferentes sem índice.  
**Solução adotada:** quando há filtro `where('communityId', '==', id)`, omitir o `orderBy` e ordenar client-side.  
Ver `getServices()` e `getCompanies()` em `web/src/services/firestoreService.js`.

### Permissões nas regras Firestore
Regras simplificadas — sem `get()` aninhado (causa falhas silenciosas).  
- Comunidades: `request.auth.uid in resource.data.adminIds`
- Serviços/Empresas: `resource.data.userId == request.auth.uid`

### Busca / Pesquisa
Toda busca é **client-side** com `useMemo`. Carrega todos os docs uma vez e filtra localmente.  
Não há chamadas Firestore por tecla digitada.

### Status de aprovação
Serviços e empresas criados com `status: 'pending'`. O admin aprova pelo Painel Admin (`/admin`).  
Somente itens `status: 'approved'` aparecem publicamente (ou o próprio dono vê o seu).

## CI/CD

GitHub Actions em `.github/workflows/deploy.yml`:
1. Push para `main` → build do web → copia `dist/` para `firebase/dist/` → deploy no Firebase Hosting
2. Segredos necessários no GitHub: `FIREBASE_TOKEN`, `FIREBASE_SERVICE_ACCOUNT`, `FIREBASE_API_KEY`, `FIREBASE_AUTH_DOMAIN`, `FIREBASE_PROJECT_ID`, `FIREBASE_MESSAGING_SENDER_ID`, `FIREBASE_APP_ID`, `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_UPLOAD_PRESET`

## Admin

Para tornar um usuário admin:
1. Abrir Firestore Console
2. Coleção `users` → documento do usuário → editar campo `role` para `"admin"`

## Páginas Web (Rotas)

| Rota | Página |
|---|---|
| `/` | Home / Dashboard |
| `/comunidades` | Lista de comunidades |
| `/comunidades/nova` | Criar comunidade (admin) |
| `/comunidades/:id` | Detalhe da comunidade |
| `/comunidades/:id/editar` | Editar comunidade (adminIds ou admin) |
| `/servicos` | Lista de serviços |
| `/servicos/novo` | Cadastrar serviço |
| `/servicos/:id` | Detalhe do serviço |
| `/servicos/:id/editar` | Editar serviço (dono ou admin) |
| `/empresas` | Lista de empresas |
| `/empresas/nova` | Cadastrar empresa |
| `/empresas/:id` | Detalhe da empresa |
| `/empresas/:id/editar` | Editar empresa (dono ou admin) |
| `/admin` | Painel administrativo |
| `/admin/usuarios` | Gerenciar usuários |
| `/admin/comunidades` | Gerenciar comunidades |

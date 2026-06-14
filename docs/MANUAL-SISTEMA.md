# Manual Descritivo do Sistema
## Rede de Serviços Comunitários

---

## O que é o sistema

A **Rede de Serviços Comunitários** é uma plataforma digital que conecta membros de comunidades a profissionais e empresas locais. Funciona como um diretório comunitário onde qualquer pessoa pode cadastrar seus serviços ou empresa, participar de comunidades e encontrar o que precisa perto de si.

O sistema tem duas versões:
- **Web** — acessível por navegador em qualquer computador
- **Mobile** — aplicativo para celular Android e iOS

---

## Tecnologias Utilizadas

| Camada | Tecnologia |
|---|---|
| Web (frontend) | React 18 + Vite |
| Mobile | React Native + Expo SDK 50 |
| Banco de dados | Firebase Firestore |
| Autenticação | Firebase Authentication |
| Hospedagem web | Firebase Hosting |
| Armazenamento de imagens | Cloudinary (gratuito) |
| CI/CD (deploy automático) | GitHub Actions |

---

## Funcionalidades do Sistema

### Autenticação
- Cadastro de novo usuário com e-mail e senha
- Login / Logout
- Recuperação de senha por e-mail

### Comunidades
- Listar todas as comunidades ativas
- Criar nova comunidade (apenas admin global)
- Ver detalhe de uma comunidade com seus serviços e empresas
- Editar nome, descrição, senha, logo e foto de capa (criador da comunidade ou admin)
- Excluir comunidade (criador ou admin)
- Entrar em uma comunidade (com ou sem senha)
- Comunidades com senha exigem a senha correta para entrar

### Serviços
- Listar todos os serviços aprovados com busca e filtro por categoria
- Cadastrar novo serviço (qualquer usuário autenticado)
- Ver detalhe completo: foto, contatos, localização, avaliações
- Editar serviço (dono do cadastro ou admin)
- Excluir serviço (dono ou admin)
- Remover ou trocar foto
- Favoritar serviço

### Empresas
- Listar todas as empresas aprovadas com busca e filtro
- Cadastrar nova empresa
- Ver detalhe completo: logo, foto, contatos, avaliações
- Editar empresa (dono ou admin) com opção de remover logo/foto
- Excluir empresa

### Avaliações
- Qualquer usuário autenticado pode avaliar um serviço ou empresa (1 a 5 estrelas + comentário)
- Média calculada automaticamente

### Favoritos
- Salvar serviços e empresas favoritos para acesso rápido

### Mensagens
- Chat direto entre usuários
- Acessível pelo botão "Mensagem" na página do serviço ou empresa

### Painel Administrativo (apenas admin)
- Ver estatísticas: total de usuários, comunidades, serviços, empresas, avaliações
- Aprovar ou rejeitar serviços e empresas pendentes
- Gerenciar usuários (definir papel: admin / usuário)
- Gerenciar comunidades

---

## Fluxo de Aprovação

Serviços e empresas passam por aprovação antes de aparecer publicamente:

```
Usuário cadastra serviço/empresa
        ↓
Status: "pending" (pendente)
        ↓
Admin acessa /admin e aprova
        ↓
Status: "approved" (aprovado)
        ↓
Aparece na listagem pública
```

O próprio dono do cadastro sempre vê seu item, mesmo pendente.

---

## Permissões por Tipo de Usuário

| Ação | Visitante | Usuário | Dono do cadastro | Admin |
|---|---|---|---|---|
| Ver listagens | ✗ | ✓ | ✓ | ✓ |
| Cadastrar serviço/empresa | ✗ | ✓ | ✓ | ✓ |
| Editar próprio serviço | ✗ | ✗ | ✓ | ✓ |
| Excluir próprio serviço | ✗ | ✗ | ✓ | ✓ |
| Criar comunidade | ✗ | ✗ | ✗ | ✓ |
| Editar comunidade | ✗ | ✗ | ✓ (se adminIds) | ✓ |
| Aprovar cadastros | ✗ | ✗ | ✗ | ✓ |
| Gerenciar usuários | ✗ | ✗ | ✗ | ✓ |

---

## Estrutura de Dados (Firestore)

### Coleção `users`
```
{
  displayName: string,
  email: string,
  photoURL: string,
  role: 'user' | 'admin',
  communityId: string,
  favorites: { services: [], companies: [] },
  createdAt: timestamp
}
```

### Coleção `communities`
```
{
  name: string,
  description: string,
  password: string,           // vazio = comunidade aberta
  logoURL: string,
  photoURL: string,
  adminIds: [uid],            // quem pode editar/excluir
  memberCount: number,
  isActive: boolean,
  createdAt: timestamp
}
```

### Coleção `services`
```
{
  name: string,
  category: string,
  specialty: string,
  description: string,
  phone: string,
  whatsapp: string,
  email: string,
  website: string,
  instagram: string,
  facebook: string,
  city: string,
  state: string,
  address: string,
  workingHours: string,
  photoURL: string,
  communityId: string,
  userId: string,             // dono do cadastro
  status: 'pending' | 'approved' | 'rejected',
  rating: number,
  reviewCount: number,
  isSponsored: boolean,
  createdAt: timestamp
}
```

### Coleção `companies`
Mesmo formato de `services`, com adicionais:
```
{
  legalName: string,
  cnpj: string,
  logoURL: string,
  ...
}
```

### Coleção `reviews`
```
{
  targetId: string,           // id do serviço ou empresa
  targetType: 'service' | 'company',
  userId: string,
  userName: string,
  rating: number,             // 1 a 5
  comment: string,
  createdAt: timestamp
}
```

---

## Armazenamento de Imagens (Cloudinary)

Todas as imagens (fotos de perfil, logos, fotos de capa) são enviadas para o **Cloudinary**, serviço gratuito de armazenamento de mídia na nuvem.

- **Cloud name:** `dh3v2u54h`
- **Upload preset:** `rede-servicos` (modo Unsigned)
- Imagens ficam permanentemente no Cloudinary mesmo se o registro for excluído do Firestore

---

## URL do Sistema

- **Web (produção):** https://rede-servicos.web.app
- **Repositório:** https://github.com/victoralbertoms-wq/rede-servicos-comunitarios

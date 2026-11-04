# WayOfTheWeights — Backend

API do WayOfTheWeights V2: SaaS de treino focado em evolução de força.

**Stack:** NestJS 10 · Prisma 7 (`@prisma/adapter-pg`) · PostgreSQL · JWT · Jest + Testcontainers

## Estrutura

```
src/
├── main.ts / app.module.ts
├── prisma/                  # PrismaService global
├── shared/                  # criptografia (bcrypt), email (nodemailer/SMTP), DTOs compartilhados
├── generated/prisma/        # client gerado pelo Prisma (não versionado)
└── modules/
    ├── auth/                # login JWT, guards globais, @Public, @Roles, @UsuarioAutenticado
    ├── recuperacao-senha/   # /auth/recuperar-senha e /auth/redefinir-senha (código por email)
    ├── contas/              # /conta/plano — plano da conta e limites por perfil
    ├── usuarios/            # /usuarios (admin da conta), /conta (cadastro e dados próprios)
    ├── treinos/             # /treinos
    ├── exercicios/          # /treinos/:treinoId/exercicios (+ /historico)
    ├── series/              # /treinos/:treinoId/exercicios/:exercicioId/series
    └── estatisticas/        # /estatisticas/resumo
```

Cada módulo segue `<modulo>.controller/`, `<modulo>.dto/`, `<modulo>.repositories/`, `<modulo>.service/`.

## Autenticação (cookie httpOnly)

O login (`POST /auth/login`) grava o JWT no cookie `jwt` e **não** devolve o token no corpo. O browser envia o cookie sozinho em toda requisição da sessão, e nenhum JavaScript consegue lê-lo, o que protege contra roubo de token por XSS. `POST /auth/logout` expira o cookie.

- Cookie `httpOnly`; em produção (`NODE_ENV=production`) também `secure` (só HTTPS) e `sameSite=strict` (proteção contra CSRF). Configuração em `src/security/cookies.config.ts`.
- Cookie e JWT expiram juntos (24h, em `src/modules/auth/constantes/expiracao-token.ts`).
- O frontend precisa enviar as requisições com credenciais (`fetch(..., { credentials: 'include' })` ou `axios` com `withCredentials: true`), e sua origem precisa estar em `ORIGIN_CLIENT`.
- O header `Authorization: Bearer <token>` continua aceito como alternativa para clientes sem cookie (ex.: app mobile nativo).

## Recuperação de senha (código por email)

1. `POST /auth/recuperar-senha` `{ email }` envia um código de **6 dígitos** por email (SMTP via nodemailer). A resposta é sempre 204, exista o email ou não, para não revelar quem está cadastrado.
2. `POST /auth/redefinir-senha` `{ email, codigo, novaSenha }` troca a senha.

Regras: o código vale 15 minutos, é guardado só como hash, trava após 5 tentativas erradas, é consumido ao usar e só pode ser reenviado após 60 segundos. Configure `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASS` e `SMTP_FROM` no `.env` (no Gmail, use uma *senha de app*).

## Contas e planos

Cada assinante do SaaS é uma **conta**. O autocadastro (`POST /conta`) cria a conta no plano `BASICO` e quem se cadastrou vira o administrador **proprietário** dela (não pode ser removido, desativado nem ter o perfil alterado). Todos os dados são isolados por conta.

| Plano    | ADMINISTRADOR | TREINADOR | ALUNO |
| -------- | :-----------: | :-------: | :---: |
| `BASICO` |       1       |     1     |   1   |
| `BETA`   |       3       |     3     |   3   |

- Os limites são validados ao criar usuário e ao trocar perfil; usuários inativos também ocupam vaga.
- Downgrade de plano é bloqueado se a conta tiver mais usuários do que o novo plano permite.
- Limites ficam em `src/modules/contas/regras/limites-plano.ts`.

## Perfis (sempre restritos à própria conta)

| Perfil          | Acesso                                                                                 |
| --------------- | -------------------------------------------------------------------------------------- |
| `ADMINISTRADOR` | Tudo: gerencia usuários, plano e treinos/estatísticas de qualquer usuário da conta     |
| `TREINADOR`     | Gerencia treinos, exercícios e estatísticas de qualquer usuário da conta               |
| `ALUNO`         | Apenas os próprios dados, treinos, exercícios e estatísticas                           |

Administrador e treinador agem sobre outro usuário informando `usuarioId` (no corpo ao criar treino, ou `?usuarioId=` na listagem de treinos e nas estatísticas).

## Regras de negócio

- As cargas vêm de um **catálogo compartilhado** por todas as contas (tabela `cargas`): kg **inteiros de 1 a 1500**, inseridos pela migration `cargas_compartilhadas`. A API recebe e devolve a carga como número (`cargaAtual`), e o vínculo com o catálogo é interno.
- Cada exercício tem uma `cargaAtual`. A criação do exercício e **cada alteração de carga** gravam um registro em `historico_cargas`.
- Cada exercício tem **séries**, e cada série guarda as suas repetições (1 a 100). A numeração "Série 1, 2, 3" é a ordem de criação.
- O resumo de estatísticas compara a primeira carga registrada com a atual (evolução em kg e %).

## Como rodar

```bash
cp .env.example .env              # preencha DATABASE_URL e JWT_SECRET
npm install                       # também roda prisma generate
npm run prisma:migrate:dev -- --name inicial
npm run start:dev
```

Requisições de exemplo em [api-docs.http](./api-docs.http).

## Testes

```bash
npm run test        # unitários
npm run test:e2e    # e2e (precisa de Docker — sobe um Postgres via Testcontainers)
```

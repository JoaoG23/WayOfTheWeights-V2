# WayOfTheWeights — Backend

API do WayOfTheWeights V2: SaaS de treino focado em evolução de força.

**Stack:** NestJS 10 · Prisma 7 (`@prisma/adapter-pg`) · PostgreSQL · JWT · Google Gemini (`@google/genai`) · Jest + Testcontainers

## Estrutura

```
src/
├── main.ts / app.module.ts
├── prisma/                  # PrismaService global
├── shared/                  # criptografia (bcrypt), email (nodemailer/SMTP), gemini (OCR), DTOs compartilhados
├── generated/prisma/        # client gerado pelo Prisma (não versionado)
└── modules/
    ├── auth/                # login JWT, guards globais, @Public, @Roles, @UsuarioAutenticado
    ├── recuperacao-senha/   # /auth/recuperar-senha e /auth/redefinir-senha (código por email)
    ├── contas/              # /conta/plano — plano da conta e limites por perfil
    ├── usuarios/            # /usuarios (admin da conta), /conta (cadastro e dados próprios)
    ├── treinos/             # /treinos
    ├── subtreinos/          # /treinos/:treinoId/subtreinos (até 3 por treino)
    ├── importacao-subtreinos/ # /treinos/:treinoId/subtreinos/ocr e /:id/importar (leitura de imagens com Gemini + upsert)
    ├── fotos-usuario/       # /conta/foto — foto de perfil guardada em disco
    ├── conclusoes/          # /treinos/:treinoId/subtreinos/:subtreinoId/conclusoes e /conclusoes (checklist e histórico)
    ├── exercicios/          # /treinos/:treinoId/subtreinos/:subtreinoId/exercicios (+ /historico)
    ├── series/              # /treinos/:treinoId/subtreinos/:subtreinoId/exercicios/:exercicioId/series
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

## Importação de subtreinos por imagens (OCR com Gemini)

Duas rotas, em dois passos, para o usuário conferir o que foi lido antes de gravar:

1. `POST /treinos/:treinoId/subtreinos/ocr` — `multipart/form-data`, campo **`imagens`** (1 a 10 arquivos jpeg/png/webp/heic de até 8 MB). As imagens vão para o Gemini, que devolve o **JSON padronizado** abaixo. **Não grava nada.**
2. `PUT /treinos/:treinoId/subtreinos/:id/importar` — recebe esse JSON (já corrigido, se preciso) e faz o **upsert por id**.

```json
{
  "titulo": "Peito",
  "descricao": "Treino A",
  "exercicios": [
    { "nome": "Supino reto", "cargaAtual": 40, "repeticoesPorSerie": [12, 10, 8] }
  ]
}
```

Regras do upsert:

- Se o subtreino `:id` **existe neste treino**, é atualizado (título e descrição). Se não existe (inclusive um id de outro treino ou conta), é **criado** com id novo gerado pelo banco; a resposta traz `criado: true|false` e o id real. A criação respeita o limite de 3 subtreinos (409).
- Exercícios são casados pelo **nome** (sem diferenciar maiúsculas): o existente é atualizado, o novo é criado, e os que **não vieram no JSON ficam como estão** (nada é apagado). Nomes repetidos no JSON são rejeitados.
- A carga só gera novo ponto no histórico quando muda. `repeticoesPorSerie` informado substitui as séries do exercício; omitido ou vazio mantém as atuais.
- Limites: carga inteira 1–1500, repetições 1–100, até 20 séries por exercício e 30 exercícios por subtreino.

Configuração no `.env`: `GEMINI_API_KEY` (crie em https://aistudio.google.com/api-keys) e, opcionalmente, `GEMINI_MODEL` (padrão `gemini-3.8-flash`). Se o Gemini responder erro temporário (503/429/5xx), o backend tenta de novo 3 vezes com espera crescente e depois usa `GEMINI_MODEL_CONTINGENCIA` (padrão `gemini-2.5-flash`); esgotado, responde 502. Sem a chave, o OCR responde 503; a importação do JSON funciona normalmente.

## Foto de perfil

Cada usuário tem uma foto, guardada **no disco do servidor** (pasta `UPLOADS_DIR`, padrão `./uploads/fotos`, fora do git); o banco guarda só o nome do arquivo (`usuarios.foto_arquivo`).

- `PUT /conta/foto` — `multipart/form-data`, campo **`foto`** (jpeg, png ou webp, até 2 MB; o conteúdo é conferido pelos primeiros bytes). Cada envio cria um arquivo novo e apaga o anterior.
- `GET /conta/foto` — devolve a imagem (exige login). `GET /conta` traz `fotoVersao` (nome do arquivo, ou nulo); o app usa como `?v=` na URL, e por isso a resposta tem cache longo.
- `DELETE /conta/foto` — remove a foto.

Em produção, a pasta de uploads precisa ser um disco **persistente** (volume) e entrar no backup, e com várias instâncias da API o armazenamento precisa ser compartilhado.

## Conclusão de treino (checklist e histórico)

O usuário marca no app os exercícios que fez dentro de um subtreino e finaliza o checklist (automaticamente ao marcar **todos**, ou manualmente com só **alguns**, o que gera uma conclusão **parcial**). O app chama `POST /treinos/:treinoId/subtreinos/:subtreinoId/conclusoes` com `{ "exerciciosConcluidosIds": [...] }`:

- A lista precisa ter ao menos um exercício e só ids do subtreino (id de outro subtreino ou subtreino sem exercícios: 400). Ids repetidos contam uma vez.
- Grava uma linha em `conclusoes_treino` (data/hora em `concluidoEm` e `totalExercicios`, quantos exercícios o subtreino tinha) e uma em `exercicios_concluidos` por exercício **marcado**, com **cópia** dos títulos do treino/subtreino e do nome e carga de cada exercício. O histórico continua legível mesmo se o treino for editado; se o subtreino for removido, a conclusão permanece com `subtreinoId` nulo.
- A resposta traz `totalExercicios` e `completo` (todos marcados). A conclusão pertence ao dono do treino. Pode ser registrada mais de uma vez por dia.

`GET /conclusoes?inicio=&fim=&usuarioId=` lista o histórico (mais recente primeiro, até 200): `inicio` inclusivo e `fim` exclusivo, em ISO 8601; `usuarioId` só vale para administrador/treinador da mesma conta. É a base do calendário semanal do dashboard.

## Regras de negócio

- As cargas vêm de um **catálogo compartilhado** por todas as contas (tabela `cargas`): kg **inteiros de 1 a 1500**, inseridos pela migration `cargas_compartilhadas`. A API recebe e devolve a carga como número (`cargaAtual`), e o vínculo com o catálogo é interno.
- Cada exercício tem uma `cargaAtual`. A criação do exercício e **cada alteração de carga** gravam um registro em `historico_cargas`.
- Um treino tem até **3 subtreinos** (ex.: Peito, Costas, Pernas) e os exercícios ficam dentro deles, com séries, cargas e histórico. Remover um subtreino remove seus exercícios.
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

## Docker (build, deploy e CI/CD)

O backend roda em container; o **banco não sobe junto**: a `DATABASE_URL` aponta para o banco de testes do servidor. As fotos de perfil ficam numa pasta do servidor mapeada como volume.

Arquivos: [Dockerfile](./Dockerfile) (build em estágios), [docker-compose.yml](./docker-compose.yml) e [.env.prod.example](./.env.prod.example).

```bash
cp .env.prod.example .env.prod          # preencha DATABASE_URL, JWT_SECRET, SMTP_*...
mkdir -p uploads && sudo chown -R 1000:1000 uploads   # o container roda como o usuário "node" (uid 1000)
docker compose up -d --build            # migra o banco (serviço "migrar") e sobe a API
```

- **Migrations:** o serviço `migrar` roda `prisma migrate deploy` e termina; a API só sobe depois que ele conclui com sucesso.
- **Fotos:** `UPLOADS_HOST_DIR` (padrão `./uploads`) é montado em `/app/uploads`. Inclua essa pasta no backup.
- **Banco no próprio servidor:** use `host.docker.internal` como host na `DATABASE_URL` (o compose já mapeia para o host). Se o banco exigir SSL, acrescente `?sslmode=require`.
- **Cookie de sessão:** com `NODE_ENV=production` o cookie só funciona em HTTPS. Se o servidor de testes responde em HTTP puro, use `NODE_ENV=development` no `.env.prod`.
- **Porta:** a API usa a 3001 por padrão. Para trocar, defina `PORTA` (ex.: `PORTA=3002 docker compose up -d`, ou num arquivo `.env` ao lado do compose); vale para o container e para a porta publicada. Ajuste também a `EXPO_PUBLIC_API_URL` do app.
- **Saúde:** a imagem tem `HEALTHCHECK` (GET /); veja com `docker compose ps`.

**CI/CD** (as variáveis são lidas pelo compose):

```bash
# CI: build com cache de camadas e push da imagem versionada pelo commit
export IMAGEM_BACKEND=registro.exemplo.com/wow/backend TAG_IMAGEM=$GITHUB_SHA COMMIT_SHA=$GITHUB_SHA
docker compose build            # com BuildKit; o cache do npm é reaproveitado
docker compose push

# CD (no servidor): baixa a imagem e atualiza sem rebuild
docker compose pull
docker compose up -d --no-build
```

Para cache entre execuções do CI, use `docker buildx build --cache-from type=gha --cache-to type=gha,mode=max` no alvo `runtime`.

## Testes

```bash
npm run test        # unitários
npm run test:e2e    # e2e (precisa de Docker — sobe um Postgres via Testcontainers)
```

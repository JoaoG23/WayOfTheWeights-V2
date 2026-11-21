# syntax=docker/dockerfile:1.7

# Imagem do backend em estágios, pensada para CI/CD: camadas de dependências
# só são refeitas quando o package-lock muda, o cache do npm é reaproveitado
# entre builds (BuildKit) e a imagem final leva só o necessário para rodar.
#
# Alvos:
#   runtime   -> API (padrão de produção)
#   migracao  -> executa "prisma migrate deploy" e termina
#   dev       -> desenvolvimento com hot reload (docker-compose.dev.yml)
ARG NODE_VERSION=22

FROM node:${NODE_VERSION}-bookworm-slim AS base
WORKDIR /app

# Dependências completas (dev inclusas): usadas para compilar e migrar.
# --ignore-scripts: o postinstall (prisma generate) roda explicitamente abaixo.
FROM base AS deps
COPY package.json package-lock.json ./
RUN --mount=type=cache,target=/root/.npm npm ci --ignore-scripts

# Desenvolvimento (docker-compose.dev.yml): só as dependências; o código vem
# do host por volume e roda com hot reload.
FROM deps AS dev
ENV NODE_ENV=development
CMD ["npm", "run", "start:dev"]

# Compila o TypeScript (gera antes o client do Prisma em src/generated).
FROM deps AS build
COPY prisma ./prisma
COPY prisma.config.ts tsconfig.json tsconfig.build.json nest-cli.json ./
COPY src ./src
# O generate não conecta ao banco; a URL é só para a configuração carregar.
RUN DATABASE_URL="postgresql://usuario:senha@localhost:5432/banco" npx prisma generate \
    && npm run build

# Só as dependências de produção.
FROM base AS prod-deps
ENV NODE_ENV=production
COPY package.json package-lock.json ./
RUN --mount=type=cache,target=/root/.npm npm ci --omit=dev --ignore-scripts

# Aplica as migrations no banco e termina (serviço "migrar" do compose).
FROM deps AS migracao
ENV NODE_ENV=production
COPY prisma ./prisma
COPY prisma.config.ts ./
USER node
CMD ["node_modules/.bin/prisma", "migrate", "deploy"]

# API em produção: usuário sem privilégios, sem ferramentas de build.
FROM base AS runtime
ARG COMMIT_SHA=desconhecido
LABEL org.opencontainers.image.title="wayoftheweights-backend" \
      org.opencontainers.image.revision="${COMMIT_SHA}"
ENV NODE_ENV=production \
    PORT=3001 \
    UPLOADS_DIR=/app/uploads

COPY --from=prod-deps --chown=node:node /app/node_modules ./node_modules
COPY --from=build --chown=node:node /app/dist ./dist
COPY --chown=node:node package.json ./
# Pasta das fotos de perfil; no compose é mapeada para um diretório do host.
RUN mkdir -p /app/uploads && chown node:node /app/uploads

USER node
EXPOSE 3001

HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:'+(process.env.PORT||3000)).then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

CMD ["node", "dist/src/main.js"]

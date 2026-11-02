-- CreateEnum
CREATE TYPE "PerfilUsuario" AS ENUM ('ADMINISTRADOR', 'TREINADOR', 'ALUNO');

-- CreateEnum
CREATE TYPE "PlanoConta" AS ENUM ('BASICO', 'BETA');

-- CreateTable
CREATE TABLE "contas" (
    "id" SERIAL NOT NULL,
    "plano" "PlanoConta" NOT NULL DEFAULT 'BASICO',
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizado_em" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "contas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "usuarios" (
    "id" SERIAL NOT NULL,
    "conta_id" INTEGER NOT NULL,
    "nome" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "senha_hash" TEXT NOT NULL,
    "perfil" "PerfilUsuario" NOT NULL DEFAULT 'ALUNO',
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "proprietario" BOOLEAN NOT NULL DEFAULT false,
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizado_em" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "usuarios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "treinos" (
    "id" SERIAL NOT NULL,
    "usuario_id" INTEGER NOT NULL,
    "titulo" TEXT NOT NULL,
    "descricao" TEXT,
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizado_em" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "treinos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "exercicios" (
    "id" SERIAL NOT NULL,
    "treino_id" INTEGER NOT NULL,
    "nome" TEXT NOT NULL,
    "carga_atual" DOUBLE PRECISION NOT NULL,
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizado_em" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "exercicios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "historico_cargas" (
    "id" SERIAL NOT NULL,
    "exercicio_id" INTEGER NOT NULL,
    "carga" DOUBLE PRECISION NOT NULL,
    "registrado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "historico_cargas_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_email_key" ON "usuarios"("email");

-- CreateIndex
CREATE INDEX "usuarios_conta_id_perfil_idx" ON "usuarios"("conta_id", "perfil");

-- CreateIndex
CREATE INDEX "treinos_usuario_id_idx" ON "treinos"("usuario_id");

-- CreateIndex
CREATE INDEX "exercicios_treino_id_idx" ON "exercicios"("treino_id");

-- CreateIndex
CREATE INDEX "historico_cargas_exercicio_id_registrado_em_idx" ON "historico_cargas"("exercicio_id", "registrado_em");

-- AddForeignKey
ALTER TABLE "usuarios" ADD CONSTRAINT "usuarios_conta_id_fkey" FOREIGN KEY ("conta_id") REFERENCES "contas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "treinos" ADD CONSTRAINT "treinos_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exercicios" ADD CONSTRAINT "exercicios_treino_id_fkey" FOREIGN KEY ("treino_id") REFERENCES "treinos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "historico_cargas" ADD CONSTRAINT "historico_cargas_exercicio_id_fkey" FOREIGN KEY ("exercicio_id") REFERENCES "exercicios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

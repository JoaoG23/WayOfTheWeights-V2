-- CreateTable
CREATE TABLE "conclusoes_treino" (
    "id" SERIAL NOT NULL,
    "usuario_id" INTEGER NOT NULL,
    "subtreino_id" INTEGER,
    "titulo_treino" TEXT NOT NULL,
    "titulo_subtreino" TEXT NOT NULL,
    "concluido_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "conclusoes_treino_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "exercicios_concluidos" (
    "id" SERIAL NOT NULL,
    "conclusao_id" INTEGER NOT NULL,
    "nome" TEXT NOT NULL,
    "carga_kg" INTEGER NOT NULL,

    CONSTRAINT "exercicios_concluidos_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "conclusoes_treino_usuario_id_concluido_em_idx" ON "conclusoes_treino"("usuario_id", "concluido_em");

-- CreateIndex
CREATE INDEX "conclusoes_treino_subtreino_id_idx" ON "conclusoes_treino"("subtreino_id");

-- CreateIndex
CREATE INDEX "exercicios_concluidos_conclusao_id_idx" ON "exercicios_concluidos"("conclusao_id");

-- AddForeignKey
ALTER TABLE "conclusoes_treino" ADD CONSTRAINT "conclusoes_treino_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "conclusoes_treino" ADD CONSTRAINT "conclusoes_treino_subtreino_id_fkey" FOREIGN KEY ("subtreino_id") REFERENCES "subtreinos"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exercicios_concluidos" ADD CONSTRAINT "exercicios_concluidos_conclusao_id_fkey" FOREIGN KEY ("conclusao_id") REFERENCES "conclusoes_treino"("id") ON DELETE CASCADE ON UPDATE CASCADE;

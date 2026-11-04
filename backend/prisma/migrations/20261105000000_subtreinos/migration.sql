-- CreateTable
CREATE TABLE "subtreinos" (
    "id" SERIAL NOT NULL,
    "treino_id" INTEGER NOT NULL,
    "titulo" TEXT NOT NULL,
    "descricao" TEXT,
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizado_em" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "subtreinos_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "subtreinos_treino_id_idx" ON "subtreinos"("treino_id");

-- AddForeignKey
ALTER TABLE "subtreinos" ADD CONSTRAINT "subtreinos_treino_id_fkey" FOREIGN KEY ("treino_id") REFERENCES "treinos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Os exercícios passam a ficar dentro de um subtreino. Cada treino que já tem
-- exercícios ganha o subtreino "Geral", para onde os exercícios são movidos
-- (nenhum dado é perdido).
INSERT INTO "subtreinos" ("treino_id", "titulo", "atualizado_em")
SELECT DISTINCT "treino_id", 'Geral', CURRENT_TIMESTAMP FROM "exercicios";

-- AlterTable
ALTER TABLE "exercicios" ADD COLUMN "subtreino_id" INTEGER;

UPDATE "exercicios" SET "subtreino_id" = "subtreinos"."id"
FROM "subtreinos"
WHERE "subtreinos"."treino_id" = "exercicios"."treino_id";

ALTER TABLE "exercicios" ALTER COLUMN "subtreino_id" SET NOT NULL;

-- A coluna antiga leva junto o índice e a chave estrangeira dela.
ALTER TABLE "exercicios" DROP COLUMN "treino_id";

-- CreateIndex
CREATE INDEX "exercicios_subtreino_id_idx" ON "exercicios"("subtreino_id");

-- AddForeignKey
ALTER TABLE "exercicios" ADD CONSTRAINT "exercicios_subtreino_id_fkey" FOREIGN KEY ("subtreino_id") REFERENCES "subtreinos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

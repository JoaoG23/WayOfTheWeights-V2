-- CreateTable
CREATE TABLE "cargas" (
    "id" SERIAL NOT NULL,
    "valor" INTEGER NOT NULL,

    CONSTRAINT "cargas_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "cargas_valor_key" ON "cargas"("valor");

-- Catálogo compartilhado de cargas: 1 a 1500 kg inteiros (dados de
-- referência, existem em todo ambiente que aplicar as migrations).
INSERT INTO "cargas" ("valor") SELECT generate_series(1, 1500);

-- AlterTable: exercicios passa a referenciar o catálogo. A carga antiga é
-- convertida (arredondada e limitada a 1..1500) antes de a coluna sair, para
-- não perder dados existentes.
ALTER TABLE "exercicios" ADD COLUMN "carga_id" INTEGER;
UPDATE "exercicios" SET "carga_id" = "cargas"."id"
FROM "cargas"
WHERE "cargas"."valor" = LEAST(GREATEST(ROUND("exercicios"."carga_atual")::INTEGER, 1), 1500);
ALTER TABLE "exercicios" ALTER COLUMN "carga_id" SET NOT NULL;
ALTER TABLE "exercicios" DROP COLUMN "carga_atual";

-- AlterTable: mesma conversão para o histórico de cargas.
ALTER TABLE "historico_cargas" ADD COLUMN "carga_id" INTEGER;
UPDATE "historico_cargas" SET "carga_id" = "cargas"."id"
FROM "cargas"
WHERE "cargas"."valor" = LEAST(GREATEST(ROUND("historico_cargas"."carga")::INTEGER, 1), 1500);
ALTER TABLE "historico_cargas" ALTER COLUMN "carga_id" SET NOT NULL;
ALTER TABLE "historico_cargas" DROP COLUMN "carga";

-- AddForeignKey
ALTER TABLE "exercicios" ADD CONSTRAINT "exercicios_carga_id_fkey" FOREIGN KEY ("carga_id") REFERENCES "cargas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "historico_cargas" ADD CONSTRAINT "historico_cargas_carga_id_fkey" FOREIGN KEY ("carga_id") REFERENCES "cargas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

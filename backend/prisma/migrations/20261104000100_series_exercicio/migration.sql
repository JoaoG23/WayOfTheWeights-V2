-- CreateTable
CREATE TABLE "series" (
    "id" SERIAL NOT NULL,
    "exercicio_id" INTEGER NOT NULL,
    "repeticoes" INTEGER NOT NULL,
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizado_em" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "series_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "series_exercicio_id_idx" ON "series"("exercicio_id");

-- AddForeignKey
ALTER TABLE "series" ADD CONSTRAINT "series_exercicio_id_fkey" FOREIGN KEY ("exercicio_id") REFERENCES "exercicios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

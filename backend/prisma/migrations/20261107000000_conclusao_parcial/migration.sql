-- Total de exercícios do subtreino no momento da conclusão (permite conclusão parcial).
ALTER TABLE "conclusoes_treino" ADD COLUMN "total_exercicios" INTEGER;

-- Conclusões já registradas eram todas completas: o total é o que foi marcado.
UPDATE "conclusoes_treino" SET "total_exercicios" = (
    SELECT COUNT(*) FROM "exercicios_concluidos" WHERE "exercicios_concluidos"."conclusao_id" = "conclusoes_treino"."id"
);

ALTER TABLE "conclusoes_treino" ALTER COLUMN "total_exercicios" SET NOT NULL;

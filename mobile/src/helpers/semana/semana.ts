export const DIAS_NA_SEMANA = 7;
export const ROTULOS_DIAS_DA_SEMANA = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];

// Segunda-feira, 00:00 (hora local), da semana da data informada.
export const inicioDaSemana = (data: Date): Date => {
  const inicio = new Date(data.getFullYear(), data.getMonth(), data.getDate());
  const diasDesdeSegunda = (inicio.getDay() + 6) % 7;
  inicio.setDate(inicio.getDate() - diasDesdeSegunda);
  return inicio;
};

export const adicionarDias = (data: Date, quantidadeDias: number): Date => {
  const novaData = new Date(data);
  novaData.setDate(novaData.getDate() + quantidadeDias);
  return novaData;
};

export const ehMesmoDia = (dataA: Date, dataB: Date): boolean =>
  dataA.getFullYear() === dataB.getFullYear() &&
  dataA.getMonth() === dataB.getMonth() &&
  dataA.getDate() === dataB.getDate();

export const formatarDiaMes = (data: Date): string =>
  data.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });

export const formatarHora = (dataIso: string): string =>
  new Date(dataIso).toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  });

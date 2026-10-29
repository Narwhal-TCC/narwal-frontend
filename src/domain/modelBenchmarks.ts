/** Desempenho na avaliação de referência (75 alvos MILCO). */

export interface EndToEndConfusionRow {
  predictedMilco: number
  predictedNombo: number
  missed: number
}

export interface ModelBenchmark {
  /** Resumo curto exibido abaixo do seletor de modelo */
  summary: string
  /** Orientação em linguagem clara para o operador */
  narrative: string
  milcoTruth: EndToEndConfusionRow
  nomboTruth: EndToEndConfusionRow
  minesFound: number
  falseAlarms: number
  totalMines: number
}

const TOTAL_MINES = 75

export const MODEL_BENCHMARKS: Record<string, ModelBenchmark> = {
  'yolo-convnext-balanced': {
    minesFound: 53,
    falseAlarms: 11,
    totalMines: TOTAL_MINES,
    summary: '53 de 75 minas localizadas · 11 falsos alarmes',
    narrative:
      'Boa escolha para a rotina. Na avaliação de referência, achou a maior parte das minas com falsos alarmes moderados.',
    milcoTruth: { predictedMilco: 53, predictedNombo: 2, missed: 20 },
    nomboTruth: { predictedMilco: 2, predictedNombo: 15, missed: 17 },
  },
  'yolo-convnext-recall': {
    minesFound: 58,
    falseAlarms: 25,
    totalMines: TOTAL_MINES,
    summary: '58 de 75 minas localizadas · 25 falsos alarmes',
    narrative:
      'Use quando não perder minas é mais importante que reduzir alarmes. Na referência, achou mais minas que o equilibrado, com mais pontos a revisar.',
    milcoTruth: { predictedMilco: 58, predictedNombo: 2, missed: 15 },
    nomboTruth: { predictedMilco: 2, predictedNombo: 21, missed: 11 },
  },
  'two-stage-pt': {
    minesFound: 36,
    falseAlarms: 7,
    totalMines: TOTAL_MINES,
    summary: '36 de 75 minas localizadas · 7 falsos alarmes',
    narrative:
      'Gera poucos falsos alarmes na referência, mas deixa passar mais minas. Mantido para comparar com resultados de versões anteriores.',
    milcoTruth: { predictedMilco: 36, predictedNombo: 5, missed: 34 },
    nomboTruth: { predictedMilco: 3, predictedNombo: 9, missed: 22 },
  },
  'yolo-fusion-v3': {
    minesFound: 50,
    falseAlarms: 21,
    totalMines: TOTAL_MINES,
    summary: '50 de 75 minas localizadas · 21 falsos alarmes',
    narrative:
      'Opção alternativa mais recente: na referência, supera o legado em minas localizadas, com mais falsos alarmes que o equilibrado.',
    milcoTruth: { predictedMilco: 50, predictedNombo: 3, missed: 22 },
    nomboTruth: { predictedMilco: 1, predictedNombo: 21, missed: 12 },
  },
}

export function benchmarkForModel(modelId: string): ModelBenchmark | null {
  return MODEL_BENCHMARKS[modelId] ?? null
}

/**
 * Métricas só do classificador em recortes reais (sem perdas do detector).
 * Não são comparáveis com MODEL_BENCHMARKS.
 */
export interface ClassifierBenchmark {
  summary: string
  narrative: string
}

export const CLASSIFIER_BENCHMARKS: Record<string, ClassifierBenchmark> = {
  'yolo-fusion-mobilevit': {
    summary:
      'Classificador: 72 de 75 MILCO e 25 de 34 NOMBO corretos nos recortes de teste',
    narrative:
      'Usa o mesmo detector da v3. Ainda sem avaliação de referência completa: estes números medem só a classificação dos recortes e não contam minas que o detector deixa passar.',
  },
}

export function classifierBenchmarkForModel(
  modelId: string,
): ClassifierBenchmark | null {
  return CLASSIFIER_BENCHMARKS[modelId] ?? null
}

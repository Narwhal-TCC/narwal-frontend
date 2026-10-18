/** Desempenho ponta a ponta no conjunto de teste (75 objetos MILCO). Fonte: comparacao_final/dados.json */

export interface EndToEndConfusionRow {
  predictedMilco: number
  predictedNombo: number
  missed: number
}

export interface ModelBenchmark {
  /** Resumo curto exibido abaixo do seletor de pipeline */
  summary: string
  /** Parágrafo em linguagem clara para o operador */
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
    summary: '53 de 75 minas encontradas · 11 falsos alarmes',
    narrative:
      'Perfil equilibrado: boa taxa de achado de minas (71%) com relativamente poucos falsos alarmes. Indicado quando o operador quer reduzir alarmes desnecessários.',
    milcoTruth: { predictedMilco: 53, predictedNombo: 2, missed: 20 },
    nomboTruth: { predictedMilco: 2, predictedNombo: 15, missed: 17 },
  },
  'yolo-convnext-recall': {
    minesFound: 58,
    falseAlarms: 25,
    totalMines: TOTAL_MINES,
    summary: '58 de 75 minas encontradas · 25 falsos alarmes',
    narrative:
      'Perfil voltado ao recall: encontra mais minas (77%), porém com mais falsos alarmes. Use quando não perder um alvo real é mais crítico do que filtrar alarmes.',
    milcoTruth: { predictedMilco: 58, predictedNombo: 2, missed: 15 },
    nomboTruth: { predictedMilco: 2, predictedNombo: 21, missed: 11 },
  },
  'two-stage-pt': {
    minesFound: 36,
    falseAlarms: 7,
    totalMines: TOTAL_MINES,
    summary: '36 de 75 minas encontradas · 7 falsos alarmes',
    narrative:
      'Pipeline RetinaNet + fusão (legado): poucos falsos alarmes, porém acha menos minas no teste (48%). Útil como referência ou quando a prioridade é minimizar alarmes.',
    milcoTruth: { predictedMilco: 36, predictedNombo: 5, missed: 34 },
    nomboTruth: { predictedMilco: 3, predictedNombo: 9, missed: 22 },
  },
}

export function benchmarkForModel(modelId: string): ModelBenchmark | null {
  return MODEL_BENCHMARKS[modelId] ?? null
}

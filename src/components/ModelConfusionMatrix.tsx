import type { ModelBenchmark } from '../domain/modelBenchmarks'

interface ModelConfusionMatrixProps {
  benchmark: ModelBenchmark
}

function MatrixRow({
  rowLabel,
  row,
}: {
  rowLabel: string
  row: ModelBenchmark['milcoTruth']
}) {
  return (
    <tr className="border-t border-[color:var(--navi-border-subtle)]">
      <th
        scope="row"
        className="py-2 pr-2 text-left text-[11px] font-medium text-[color:var(--navi-muted)]"
      >
        {rowLabel}
      </th>
      <td className="px-2 py-2 text-center font-mono text-xs text-[color:var(--navi-text)]">
        {row.predictedMilco}
      </td>
      <td className="px-2 py-2 text-center font-mono text-xs text-[color:var(--navi-text)]">
        {row.predictedNombo}
      </td>
      <td className="px-2 py-2 text-center font-mono text-xs text-[color:var(--navi-muted)]">
        {row.missed}
      </td>
    </tr>
  )
}

export function ModelConfusionMatrix({ benchmark }: ModelConfusionMatrixProps) {
  return (
    <div className="pt-3">
      <p className="text-[11px] font-medium uppercase tracking-[0.66px] text-[color:var(--navi-muted)]">
        Destino dos objetos (teste)
      </p>
      <p className="pt-1 text-[11px] leading-[16px] text-[color:var(--navi-muted)]">
        Linhas = rótulo real · Colunas = o que o pipeline previu
      </p>
      <div className="mt-2 overflow-x-auto rounded-md border border-[color:var(--navi-border-subtle)] bg-[color:var(--navi-input-bg)]">
        <table className="w-full min-w-[280px] border-collapse text-[11px]">
          <thead>
            <tr>
              <th className="py-2 pr-2" />
              <th
                scope="col"
                className="px-2 py-2 text-center font-medium text-[color:var(--navi-milco)]"
              >
                MILCO
              </th>
              <th
                scope="col"
                className="px-2 py-2 text-center font-medium text-[color:var(--navi-nombo)]"
              >
                NOMBO
              </th>
              <th
                scope="col"
                className="px-2 py-2 text-center font-medium text-[color:var(--navi-muted)]"
              >
                Perdido
              </th>
            </tr>
          </thead>
          <tbody>
            <MatrixRow rowLabel="Verdade MILCO" row={benchmark.milcoTruth} />
            <MatrixRow rowLabel="Verdade NOMBO" row={benchmark.nomboTruth} />
          </tbody>
        </table>
      </div>
    </div>
  )
}

import { ModelConfusionMatrix } from './ModelConfusionMatrix'
import {
  benchmarkForModel,
  classifierBenchmarkForModel,
} from '../domain/modelBenchmarks'
import type { ModelCatalogItem } from '../api/models'

interface ModelBenchmarkDetailsProps {
  modelId: string | null | undefined
  catalogItem: ModelCatalogItem | undefined
  catalogLabel: string
}

export function ModelBenchmarkDetails({
  modelId,
  catalogItem,
  catalogLabel,
}: ModelBenchmarkDetailsProps) {
  if (!modelId) {
    return (
      <p className="text-[13px] leading-[20px] text-[color:var(--navi-muted)]">
        Modelo não informado para esta análise.
      </p>
    )
  }

  const benchmark = benchmarkForModel(modelId)
  const classifierBenchmark =
    !benchmark ? classifierBenchmarkForModel(modelId) : null
  const summaryLine =
    benchmark?.summary ??
    classifierBenchmark?.summary ??
    catalogItem?.description ??
    null

  return (
    <div className="flex flex-col gap-3">
      <p
        data-testid="analysis-model-label"
        className="text-sm text-[color:var(--navi-text)]"
      >
        <span className="text-[color:var(--navi-muted)]">Modelo: </span>
        {catalogLabel || modelId}
      </p>
      {summaryLine ? (
        <p className="text-[13px] leading-[20px] text-[color:var(--navi-text)]">
          {summaryLine}
        </p>
      ) : (
        <p className="text-[13px] leading-[20px] text-[color:var(--navi-muted)]">
          Sem descrição disponível para este modelo.
        </p>
      )}
      {classifierBenchmark ? (
        <p className="text-[13px] leading-[20px] text-[color:var(--navi-muted)]">
          {classifierBenchmark.narrative}
        </p>
      ) : benchmark ? (
        <>
          <p className="text-[13px] leading-[20px] text-[color:var(--navi-muted)]">
            {benchmark.narrative}
          </p>
          <ModelConfusionMatrix benchmark={benchmark} />
        </>
      ) : null}
    </div>
  )
}

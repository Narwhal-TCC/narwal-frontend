import type { AnalysisResult } from '../../api/analyses'
import { ModelBenchmarkDetails } from '../../components/ModelBenchmarkDetails'
import { useModels } from '../../models/useModels'

interface ResultadoModelTabProps {
  analysis: AnalysisResult
}

export function ResultadoModelTab({ analysis }: ResultadoModelTabProps) {
  const { models, labelFor } = useModels()
  const modelId = analysis.model_id
  const catalogItem = modelId
    ? models.find((model) => model.id === modelId)
    : undefined

  return (
    <section aria-label="Modelo" className="flex flex-col gap-3">
      <ModelBenchmarkDetails
        modelId={modelId}
        catalogItem={catalogItem}
        catalogLabel={labelFor(modelId)}
      />
    </section>
  )
}

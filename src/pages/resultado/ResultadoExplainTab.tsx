import type { ReactNode } from 'react'
import type { AiAnalysis } from '../../api/analyses'
import type { Detection } from '../../domain/classification'
import {
  formatDetectionHeading,
  humanizeAiDetectionText,
} from '../../domain/detectionDisplay'

const UNAVAILABLE_MESSAGE =
  'Análise de IA indisponível para esta detecção.'
const DISCLAIMER =
  'Gerado por IA — apoio à decisão, não substitui a avaliação do operador.'

interface ResultadoExplainTabProps {
  aiAnalysis?: AiAnalysis | null
  detections?: Detection[]
}

function ExplainSection({
  title,
  children,
}: {
  title: string
  children: ReactNode
}) {
  return (
    <div>
      <p className="text-[11px] font-medium uppercase tracking-[0.66px] text-[color:var(--navi-muted)]">
        {title}
      </p>
      <div className="pt-3 text-sm leading-[22px] text-[color:var(--navi-text)]">
        {children}
      </div>
    </div>
  )
}

function humanizeOptional(
  text: string | null | undefined,
  detectionCount: number,
): string | null {
  if (!text) return null
  return humanizeAiDetectionText(text, detectionCount)
}

export function ResultadoExplainTab({
  aiAnalysis,
  detections = [],
}: ResultadoExplainTabProps = {}) {
  const isReady = aiAnalysis?.status === 'ready'
  const detectionCount = detections.length

  return (
    <section aria-label="Explicação" className="flex flex-col gap-5">
      <p className="text-[11px] font-medium uppercase tracking-[0.66px] text-[color:var(--navi-muted)]">
        Por que o modelo classificou assim?
      </p>

      {!isReady ? (
        <p
          className="text-sm leading-[22px] text-[color:var(--navi-muted)]"
          role="status"
        >
          {UNAVAILABLE_MESSAGE}
        </p>
      ) : (
        <>
          {aiAnalysis.summary ? (
            <ExplainSection title="Resumo">
              {humanizeOptional(aiAnalysis.summary, detectionCount)}
            </ExplainSection>
          ) : null}

          {aiAnalysis.detections.length > 0 ? (
            <ExplainSection title="Detecções">
              <ul className="flex list-none flex-col gap-3 p-0">
                {aiAnalysis.detections.map((detectionNote) => {
                  const source = detections[detectionNote.index]
                  return (
                    <li key={detectionNote.index}>
                      <p className="text-[11px] font-medium text-[color:var(--navi-muted)]">
                        {formatDetectionHeading(detectionNote.index, source)}
                      </p>
                      <p className="pt-1">
                        {humanizeOptional(detectionNote.note, detectionCount)}
                      </p>
                    </li>
                  )
                })}
              </ul>
            </ExplainSection>
          ) : null}

          {aiAnalysis.recommendation ? (
            <ExplainSection title="Recomendação">
              {humanizeOptional(aiAnalysis.recommendation, detectionCount)}
            </ExplainSection>
          ) : null}

          {aiAnalysis.caveats.length > 0 ? (
            <ExplainSection title="Limitações">
              <ul className="list-disc pl-5">
                {aiAnalysis.caveats.map((caveat) => (
                  <li key={caveat}>
                    {humanizeOptional(caveat, detectionCount)}
                  </li>
                ))}
              </ul>
            </ExplainSection>
          ) : null}

          <p className="text-xs leading-[18px] text-[color:var(--navi-muted)]">
            {DISCLAIMER}
          </p>
        </>
      )}
    </section>
  )
}

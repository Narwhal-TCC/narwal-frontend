import type { ReactNode } from 'react'
import type { AiAnalysis } from '../../api/analyses'

const UNAVAILABLE_MESSAGE =
  'Análise de IA indisponível para esta detecção.'
const DISCLAIMER =
  'Gerado por IA — apoio à decisão, não substitui a avaliação do operador.'

interface ResultadoExplainTabProps {
  aiAnalysis?: AiAnalysis | null
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

export function ResultadoExplainTab({
  aiAnalysis,
}: ResultadoExplainTabProps = {}) {
  const isReady = aiAnalysis?.status === 'ready'

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
            <ExplainSection title="Resumo">{aiAnalysis.summary}</ExplainSection>
          ) : null}

          {aiAnalysis.detections.length > 0 ? (
            <ExplainSection title="Detecções">
              <ul className="flex list-none flex-col gap-3 p-0">
                {aiAnalysis.detections.map((detection) => (
                  <li key={detection.index}>
                    <p className="text-[11px] font-medium text-[color:var(--navi-muted)]">
                      Detecção {detection.index + 1}
                    </p>
                    <p className="pt-1">{detection.note}</p>
                  </li>
                ))}
              </ul>
            </ExplainSection>
          ) : null}

          {aiAnalysis.recommendation ? (
            <ExplainSection title="Recomendação">
              {aiAnalysis.recommendation}
            </ExplainSection>
          ) : null}

          {aiAnalysis.caveats.length > 0 ? (
            <ExplainSection title="Limitações">
              <ul className="list-disc pl-5">
                {aiAnalysis.caveats.map((caveat) => (
                  <li key={caveat}>{caveat}</li>
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

import { useState, type ReactNode } from 'react'
import { MAP_MARKER_COLORS } from '../domain/detectionDisplay'

function LegendSwatch({
  color,
  filled,
  shape = 'circle',
}: {
  color: string
  filled: boolean
  shape?: 'circle' | 'box'
}) {
  if (shape === 'box') {
    return (
      <span
        aria-hidden
        className="inline-block size-3.5 shrink-0 rounded-sm border-2"
        style={{
          borderColor: color,
          backgroundColor: filled ? color : 'transparent',
          opacity: filled ? 0.25 : 1,
        }}
      />
    )
  }
  return (
    <span
      aria-hidden
      className="inline-block size-3.5 shrink-0 rounded-full border-2"
      style={{
        borderColor: color,
        backgroundColor: filled ? color : 'transparent',
        opacity: filled ? 0.9 : 1,
      }}
    />
  )
}

function LegendSection({
  title,
  children,
}: {
  title: string
  children: ReactNode
}) {
  return (
    <section className="space-y-2">
      <h3 className="text-[10px] font-semibold uppercase tracking-[0.55px] text-[color:var(--navi-muted)]">
        {title}
      </h3>
      <ul className="space-y-2">{children}</ul>
    </section>
  )
}

function LegendEntry({
  swatch,
  label,
  hint,
}: {
  swatch: ReactNode
  label: string
  hint?: string
}) {
  return (
    <li className="flex items-center gap-2.5 text-xs text-[color:var(--navi-text)]">
      {swatch}
      <span className="min-w-0 leading-snug">
        {label}
        {hint ? (
          <span className="text-[color:var(--navi-muted)]"> ({hint})</span>
        ) : null}
      </span>
    </li>
  )
}

export function CampaignMapLegend() {
  const [open, setOpen] = useState(true)

  if (!open) {
    return (
      <button
        type="button"
        data-testid="campaign-map-legend-open"
        aria-label="Mostrar legenda do mapa"
        onClick={() => setOpen(true)}
        className="absolute bottom-4 right-4 z-[1000] rounded-md border border-[color:var(--navi-border-strong)] bg-[color:var(--navi-panel)] px-3 py-1.5 text-xs font-semibold text-[color:var(--navi-text)] shadow-md transition hover:border-[color:var(--navi-link)] hover:shadow-lg"
      >
        Legenda
      </button>
    )
  }

  return (
    <div
      data-testid="campaign-map-legend"
      className="absolute bottom-4 right-4 z-[1000] w-[min(100%-2rem,320px)] overflow-hidden rounded-lg border border-[color:var(--navi-border)] bg-[color:var(--navi-panel)] shadow-md"
    >
      <div className="flex items-center justify-between gap-2 border-b border-[color:var(--navi-border-subtle)] px-3 py-2.5">
        <p className="text-sm font-semibold text-[color:var(--navi-text)]">
          Legenda
        </p>
        <button
          type="button"
          data-testid="campaign-map-legend-close"
          aria-label="Ocultar legenda"
          onClick={() => setOpen(false)}
          className="flex size-7 items-center justify-center rounded-md border border-[color:var(--navi-border-subtle)] text-sm font-semibold text-[color:var(--navi-muted)] transition hover:border-[color:var(--navi-border-strong)] hover:bg-[color:var(--navi-surface-tint)] hover:text-[color:var(--navi-text)]"
        >
          ×
        </button>
      </div>

      <div className="space-y-4 px-3 py-3">
        <LegendSection title="Classes">
          <LegendEntry
            swatch={
              <LegendSwatch color={MAP_MARKER_COLORS.MILCO} filled />
            }
            label="MILCO"
          />
          <LegendEntry
            swatch={
              <LegendSwatch color={MAP_MARKER_COLORS.NOMBO} filled />
            }
            label="NOMBO"
          />
          <LegendEntry
            swatch={
              <LegendSwatch color={MAP_MARKER_COLORS.none} filled />
            }
            label="Sem classe"
          />
        </LegendSection>

        <LegendSection title="Geometria e origem">
          <LegendEntry
            swatch={
              <LegendSwatch
                color="var(--navi-accent)"
                filled={false}
                shape="box"
              />
            }
            label="Área da campanha"
            hint="Contorno"
          />
          <LegendEntry
            swatch={
              <LegendSwatch color={MAP_MARKER_COLORS.MILCO} filled />
            }
            label="Coord. informada"
            hint="Preenchido"
          />
          <LegendEntry
            swatch={
              <LegendSwatch color={MAP_MARKER_COLORS.MILCO} filled={false} />
            }
            label="Coord. simulada"
            hint="Contorno"
          />
        </LegendSection>
      </div>
    </div>
  )
}

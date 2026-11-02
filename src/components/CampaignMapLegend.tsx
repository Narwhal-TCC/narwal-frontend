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
        className="inline-block size-3 shrink-0 rounded-sm border-2"
        style={{
          borderColor: color,
          backgroundColor: filled ? color : 'transparent',
          opacity: filled ? 0.35 : 1,
        }}
      />
    )
  }
  return (
    <span
      aria-hidden
      className="inline-block size-3 shrink-0 rounded-full border-2"
      style={{
        borderColor: color,
        backgroundColor: filled ? color : 'transparent',
      }}
    />
  )
}

function LegendRow({
  swatch,
  label,
}: {
  swatch: ReactNode
  label: string
}) {
  return (
    <div className="flex items-center gap-2 text-xs text-[color:var(--navi-text)]">
      {swatch}
      <span className="leading-tight">{label}</span>
    </div>
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
        className="absolute bottom-4 right-4 z-[1000] rounded-md border border-[color:var(--navi-border)] bg-[color:var(--navi-panel)] px-3 py-1.5 text-xs font-medium text-[color:var(--navi-link)] shadow-md hover:bg-[color:var(--navi-surface-tint)]"
      >
        Legenda
      </button>
    )
  }

  return (
    <div
      data-testid="campaign-map-legend"
      className="absolute bottom-4 right-4 z-[1000] w-[min(100%-2rem,300px)] rounded-lg border border-[color:var(--navi-border)] bg-[color:var(--navi-panel)] p-3 shadow-md"
    >
      <div className="mb-2.5 flex items-start justify-between gap-2">
        <p className="text-sm font-semibold text-[color:var(--navi-text)]">
          Legenda
        </p>
        <button
          type="button"
          data-testid="campaign-map-legend-close"
          aria-label="Ocultar legenda"
          onClick={() => setOpen(false)}
          className="leading-none text-lg text-[color:var(--navi-muted)] hover:text-[color:var(--navi-text)]"
        >
          ×
        </button>
      </div>

      <div className="grid grid-cols-2 gap-x-3 gap-y-2">
        <LegendRow
          swatch={
            <LegendSwatch color={MAP_MARKER_COLORS.MILCO} filled />
          }
          label="MILCO"
        />
        <LegendRow
          swatch={
            <LegendSwatch color={MAP_MARKER_COLORS.NOMBO} filled />
          }
          label="NOMBO"
        />
        <LegendRow
          swatch={
            <LegendSwatch color={MAP_MARKER_COLORS.none} filled />
          }
          label="Sem classe"
        />
        <LegendRow
          swatch={
            <LegendSwatch
              color="var(--navi-accent)"
              filled={false}
              shape="box"
            />
          }
          label="Área da campanha"
        />
        <LegendRow
          swatch={
            <LegendSwatch color={MAP_MARKER_COLORS.MILCO} filled />
          }
          label="Coord. informada"
        />
        <LegendRow
          swatch={
            <LegendSwatch color={MAP_MARKER_COLORS.MILCO} filled={false} />
          }
          label="Coord. simulada"
        />
      </div>
    </div>
  )
}

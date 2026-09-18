import { classifyDetection, type Detection } from '../../domain/classification'

export function DetectionBadge({ detection }: { detection: Detection }) {
  const detectionClass = classifyDetection(detection)

  return (
    <span
      data-testid={`detection-badge-${detectionClass.toLowerCase()}`}
      className={[
        'rounded px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide',
        detectionClass === 'MILCO'
          ? 'bg-[color-mix(in_srgb,var(--navi-milco)_20%,transparent)] text-[color:var(--navi-milco)]'
          : 'bg-[color-mix(in_srgb,var(--navi-nombo)_20%,transparent)] text-[color:var(--navi-nombo)]',
      ].join(' ')}
    >
      {detectionClass}
    </span>
  )
}

import { useCallback, useEffect, useRef, useState } from 'react'
import type { Detection } from '../api/analyses'
import { classifyDetection } from '../domain/classification'

interface DetectionOverlayProps {
  detections: Detection[]
  imageUrl: string | null
  naturalWidth?: number
  naturalHeight?: number
  imageClassName?: string
  highlightedIndex?: number | null
}

function formatBoxLabel(detectionClass: 'MILCO' | 'NOMBO', confidence: number): string {
  const percent = (confidence * 100).toFixed(1)
  return `${detectionClass} ${percent}%`
}

interface RenderMetrics {
  scale: number
  offsetX: number
  offsetY: number
  naturalWidth: number
  naturalHeight: number
}

function computePaintedMetrics(
  clientWidth: number,
  clientHeight: number,
  naturalWidth: number,
  naturalHeight: number,
): RenderMetrics {
  const scale = Math.min(clientWidth / naturalWidth, clientHeight / naturalHeight)
  const paintedWidth = naturalWidth * scale
  const paintedHeight = naturalHeight * scale

  return {
    scale,
    offsetX: (clientWidth - paintedWidth) / 2,
    offsetY: (clientHeight - paintedHeight) / 2,
    naturalWidth,
    naturalHeight,
  }
}

function classColor(detectionClass: 'MILCO' | 'NOMBO'): string {
  return detectionClass === 'MILCO' ? 'var(--navi-milco)' : 'var(--navi-nombo)'
}

function boxPlacement(
  detection: Detection,
  metrics: RenderMetrics,
): Pick<React.CSSProperties, 'left' | 'top' | 'width' | 'height'> {
  const { scale, offsetX, offsetY } = metrics
  return {
    left: `${offsetX + detection.x1 * scale}px`,
    top: `${offsetY + detection.y1 * scale}px`,
    width: `${(detection.x2 - detection.x1) * scale}px`,
    height: `${(detection.y2 - detection.y1) * scale}px`,
  }
}

function frameStyle(
  color: string,
  emphasis: 'default' | 'highlighted' | 'dimmed',
): React.CSSProperties {
  const isHighlighted = emphasis === 'highlighted'
  return {
    width: '100%',
    height: '100%',
    borderStyle: 'solid',
    borderColor: color,
    borderWidth: '3px',
    backgroundColor: 'transparent',
    boxSizing: 'border-box',
  }
}

function labelStyle(
  color: string,
  emphasis: 'default' | 'highlighted' | 'dimmed',
): React.CSSProperties {
  const isHighlighted = emphasis === 'highlighted'
  return {
    backgroundColor: color,
    color: 'var(--navi-button-text)',
    fontSize: isHighlighted ? '14px' : '12px',
    padding: isHighlighted ? '4px 8px' : '3px 7px',
    lineHeight: 1.2,
    fontWeight: 700,
    letterSpacing: '0.04em',
    textTransform: 'uppercase',
  }
}

export function DetectionOverlay({
  detections,
  imageUrl,
  naturalWidth: naturalWidthProp,
  naturalHeight: naturalHeightProp,
  imageClassName,
  highlightedIndex = null,
}: DetectionOverlayProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const imgRef = useRef<HTMLImageElement>(null)
  const [metrics, setMetrics] = useState<RenderMetrics | null>(null)

  const syncMetrics = useCallback(() => {
    const img = imgRef.current
    if (!img) return

    const naturalWidth = img.naturalWidth || naturalWidthProp || 0
    const naturalHeight = img.naturalHeight || naturalHeightProp || 0
    if (!naturalWidth || !naturalHeight) return

    const clientWidth = img.clientWidth || naturalWidth
    const clientHeight =
      img.clientHeight || (clientWidth / naturalWidth) * naturalHeight

    setMetrics(
      computePaintedMetrics(clientWidth, clientHeight, naturalWidth, naturalHeight),
    )
  }, [naturalWidthProp, naturalHeightProp])

  useEffect(() => {
    syncMetrics()

    const target = containerRef.current
    if (!target || typeof ResizeObserver === 'undefined') {
      return
    }

    const observer = new ResizeObserver(() => syncMetrics())
    observer.observe(target)
    return () => observer.disconnect()
  }, [syncMetrics, imageUrl])

  if (!imageUrl) {
    return (
      <div
        data-testid="detection-placeholder"
        className="flex aspect-[4/3] w-full items-center justify-center rounded-lg border border-[color:var(--navi-border-subtle)] bg-[color:var(--navi-panel)] text-sm text-[color:var(--navi-muted)]"
      >
        Imagem indisponível
      </div>
    )
  }

  const imageClasses = ['block h-auto w-full rounded-lg', imageClassName]
    .filter(Boolean)
    .join(' ')

  return (
    <div
      ref={containerRef}
      data-testid="detection-overlay"
      className="relative w-full overflow-visible rounded-lg bg-[color:var(--navi-image-bg)]"
    >
      <img
        ref={imgRef}
        src={imageUrl}
        alt="Imagem de sonar analisada"
        className={imageClasses}
        onLoad={syncMetrics}
      />
      {metrics
        ? detections.map((detection, index) => {
            const detectionClass = classifyDetection(detection)
            const isHighlighted = highlightedIndex === index
            const isDimmed =
              highlightedIndex !== null && highlightedIndex !== index
            const emphasis = isHighlighted
              ? 'highlighted'
              : isDimmed
                ? 'dimmed'
                : 'default'
            const label = formatBoxLabel(detectionClass, detection.confidence)
            const color = classColor(detectionClass)
            const placement = boxPlacement(detection, metrics)

            return (
              <div
                key={`${detection.x1}-${detection.y1}-${index}`}
                data-testid="detection-box"
                data-class={detectionClass}
                data-highlighted={isHighlighted ? 'true' : 'false'}
                style={{
                  position: 'absolute',
                  ...placement,
                  pointerEvents: 'none',
                  overflow: 'visible',
                  opacity: isDimmed ? 0.38 : 1,
                  zIndex: isHighlighted ? 2 : 1,
                }}
              >
                <span
                  data-testid="detection-box-label"
                  className="absolute bottom-full left-1/2 mb-1 w-max max-w-none -translate-x-1/2 whitespace-nowrap rounded-sm"
                  style={labelStyle(color, emphasis)}
                >
                  {label}
                </span>
                <div
                  data-testid="detection-box-frame"
                  aria-hidden
                  style={frameStyle(color, emphasis)}
                />
              </div>
            )
          })
        : null}
    </div>
  )
}

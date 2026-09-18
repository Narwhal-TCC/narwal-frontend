import { useCallback, useEffect, useRef, useState } from 'react'
import type { Detection } from '../api/analyses'
import { classifyDetection } from '../domain/classification'

interface DetectionOverlayProps {
  detections: Detection[]
  imageUrl: string | null
  naturalWidth?: number
  naturalHeight?: number
  imageClassName?: string
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

function boxStyle(
  detection: Detection,
  metrics: RenderMetrics,
  detectionClass: 'MILCO' | 'NOMBO',
): React.CSSProperties {
  const { scale, offsetX, offsetY } = metrics

  return {
    position: 'absolute',
    left: `${offsetX + detection.x1 * scale}px`,
    top: `${offsetY + detection.y1 * scale}px`,
    width: `${(detection.x2 - detection.x1) * scale}px`,
    height: `${(detection.y2 - detection.y1) * scale}px`,
    borderWidth: '2px',
    borderStyle: 'solid',
    borderColor:
      detectionClass === 'MILCO'
        ? 'var(--navi-milco)'
        : 'var(--navi-nombo)',
    backgroundColor:
      detectionClass === 'MILCO'
        ? 'color-mix(in srgb, var(--navi-milco) 15%, transparent)'
        : 'color-mix(in srgb, var(--navi-nombo) 15%, transparent)',
  }
}

export function DetectionOverlay({
  detections,
  imageUrl,
  naturalWidth: naturalWidthProp,
  naturalHeight: naturalHeightProp,
  imageClassName,
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

  const imageClasses = ['block h-auto w-full', imageClassName].filter(Boolean).join(' ')

  return (
    <div
      ref={containerRef}
      data-testid="detection-overlay"
      className="relative w-full overflow-hidden rounded-lg bg-[color:var(--navi-image-bg)]"
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
            return (
              <div
                key={`${detection.x1}-${detection.y1}-${index}`}
                data-testid="detection-box"
                data-class={detectionClass}
                style={boxStyle(detection, metrics, detectionClass)}
              />
            )
          })
        : null}
    </div>
  )
}

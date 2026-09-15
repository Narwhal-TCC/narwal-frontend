import { useEffect, useRef, useState } from 'react'
import type { Detection } from '../api/analyses'
import { classifyDetection } from '../domain/classification'

interface DetectionOverlayProps {
  detections: Detection[]
  imageUrl: string | null
  naturalWidth?: number
  naturalHeight?: number
}

interface RenderMetrics {
  width: number
  height: number
  naturalWidth: number
  naturalHeight: number
}

function boxStyle(
  detection: Detection,
  metrics: RenderMetrics,
  detectionClass: 'MILCO' | 'NOMBO',
): React.CSSProperties {
  const { width, height, naturalWidth, naturalHeight } = metrics
  const scaleX = width / naturalWidth
  const scaleY = height / naturalHeight

  return {
    position: 'absolute',
    left: `${detection.x1 * scaleX}px`,
    top: `${detection.y1 * scaleY}px`,
    width: `${(detection.x2 - detection.x1) * scaleX}px`,
    height: `${(detection.y2 - detection.y1) * scaleY}px`,
    borderWidth: '2px',
    borderStyle: 'solid',
    borderColor: detectionClass === 'MILCO' ? '#e8836a' : '#6f9ceb',
    backgroundColor:
      detectionClass === 'MILCO'
        ? 'rgba(232, 131, 106, 0.15)'
        : 'rgba(111, 156, 235, 0.15)',
  }
}

export function DetectionOverlay({
  detections,
  imageUrl,
  naturalWidth: naturalWidthProp,
  naturalHeight: naturalHeightProp,
}: DetectionOverlayProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [metrics, setMetrics] = useState<RenderMetrics | null>(null)

  useEffect(() => {
    if (!containerRef.current || !naturalWidthProp || !naturalHeightProp) return

    const updateMetrics = (width: number) => {
      const height = (width / naturalWidthProp) * naturalHeightProp
      setMetrics({
        width,
        height,
        naturalWidth: naturalWidthProp,
        naturalHeight: naturalHeightProp,
      })
    }

    updateMetrics(containerRef.current.clientWidth || naturalWidthProp)

    if (typeof ResizeObserver === 'undefined') {
      return
    }

    const observer = new ResizeObserver(([entry]) => {
      const { width } = entry.contentRect
      if (width > 0) updateMetrics(width)
    })

    observer.observe(containerRef.current)
    return () => observer.disconnect()
  }, [naturalWidthProp, naturalHeightProp, imageUrl])

  if (!imageUrl) {
    return (
      <div
        data-testid="detection-placeholder"
        className="flex aspect-[4/3] w-full items-center justify-center rounded-lg border border-[rgba(111,156,235,0.15)] bg-[#1c2654] text-sm text-[color:var(--navi-muted)]"
      >
        Imagem indisponível
      </div>
    )
  }

  return (
    <div
      ref={containerRef}
      data-testid="detection-overlay"
      className="relative w-full overflow-hidden rounded-lg bg-[#0d1330]"
    >
      <img
        src={imageUrl}
        alt="Imagem de sonar analisada"
        className="block h-auto w-full"
        onLoad={(event) => {
          const img = event.currentTarget
          const width = containerRef.current?.clientWidth ?? img.clientWidth
          const height = img.clientHeight
          setMetrics({
            width,
            height,
            naturalWidth: img.naturalWidth,
            naturalHeight: img.naturalHeight,
          })
        }}
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

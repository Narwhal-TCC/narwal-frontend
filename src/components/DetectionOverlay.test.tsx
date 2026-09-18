import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { DetectionOverlay } from './DetectionOverlay'

const sampleDetections = [
  { x1: 10, y1: 20, x2: 110, y2: 120, confidence: 0.9, label: 'obj' },
]

function mockImageMetrics(
  img: HTMLImageElement,
  {
    clientWidth,
    clientHeight,
    naturalWidth,
    naturalHeight,
  }: {
    clientWidth: number
    clientHeight: number
    naturalWidth: number
    naturalHeight: number
  },
) {
  Object.defineProperty(img, 'clientWidth', { configurable: true, value: clientWidth })
  Object.defineProperty(img, 'clientHeight', { configurable: true, value: clientHeight })
  Object.defineProperty(img, 'naturalWidth', { configurable: true, value: naturalWidth })
  Object.defineProperty(img, 'naturalHeight', { configurable: true, value: naturalHeight })
}

describe('DetectionOverlay', () => {
  it('shows placeholder when image url is null', () => {
    render(<DetectionOverlay detections={sampleDetections} imageUrl={null} />)

    expect(screen.getByTestId('detection-placeholder')).toHaveTextContent(
      'Imagem indisponível',
    )
    expect(screen.queryByTestId('detection-box')).not.toBeInTheDocument()
  })

  it('renders no boxes when detections list is empty', () => {
    render(
      <DetectionOverlay
        detections={[]}
        imageUrl="https://example.com/sonar.png"
        naturalWidth={200}
        naturalHeight={100}
      />,
    )

    expect(screen.getByTestId('detection-overlay')).toBeInTheDocument()
    expect(screen.queryByTestId('detection-box')).not.toBeInTheDocument()
  })

  it('scales box geometry from natural coordinates to painted image size', () => {
    render(
      <DetectionOverlay
        detections={sampleDetections}
        imageUrl="https://example.com/sonar.png"
        naturalWidth={200}
        naturalHeight={100}
      />,
    )

    const box = screen.getByTestId('detection-box')
    expect(box).toHaveStyle({ left: '10px', top: '20px', width: '100px', height: '100px' })
    expect(box).toHaveAttribute('data-class', 'MILCO')
  })

  it('letterboxes boxes within painted image bounds under object-contain', () => {
    render(
      <DetectionOverlay
        detections={[{ x1: 0, y1: 0, x2: 200, y2: 100, confidence: 0.9, label: 'obj' }]}
        imageUrl="https://example.com/sonar.png"
        naturalWidth={400}
        naturalHeight={200}
        imageClassName="max-h-[200px] object-contain"
      />,
    )

    const img = screen.getByRole('img', { name: /sonar analisada/i })
    mockImageMetrics(img, {
      clientWidth: 200,
      clientHeight: 200,
      naturalWidth: 400,
      naturalHeight: 200,
    })
    fireEvent.load(img)

    const box = screen.getByTestId('detection-box')
    expect(box).toHaveStyle({ left: '0px', top: '50px', width: '100px', height: '50px' })
  })
})

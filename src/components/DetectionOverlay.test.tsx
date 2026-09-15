import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { DetectionOverlay } from './DetectionOverlay'

const sampleDetections = [
  { x1: 10, y1: 20, x2: 110, y2: 120, confidence: 0.9, label: 'obj' },
]

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

  it('scales box geometry from natural coordinates to rendered size', () => {
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
})

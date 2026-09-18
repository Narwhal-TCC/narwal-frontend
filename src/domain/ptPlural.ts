/** Portuguese count label for detections (lowercase, for inline row copy). */
export function formatDeteccaoCount(count: number): string {
  return count === 1 ? '1 detecção' : `${count} detecções`
}

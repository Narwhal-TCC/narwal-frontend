export function DetectionClassLegend() {
  return (
    <p
      data-testid="detection-class-legend"
      className="pt-3 text-xs leading-[18px] text-[color:var(--navi-muted)]"
    >
      <span className="font-semibold text-[color:var(--navi-milco)]">MILCO</span>
      {' — '}
      objetos com aparência de mina (Mine-Like Contacts).{' '}
      <span className="font-semibold text-[color:var(--navi-nombo)]">NOMBO</span>
      {' — '}
      objetos sem aparência de mina (Non-Mine-like Bottom Objects).
    </p>
  )
}

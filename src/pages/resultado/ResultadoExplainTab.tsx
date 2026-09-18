export function ResultadoExplainTab() {
  return (
    <section
      aria-label="Explicação"
      className="flex flex-col"
    >
      <p className="text-[11px] font-medium uppercase tracking-[0.66px] text-[color:var(--navi-muted)]">
        Por que o modelo classificou assim?
      </p>
      <p
        className="pt-4 text-sm leading-[22px] text-[color:var(--navi-muted)]"
        role="status"
      >
        Nenhuma explicação disponível.
      </p>
    </section>
  )
}

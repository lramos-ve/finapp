<script>
  let { data = [] } = $props()

  const anchoTotal = 340
  const altoTotal = 190
  const padTop = 25
  const padBottom = 35
  const padX = 20
  const altoGrafico = altoTotal - padTop - padBottom // 130
  const lineaBaseY = padTop + altoGrafico // 155

  let maxValor = $derived.by(() => {
    if (!data.length) return 100
    const max = Math.max(...data.map((d) => Math.max(d.ingresos, d.gastos)))
    return max > 0 ? max * 1.15 : 100
  })

  let barras = $derived.by(() => {
    if (!data.length) return []
    const n = data.length
    const anchoGrupo = (anchoTotal - padX * 2) / n
    const anchoBarra = Math.min(16, anchoGrupo * 0.35)

    return data.map((d, i) => {
      const centroX = padX + i * anchoGrupo + anchoGrupo / 2

      const hIngresos = d.ingresos > 0 ? Math.max(4, (d.ingresos / maxValor) * altoGrafico) : 0
      const hGastos = d.gastos > 0 ? Math.max(4, (d.gastos / maxValor) * altoGrafico) : 0

      const yIngresos = lineaBaseY - hIngresos
      const yGastos = lineaBaseY - hGastos

      return {
        ...d,
        centroX,
        xIngresos: centroX - anchoBarra - 2,
        yIngresos,
        hIngresos,
        xGastos: centroX + 2,
        yGastos,
        hGastos,
        anchoBarra,
      }
    })
  })
</script>

<div class="barras-card">
  <div class="leyenda-barras">
    <div class="item-leyenda-mini">
      <span class="punto-color verde"></span>
      <span>Ingresos</span>
    </div>
    <div class="item-leyenda-mini">
      <span class="punto-color rojo"></span>
      <span>Gastos</span>
    </div>
  </div>

  <div class="svg-container">
    <svg viewBox="0 0 {anchoTotal} {altoTotal}" class="barras-svg" aria-label="Comparativa mensual de ingresos y gastos">
      <!-- Líneas de referencia horizontal -->
      <line x1={padX} y1={lineaBaseY} x2={anchoTotal - padX} y2={lineaBaseY} stroke="rgba(150, 150, 150, 0.2)" stroke-width="1.5" />
      <line x1={padX} y1={lineaBaseY - altoGrafico / 2} x2={anchoTotal - padX} y2={lineaBaseY - altoGrafico / 2} stroke="rgba(150, 150, 150, 0.08)" stroke-dasharray="3 3" />
      <line x1={padX} y1={padTop} x2={anchoTotal - padX} y2={padTop} stroke="rgba(150, 150, 150, 0.08)" stroke-dasharray="3 3" />

      {#each barras as b}
        <!-- Barra de ingresos -->
        {#if b.hIngresos > 0}
          <rect
            x={b.xIngresos}
            y={b.yIngresos}
            width={b.anchoBarra}
            height={b.hIngresos}
            rx="3"
            ry="3"
            fill="var(--verde)"
            class="barra-rect"
          >
            <title>{b.etiqueta} - Ingresos: ${b.ingresos.toFixed(2)}</title>
          </rect>
        {/if}

        <!-- Barra de gastos -->
        {#if b.hGastos > 0}
          <rect
            x={b.xGastos}
            y={b.yGastos}
            width={b.anchoBarra}
            height={b.hGastos}
            rx="3"
            ry="3"
            fill="var(--rojo)"
            class="barra-rect"
          >
            <title>{b.etiqueta} - Gastos: ${b.gastos.toFixed(2)}</title>
          </rect>
        {/if}

        <!-- Etiqueta del mes -->
        <text x={b.centroX} y={lineaBaseY + 18} text-anchor="middle" class="texto-eje">
          {b.etiqueta}
        </text>
      {/each}
    </svg>
  </div>
</div>

<style>
  .barras-card {
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  .leyenda-barras {
    display: flex;
    justify-content: flex-end;
    gap: 1.25rem;
    font-size: 0.82rem;
    font-weight: 500;
    color: var(--texto-tenue);
  }

  .item-leyenda-mini {
    display: flex;
    align-items: center;
    gap: 0.4rem;
  }

  .punto-color {
    width: 10px;
    height: 10px;
    border-radius: 3px;
  }

  .punto-color.verde {
    background-color: var(--verde);
  }

  .punto-color.rojo {
    background-color: var(--rojo);
  }

  .svg-container {
    width: 100%;
    overflow: hidden;
  }

  .barras-svg {
    width: 100%;
    height: auto;
    display: block;
  }

  .texto-eje {
    font-size: 11px;
    fill: var(--texto-tenue);
    font-weight: 500;
  }

  .barra-rect {
    transition: opacity 0.2s ease;
  }

  .barra-rect:hover {
    opacity: 0.85;
  }
</style>

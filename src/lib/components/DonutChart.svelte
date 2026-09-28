<script>
  let { data = [], total = 0 } = $props()

  // Calcula segmentos con offsets acumulados
  let computedSegments = $derived.by(() => {
    let acumulado = 0
    return data.map((d) => {
      const seg = {
        ...d,
        offset: -acumulado,
      }
      acumulado += d.porcentaje
      return seg
    })
  })
</script>

<div class="donut-card">
  {#if data.length === 0 || total === 0}
    <p class="vacio">Sin gastos registrados en este período.</p>
  {:else}
    <div class="donut-layout">
      <div class="chart-wrapper">
        <svg viewBox="0 0 42 42" class="donut-svg" aria-label="Gráfico de distribución por categoría">
          <!-- Círculo de fondo tenue -->
          <circle
            cx="21"
            cy="21"
            r="15.91549430918954"
            fill="transparent"
            stroke="rgba(150, 150, 150, 0.15)"
            stroke-width="4.5"
          />
          {#each computedSegments as seg}
            {#if seg.porcentaje > 0}
              <circle
                cx="21"
                cy="21"
                r="15.91549430918954"
                fill="transparent"
                stroke={seg.color}
                stroke-width="4.8"
                stroke-dasharray="{seg.porcentaje} {100 - seg.porcentaje}"
                stroke-dashoffset={seg.offset}
                stroke-linecap="round"
                transform="rotate(-90 21 21)"
              />
            {/if}
          {/each}
          <text x="21" y="20.2" text-anchor="middle" class="donut-total">${total.toFixed(2)}</text>
          <text x="21" y="24.2" text-anchor="middle" class="donut-sub">Total gastos</text>
        </svg>
      </div>

      <div class="leyenda">
        {#each data as item}
          <div class="item-leyenda">
            <span class="punto-color" style="background-color: {item.color};"></span>
            <span class="nombre-categoria">{item.categoria}</span>
            <span class="monto-categoria">${item.montoUSD.toFixed(2)}</span>
            <span class="porcentaje-categoria">{item.porcentaje}%</span>
          </div>
        {/each}
      </div>
    </div>
  {/if}
</div>

<style>
  .donut-card {
    width: 100%;
  }

  .donut-layout {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1.5rem;
  }

  @media (min-width: 520px) {
    .donut-layout {
      flex-direction: row;
      justify-content: space-around;
      align-items: center;
    }
  }

  .chart-wrapper {
    width: 100%;
    max-width: 220px;
    aspect-ratio: 1 / 1;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .donut-svg {
    width: 100%;
    height: 100%;
    overflow: visible;
  }

  .donut-total {
    font-size: 3.4px;
    font-weight: 700;
    fill: var(--texto);
    letter-spacing: -0.02em;
  }

  .donut-sub {
    font-size: 1.8px;
    fill: var(--texto-tenue);
    font-weight: 500;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .leyenda {
    display: flex;
    flex-direction: column;
    gap: 0.6rem;
    flex: 1;
    width: 100%;
    max-width: 340px;
  }

  .item-leyenda {
    display: flex;
    align-items: center;
    gap: 0.6rem;
    font-size: 0.88rem;
    padding: 0.35rem 0.6rem;
    border-radius: 8px;
    background: var(--bg);
    box-shadow: var(--neu-elevated-sm);
  }

  .punto-color {
    width: 12px;
    height: 12px;
    border-radius: 50%;
    flex-shrink: 0;
  }

  .nombre-categoria {
    flex: 1;
    font-weight: 500;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .monto-categoria {
    font-weight: 600;
    color: var(--texto);
  }

  .porcentaje-categoria {
    font-size: 0.78rem;
    color: var(--texto-tenue);
    min-width: 2.3rem;
    text-align: right;
  }
</style>

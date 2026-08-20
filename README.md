# 💸 FinApp - Control de Finanzas Personales PWA

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Svelte](https://img.shields.io/badge/Svelte-5.x-orange.svg)
![Vite](https://img.shields.io/badge/Vite-8.x-646CFF.svg)
![PWA](https://img.shields.io/badge/PWA-Ready-5A0FC8.svg)
![IndexedDB](https://img.shields.io/badge/Storage-IndexedDB%2FDexie-green.svg)
![Vitest](https://img.shields.io/badge/Tests-Vitest-yellow.svg)

**FinApp** es una Progressive Web App (**PWA**) *Local-First* diseñada para la gestión y seguimiento eficiente de finanzas personales en entornos **bi-moneda (USD y VES)**. Permite registrar ingresos, gastos, deudas y gastos fijos recurrentes de forma 100% privada, directa y offline, sin depender de servidores ni bases de datos externas.

---

## ✨ Características Principales

### 💳 Transacciones Bi-moneda (USD / VES)
- Registro de ingresos y gastos con denominación en **USD** o **VES**.
- **Tasa BCV Congelada**: Al registrar un movimiento en bolívares (VES), se captura la tasa oficial BCV del momento para calcular y congelar su equivalente histórico en USD (`montoUSD = monto / tasaBCV`). Esto previene distorsiones históricas ante la volatilidad cambiaria.

### 🤝 Gestión Unificada de Deudas
- Control centralizado de **"Debo"** y **"Me deben"** denominado siempre en USD.
- Registro de **abonos parciales y totales** pagaderos indistintamente en USD o VES (con tasa BCV del día de pago).
- Actualización en tiempo real del saldo pendiente y estado (*pendiente* / *pagada*).

### 📅 Gastos Fijos & Arrastre Encadenado
- Definición de plantillas para compromisos recurrentes (nombre, monto en USD, día de vencimiento, frecuencia).
- **Generación de Instancias por Período**: Creación automática de vistas anticipadas por ciclo (ej. mensual).
- **Arrastre de Saldo Vencido**: Si una instancia del período actual vence sin ser pagada a tiempo, su saldo pendiente se arrastra y acumula automáticamente sobre la instancia del período siguiente.

### 📱 PWA & Experiencia Local-First
- **100% Offline**: Funciona completamente sin conexión a internet mediante Service Workers (`vite-plugin-pwa`).
- **Privacidad Total**: Toda la información se guarda localmente en el dispositivo del usuario utilizando **IndexedDB** a través de **Dexie.js**. Sin backend, sin registros ni rastreadores.
- **Instalable**: Compatible con instalación directa en pantallas de inicio en iOS, Android, Windows y macOS.

### 🎛️ Interfaz Ágil (Segmented Controls)
- **Selección de Un Solo Toque**: Sustitución de los menús desplegables tradicionales (`<select>`) por controles segmentados de selección directa (*Segmented Controls*).
- Optimización UX táctil para Tipo (`Gasto` / `Ingreso`), Moneda (`USD` / `VES`), Dirección de deuda (`Debo` / `Me deben`) y Filtros de búsqueda, permitiendo un registro ultra rápido desde dispositivos móviles y de escritorio.

---

## 🛠️ Stack Tecnológico

| Tecnología | Descripción |
| :--- | :--- |
| **[Svelte 5](https://svelte.dev/)** | Framework reactivo ultraligero y rápido utilizando el nuevo sistema de Runes (`$state`). |
| **[Vite 8](https://vitejs.dev/)** | Tooling y servidor de desarrollo ultrarrápido para web moderna. |
| **[Dexie.js](https://dexie.org/)** | Wrapper minimalista y expresivo sobre IndexedDB para persistencia local estructurada. |
| **[vite-plugin-pwa](https://vite-pwa-org.netlify.app/)** | Integración con Workbox para generación de Service Worker y manifiesto PWA. |
| **[Vitest](https://vitest.dev/)** | Framework de testing rápido para pruebas unitarias y de integración. |

---

## 📐 Arquitectura de Datos

La persistencia se gestiona en IndexedDB mediante la base de datos `FinanzasDB`:

```
┌──────────────────┐       ┌──────────────────┐       ┌─────────────────────┐
│  transacciones   │       │      deudas      │       │     gastosFijos     │
├──────────────────┤       ├──────────────────┤       ├─────────────────────┤
│ id (PK)          │       │ id (PK)          │       │ id (PK)             │
│ tipo             │       │ persona          │       │ nombre              │
│ monto            │       │ direccion        │       │ monto               │
│ moneda           │       │ montoOriginal    │       │ diaVencimiento      │
│ tasaBCV          │       │ saldoPendiente   │       │ frecuencia          │
│ montoUSD         │       │ estado           │       │ activo              │
│ fecha            │       └────────┬─────────┘       └──────────┬──────────┘
│ descripcion      │                │ 1                          │ 1
└──────────────────┘                │                            │
                                    │ N                          │ N
                           ┌────────┴─────────┐       ┌──────────┴──────────┐
                           │      abonos      │       │ instanciasGastoFijo │
                           ├──────────────────┤       ├─────────────────────┤
                           │ id (PK)          │       │ id (PK)             │
                           │ deudaId (FK)     │       │ gastoFijoId (FK)    │
                           │ monto            │       │ periodo             │
                           │ moneda           │       │ montoPeriodo        │
                           │ tasaBCV          │       │ montoArrastrado     │
                           │ montoUSD         │       │ saldoPendiente      │
                           │ fecha            │       │ estado              │
                           └──────────────────┘       └──────────┬──────────┘
                                                                 │ 1
                                                                 │ N
                                                      ┌──────────┴──────────┐
                                                      │   pagosGastoFijo    │
                                                      ├─────────────────────┤
                                                      │ id (PK)             │
                                                      │ instanciaId (FK)    │
                                                      │ monto               │
                                                      │ moneda              │
                                                      │ tasaBCV             │
                                                      │ montoUSD            │
                                                      │ fecha               │
                                                      └─────────────────────┘
```

---

## 🚀 Instalación y Desarrollo

### Prerrequisitos
- **Node.js** v18.0.0 o superior
- **npm** v9.0.0 o superior

### Pasos de Instalación

1. **Clonar el repositorio:**
   ```bash
   git clone https://github.com/lramos-ve/finapp.git
   cd finapp
   ```

2. **Instalar dependencias:**
   ```bash
   npm install
   ```

3. **Iniciar el servidor de desarrollo:**
   ```bash
   npm run dev
   ```
   Abre [http://localhost:5173](http://localhost:5173) en tu navegador.

4. **Ejecutar la suite de pruebas unitarias:**
   ```bash
   npm test
   ```

5. **Construir para producción (PWA):**
   ```bash
   npm run build
   ```
   Los archivos compilados y listos para distribución se generarán en el directorio `dist/`.

---

## 📲 Instalación como PWA

### En Celulares (iOS / Android):
1. Abre la aplicación desplegada en **Safari** (iOS) o **Chrome** (Android).
2. Toca el botón **Compartir** o los tres puntos de opciones.
3. Selecciona **"Agregar a la pantalla de inicio"** (Add to Home Screen).

### En Escritorio (Chrome / Edge / Brave):
1. Abre la aplicación en el navegador.
2. En la barra de direcciones aparecerá un icono de instalación 💻.
3. Haz clic en **Instalar** para disponer de una ventana independiente.

---

## 📜 Licencia

Este proyecto está bajo la Licencia [MIT](LICENSE). Consulta el archivo `LICENSE` para más detalles.

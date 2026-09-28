import { describe, it, expect, beforeEach } from 'vitest'
import { db } from '../lib/db.js'
import {
  exportarDatos,
  descifrarDatos,
  validarEstructuraRespaldo,
  restaurarDatos,
  TABLAS_RESPALDO,
} from '../lib/backup.js'
import { registrarTransaccion } from '../lib/transactions.js'
import { registrarDeuda } from '../lib/debts.js'

beforeEach(async () => {
  for (const t of TABLAS_RESPALDO) {
    if (db[t]) await db[t].clear()
  }
})

describe('backup & restore', () => {
  it('exporta datos en texto plano si no se especifica contraseña', async () => {
    await registrarTransaccion({
      tipo: 'ingreso',
      monto: 150,
      moneda: 'USD',
      fecha: '2026-09-01',
      descripcion: 'Pago quincena',
    })

    const respaldo = await exportarDatos()

    expect(respaldo.app).toBe('finapp')
    expect(respaldo.version).toBe(1)
    expect(respaldo.encrypted).toBe(false)
    expect(respaldo.data.transacciones).toHaveLength(1)
    expect(respaldo.data.transacciones[0].monto).toBe(150)
  })

  it('exporta datos cifrados con AES-GCM cuando se provee contraseña', async () => {
    await registrarTransaccion({
      tipo: 'gasto',
      monto: 50,
      moneda: 'USD',
      fecha: '2026-09-02',
    })

    const respaldo = await exportarDatos({ password: 'mi-password-segura' })

    expect(respaldo.app).toBe('finapp')
    expect(respaldo.version).toBe(1)
    expect(respaldo.encrypted).toBe(true)
    expect(respaldo.crypto).toBeDefined()
    expect(respaldo.crypto.algorithm).toBe('AES-GCM')
    expect(respaldo.crypto.kdf).toBe('PBKDF2')
    expect(respaldo.crypto.salt).toBeTypeOf('string')
    expect(respaldo.crypto.iv).toBeTypeOf('string')
    expect(respaldo.ciphertext).toBeTypeOf('string')
    expect(respaldo.data).toBeUndefined()
  })

  it('descifra correctamente los datos con la contraseña válida', async () => {
    await registrarTransaccion({
      tipo: 'ingreso',
      monto: 300,
      moneda: 'USD',
      fecha: '2026-09-05',
    })
    await registrarDeuda({
      persona: 'Carlos',
      direccion: 'me_deben',
      monto: 50,
      fecha: '2026-09-05',
    })

    const respaldo = await exportarDatos({ password: 'clave-secreta-123' })
    const datosDescifrados = await descifrarDatos(respaldo, 'clave-secreta-123')

    expect(datosDescifrados.transacciones).toHaveLength(1)
    expect(datosDescifrados.transacciones[0].monto).toBe(300)
    expect(datosDescifrados.deudas).toHaveLength(1)
    expect(datosDescifrados.deudas[0].persona).toBe('Carlos')
  })

  it('falla con error al intentar descifrar con contraseña incorrecta', async () => {
    await registrarTransaccion({
      tipo: 'ingreso',
      monto: 100,
      moneda: 'USD',
      fecha: '2026-09-05',
    })

    const respaldo = await exportarDatos({ password: 'clave-correcta' })

    await expect(
      descifrarDatos(respaldo, 'clave-equivocada')
    ).rejects.toThrow('Contraseña incorrecta o archivo de respaldo corrupto')
  })

  it('valida la estructura del archivo y rechaza formatos no válidos', () => {
    expect(() => validarEstructuraRespaldo(null)).toThrow('El archivo no tiene un formato JSON válido')
    expect(() => validarEstructuraRespaldo({ app: 'otra-app' })).toThrow("falta marca 'finapp'")
    expect(() => validarEstructuraRespaldo({ app: 'finapp', version: 0 })).toThrow('Versión de respaldo no compatible')
    expect(() => validarEstructuraRespaldo({ app: 'finapp', version: 1, encrypted: false, data: null })).toThrow(
      'no contiene datos válidos'
    )
  })

  it('restaura atómicamente una base de datos desde un respaldo sin cifrar', async () => {
    // 1. Poblamos datos iniciales
    await registrarTransaccion({
      tipo: 'ingreso',
      monto: 500,
      moneda: 'USD',
      fecha: '2026-01-01',
    })
    const respaldo = await exportarDatos()

    // 2. Modificamos el estado actual (borramos y agregamos otra cosa)
    await db.transacciones.clear()
    await registrarTransaccion({
      tipo: 'gasto',
      monto: 20,
      moneda: 'USD',
      fecha: '2026-02-01',
    })

    // 3. Restauramos el respaldo previo
    const resultado = await restaurarDatos(respaldo)
    expect(resultado.restaurados.transacciones).toBe(1)

    const transacciones = await db.transacciones.toArray()
    expect(transacciones).toHaveLength(1)
    expect(transacciones[0].monto).toBe(500)
    expect(transacciones[0].tipo).toBe('ingreso')
  })

  it('restaura datos desde un respaldo cifrado con su contraseña correcta', async () => {
    await registrarDeuda({
      persona: 'Ana',
      direccion: 'debo',
      monto: 80,
      fecha: '2026-08-01',
    })

    const respaldoCifrado = await exportarDatos({ password: 'mi-clave-de-prueba' })

    // Limpiamos la base de datos
    await db.deudas.clear()
    expect(await db.deudas.count()).toBe(0)

    // Restauramos pasando la contraseña
    await restaurarDatos(respaldoCifrado, { password: 'mi-clave-de-prueba' })

    const deudas = await db.deudas.toArray()
    expect(deudas).toHaveLength(1)
    expect(deudas[0].persona).toBe('Ana')
  })
})

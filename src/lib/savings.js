/**
 * Módulo de gestión de Fondos y Metas de Ahorro (Físicos y Electrónicos en USD).
 * Compatible con Firebase Firestore (grupos) y Dexie (local offline).
 */
import { db as firestoreDb } from './firebase.js'
import { db as dexieDb } from './db.js'
import { calcularMovimientoDeDinero, redondear } from './money.js'
import {
  collection,
  doc,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp,
  arrayUnion
} from 'firebase/firestore'

const GLOBAL_GOAL_KEY = 'finapp_global_savings_goal'

/**
 * Obtener meta de ahorro global.
 */
export async function getGlobalSavingsGoal(groupId) {
  if (groupId && firestoreDb) {
    try {
      const groupRef = doc(firestoreDb, 'groups', groupId)
      const snap = await getDoc(groupRef)
      if (snap.exists() && snap.data().savingsGoalUSD) {
        return Number(snap.data().savingsGoalUSD)
      }
    } catch (_) {}
  }
  try {
    return Number(localStorage.getItem(GLOBAL_GOAL_KEY) || 0)
  } catch (_) {
    return 0
  }
}

/**
 * Guardar meta de ahorro global.
 */
export async function setGlobalSavingsGoal(groupId, goalUSD) {
  const num = Number(goalUSD) || 0
  if (groupId && firestoreDb) {
    const groupRef = doc(firestoreDb, 'groups', groupId)
    await updateDoc(groupRef, {
      savingsGoalUSD: num,
      updatedAt: serverTimestamp()
    })
  }
  try {
    localStorage.setItem(GLOBAL_GOAL_KEY, num.toString())
  } catch (_) {}
  return num
}

/**
 * Suscribirse a los fondos de ahorro de un grupo en Firestore o leer localmente de Dexie.
 */
export function subscribeSavings(groupId, callback) {
  if (!groupId || !firestoreDb) {
    cargarAhorrosLocales().then(callback)
    return () => {}
  }

  const colRef = collection(firestoreDb, 'groups', groupId, 'savings')
  const q = query(colRef, orderBy('createdAt', 'desc'))

  return onSnapshot(colRef, (snapshot) => {
    const items = snapshot.docs.map(d => ({
      id: d.id,
      ...d.data(),
      saldoActual: Number(d.data().saldoActual || 0),
      metaUSD: d.data().metaUSD ? Number(d.data().metaUSD) : null,
      movimientos: Array.isArray(d.data().movimientos) ? d.data().movimientos : []
    }))
    callback(items)
  }, (err) => {
    console.error('Error al suscribir ahorros:', err)
    cargarAhorrosLocales().then(callback)
  })
}

/**
 * Cargar ahorros desde Dexie local.
 */
export async function cargarAhorrosLocales() {
  try {
    const items = await dexieDb.ahorros.toArray()
    return items.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0))
  } catch (err) {
    console.error('Error al cargar ahorros locales:', err)
    return []
  }
}

/**
 * Crear un nuevo fondo o meta de ahorro.
 */
export async function createSavingFund(groupId, {
  nombre,
  tipoAhorro = 'fisico', // 'fisico' | 'electronico'
  metaUSD = null,
  saldoInicial = 0,
  descripcion = '',
  icono = 'fa-piggy-bank'
}, user) {
  if (!nombre?.trim()) throw new Error('El nombre del fondo de ahorro es requerido')

  const numSaldoInicial = Number(saldoInicial) || 0
  const numMetaUSD = metaUSD && Number(metaUSD) > 0 ? Number(metaUSD) : null

  const movimientos = []
  if (numSaldoInicial > 0) {
    movimientos.push({
      id: `mov-${Date.now()}`,
      tipo: 'abono',
      montoUSD: numSaldoInicial,
      montoOriginal: numSaldoInicial,
      moneda: 'USD',
      tasaBCV: null,
      fecha: new Date().toISOString().slice(0, 10),
      nota: 'Saldo inicial',
      createdByName: user?.displayName || user?.email || 'Usuario',
      createdAt: Date.now()
    })
  }

  const data = {
    nombre: nombre.trim(),
    tipoAhorro: tipoAhorro === 'electronico' ? 'electronico' : 'fisico',
    metaUSD: numMetaUSD,
    saldoActual: redondear(numSaldoInicial),
    descripcion: descripcion?.trim() || '',
    icono: icono || (tipoAhorro === 'electronico' ? 'fa-vault' : 'fa-piggy-bank'),
    pausado: false,
    movimientos,
    createdById: user?.uid || null,
    createdByName: user?.displayName || user?.email || 'Usuario',
    createdAt: Date.now()
  }

  if (groupId && firestoreDb) {
    const colRef = collection(firestoreDb, 'groups', groupId, 'savings')
    const docRef = await addDoc(colRef, {
      ...data,
      serverTimestamp: serverTimestamp()
    })
    return { id: docRef.id, ...data }
  } else {
    const id = await dexieDb.ahorros.add(data)
    return { id, ...data }
  }
}

/**
 * Registrar un movimiento (Abono o Retiro) en un fondo de ahorro.
 */
export async function recordSavingMovement(groupId, savingFund, {
  tipo = 'abono', // 'abono' | 'retiro'
  monto,
  moneda = 'USD',
  tasaBCV = null,
  fecha,
  nota = ''
}, user) {
  if (!monto || Number(monto) <= 0) throw new Error('El monto debe ser mayor a 0')
  if (!fecha) throw new Error('La fecha es requerida')

  const conversion = calcularMovimientoDeDinero({
    monto: Number(monto),
    moneda,
    tasaBCV: moneda === 'VES' ? Number(tasaBCV) : undefined
  })

  const montoUSD = conversion.montoUSD
  let nuevoSaldo = Number(savingFund.saldoActual || 0)

  if (tipo === 'retiro') {
    if (montoUSD > nuevoSaldo) {
      throw new Error(`Fondos insuficientes. Saldo actual: $${nuevoSaldo.toFixed(2)} USD`)
    }
    nuevoSaldo = redondear(nuevoSaldo - montoUSD)
  } else {
    nuevoSaldo = redondear(nuevoSaldo + montoUSD)
  }

  const nuevoMovimiento = {
    id: `mov-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
    tipo,
    montoUSD,
    montoOriginal: Number(monto),
    moneda,
    tasaBCV: moneda === 'VES' ? Number(tasaBCV) : null,
    fecha,
    nota: nota?.trim() || '',
    createdByName: user?.displayName || user?.email || 'Usuario',
    createdAt: Date.now()
  }

  if (groupId && firestoreDb && savingFund.id) {
    const docRef = doc(firestoreDb, 'groups', groupId, 'savings', savingFund.id)
    await updateDoc(docRef, {
      saldoActual: nuevoSaldo,
      movimientos: arrayUnion(nuevoMovimiento),
      updatedAt: serverTimestamp()
    })
  } else {
    const movimientos = Array.isArray(savingFund.movimientos) ? [...savingFund.movimientos, nuevoMovimiento] : [nuevoMovimiento]
    await dexieDb.ahorros.update(savingFund.id, {
      saldoActual: nuevoSaldo,
      movimientos
    })
  }

  return { nuevoSaldo, nuevoMovimiento }
}

/**
 * Actualizar un movimiento u operación específica de un fondo de ahorro.
 */
export async function updateSavingMovement(groupId, savingFundId, movementId, {
  nombre,
  tipoAhorro,
  tipo = 'abono',
  montoUSD,
  fecha,
  nota
}) {
  const numMonto = Number(montoUSD)
  if (!numMonto || numMonto <= 0) throw new Error('El monto debe ser mayor a 0')

  if (groupId && firestoreDb && savingFundId) {
    const docRef = doc(firestoreDb, 'groups', groupId, 'savings', savingFundId)
    const snap = await getDoc(docRef)
    if (!snap.exists()) throw new Error('Fondo no encontrado')

    const data = snap.data()
    let movs = Array.isArray(data.movimientos) ? [...data.movimientos] : []
    const idx = movs.findIndex(m => m.id === movementId)

    if (idx !== -1) {
      movs[idx] = {
        ...movs[idx],
        tipo: tipo || movs[idx].tipo,
        montoUSD: numMonto,
        montoOriginal: numMonto,
        fecha: fecha || movs[idx].fecha,
        nota: nota !== undefined ? nota.trim() : (movs[idx].nota || '')
      }
    } else {
      // Si no existía el id exacto de movimiento, reemplazar o añadir
      movs = [{
        id: movementId || `mov-${Date.now()}`,
        tipo,
        montoUSD: numMonto,
        montoOriginal: numMonto,
        fecha,
        nota: nota?.trim() || '',
        createdAt: Date.now()
      }]
    }

    const nuevoSaldo = redondear(movs.reduce((acc, m) => acc + (m.tipo === 'retiro' ? -Number(m.montoUSD || 0) : Number(m.montoUSD || 0)), 0))

    await updateDoc(docRef, {
      nombre: nombre?.trim() || data.nombre,
      tipoAhorro: tipoAhorro || data.tipoAhorro,
      saldoActual: Math.max(0, nuevoSaldo),
      movimientos: movs,
      updatedAt: serverTimestamp()
    })
  } else {
    const fund = await dexieDb.ahorros.get(savingFundId)
    if (!fund) throw new Error('Fondo no encontrado')

    let movs = Array.isArray(fund.movimientos) ? [...fund.movimientos] : []
    const idx = movs.findIndex(m => m.id === movementId)

    if (idx !== -1) {
      movs[idx] = {
        ...movs[idx],
        tipo: tipo || movs[idx].tipo,
        montoUSD: numMonto,
        montoOriginal: numMonto,
        fecha: fecha || movs[idx].fecha,
        nota: nota !== undefined ? nota.trim() : (movs[idx].nota || '')
      }
    } else {
      movs = [{
        id: movementId || `mov-${Date.now()}`,
        tipo,
        montoUSD: numMonto,
        montoOriginal: numMonto,
        fecha,
        nota: nota?.trim() || '',
        createdAt: Date.now()
      }]
    }

    const nuevoSaldo = redondear(movs.reduce((acc, m) => acc + (m.tipo === 'retiro' ? -Number(m.montoUSD || 0) : Number(m.montoUSD || 0)), 0))

    await dexieDb.ahorros.update(savingFundId, {
      nombre: nombre?.trim() || fund.nombre,
      tipoAhorro: tipoAhorro || fund.tipoAhorro,
      saldoActual: Math.max(0, nuevoSaldo),
      movimientos: movs
    })
  }
}

/**
 * Actualizar los datos básicos de un fondo de ahorro (Nombre, Meta, Descripción, Tipo).
 */
export async function updateSavingFund(groupId, savingId, datos) {
  const updateData = {
    ...datos,
    metaUSD: datos.metaUSD && Number(datos.metaUSD) > 0 ? Number(datos.metaUSD) : null
  }

  if (groupId && firestoreDb) {
    const docRef = doc(firestoreDb, 'groups', groupId, 'savings', savingId)
    await updateDoc(docRef, {
      ...updateData,
      updatedAt: serverTimestamp()
    })
  } else {
    await dexieDb.ahorros.update(savingId, updateData)
  }
}

/**
 * Pausar o reanudar un fondo de ahorro.
 */
export async function togglePauseSavingFund(groupId, savingId, estadoActual) {
  const pausado = !estadoActual
  if (groupId && firestoreDb) {
    const docRef = doc(firestoreDb, 'groups', groupId, 'savings', savingId)
    await updateDoc(docRef, { pausado, updatedAt: serverTimestamp() })
  } else {
    await dexieDb.ahorros.update(savingId, { pausado })
  }
}

/**
 * Eliminar un fondo de ahorro.
 */
export async function deleteSavingFund(groupId, savingId) {
  if (groupId && firestoreDb) {
    const docRef = doc(firestoreDb, 'groups', groupId, 'savings', savingId)
    await deleteDoc(docRef)
  } else {
    await dexieDb.ahorros.delete(savingId)
  }
}

/**
 * Módulo de gestión de Categorías de Gastos e Ingresos (adaptadas al contexto venezolano).
 */
import { db } from './firebase.js'
import { 
  collection, 
  doc, 
  addDoc, 
  deleteDoc, 
  onSnapshot, 
  query, 
  orderBy, 
  serverTimestamp 
} from 'firebase/firestore'

export const DEFAULT_CATEGORIES = [
  // Gastos / Egresos
  { nombre: 'Bodega / Supermercado', tipo: 'gasto', icono: 'fa-cart-shopping' },
  { nombre: 'Carnicería / Charcutería', tipo: 'gasto', icono: 'fa-drumstick-bite' },
  { nombre: 'Panadería', tipo: 'gasto', icono: 'fa-bread-slice' },
  { nombre: 'Farmacia / Salud', tipo: 'gasto', icono: 'fa-capsules' },
  { nombre: 'Gasolina / Transporte', tipo: 'gasto', icono: 'fa-gas-pump' },
  { nombre: 'Servicios (Luz, Agua, Gas)', tipo: 'gasto', icono: 'fa-bolt' },
  { nombre: 'Internet / Saldo Móvil', tipo: 'gasto', icono: 'fa-wifi' },
  { nombre: 'Comida en la calle', tipo: 'gasto', icono: 'fa-burger' },
  { nombre: 'Hogar / Reparaciones', tipo: 'gasto', icono: 'fa-screwdriver-wrench' },
  { nombre: 'Mascotas', tipo: 'gasto', icono: 'fa-paw' },
  { nombre: 'Otros Gastos', tipo: 'gasto', icono: 'fa-tag' },

  // Ingresos
  { nombre: 'Sueldo / Quincena', tipo: 'ingreso', icono: 'fa-briefcase' },
  { nombre: 'Freelance / Honorarios', tipo: 'ingreso', icono: 'fa-laptop-code' },
  { nombre: 'Remesas / Zelle', tipo: 'ingreso', icono: 'fa-money-bill-transfer' },
  { nombre: 'Ventas / Negocio', tipo: 'ingreso', icono: 'fa-shop' },
  { nombre: 'Reembolso / Préstamo', tipo: 'ingreso', icono: 'fa-rotate-left' },
  { nombre: 'Otros Ingresos', tipo: 'ingreso', icono: 'fa-circle-dollar-to-slot' }
]

const LOCAL_STORAGE_KEY = 'finapp_custom_categories'

function getLocalCategories() {
  try {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY)
    if (saved) {
      return JSON.parse(saved)
    }
  } catch (_) {}
  return DEFAULT_CATEGORIES.map((c, i) => ({ ...c, id: `default-${i}` }))
}

function saveLocalCategories(cats) {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(cats))
  } catch (_) {}
}

/**
 * Suscribirse a las categorías de un grupo en Firestore (o local si no hay grupo).
 */
export function subscribeCategories(groupId, callback) {
  if (!groupId || !db) {
    const local = getLocalCategories()
    callback(local)
    return () => {}
  }

  const colRef = collection(db, 'groups', groupId, 'categories')
  const q = query(colRef, orderBy('createdAt', 'asc'))

  return onSnapshot(colRef, (snapshot) => {
    if (snapshot.empty) {
      // Si no tiene categorías personalizadas creadas en Firebase, devuelve las por defecto
      const local = getLocalCategories()
      callback(local)
    } else {
      const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
      callback(items)
    }
  }, (err) => {
    console.error('Error al suscribir categorías:', err)
    callback(getLocalCategories())
  })
}

/**
 * Agregar una nueva categoría a un grupo o almacenamiento local.
 */
export async function addCategory(groupId, { nombre, tipo, icono = 'fa-tag' }) {
  const data = {
    nombre: nombre.trim(),
    tipo: tipo === 'ingreso' ? 'ingreso' : 'gasto',
    icono: icono || 'fa-tag',
    createdAt: Date.now()
  }

  if (groupId && db) {
    const colRef = collection(db, 'groups', groupId, 'categories')
    const docRef = await addDoc(colRef, {
      ...data,
      serverTimestamp: serverTimestamp()
    })
    return { id: docRef.id, ...data }
  } else {
    const local = getLocalCategories()
    const item = { id: `local-${Date.now()}`, ...data }
    local.push(item)
    saveLocalCategories(local)
    return item
  }
}

/**
 * Eliminar una categoría por ID.
 */
export async function deleteCategory(groupId, categoryId) {
  if (groupId && db && !categoryId.startsWith('default-') && !categoryId.startsWith('local-')) {
    const docRef = doc(db, 'groups', groupId, 'categories', categoryId)
    await deleteDoc(docRef)
  } else {
    let local = getLocalCategories()
    local = local.filter(c => c.id !== categoryId)
    saveLocalCategories(local)
  }
}

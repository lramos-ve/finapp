import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  onSnapshot, 
  arrayUnion, 
  arrayRemove, 
  serverTimestamp,
  runTransaction 
} from 'firebase/firestore';
import { db } from './firebase.js';
import { calcularMovimientoDeDinero, redondear } from './money.js';

// ==========================================
// 👥 GESTIÓN DE GRUPOS Y USUARIOS
// ==========================================

/**
 * Crea un nuevo grupo financiero y lo asigna como activo para el usuario creador.
 * @param {string} groupName - Nombre del grupo (ej: "Familia Pérez", "Empresa", etc.)
 * @param {object} user - Objeto del usuario autenticado (auth.currentUser)
 * @returns {Promise<string>} ID del grupo creado
 */
export async function createGroup(groupName, user) {
  if (!user?.uid) throw new Error('Usuario no autenticado');
  if (!groupName?.trim()) throw new Error('El nombre del grupo es obligatorio');

  const groupRef = doc(collection(db, 'groups'));
  const groupId = groupRef.id;

  const memberInfo = {
    uid: user.uid,
    email: user.email || '',
    name: user.displayName || user.email?.split('@')[0] || 'Usuario'
  };

  // 1. Guardar documento del grupo
  await setDoc(groupRef, {
    name: groupName.trim(),
    createdBy: user.uid,
    createdAt: serverTimestamp(),
    members: [user.uid],
    memberDetails: {
      [user.uid]: memberInfo
    }
  });

  // 2. Actualizar perfil de usuario con su grupo activo
  await setDoc(doc(db, 'users', user.uid), {
    email: user.email || '',
    displayName: user.displayName || '',
    activeGroupId: groupId,
    updatedAt: serverTimestamp()
  }, { merge: true });

  return groupId;
}

/**
 * Obtiene el perfil del usuario con su grupo activo.
 * @param {string} userId - UID del usuario
 */
export async function getUserProfile(userId) {
  if (!userId) return null;
  const userDoc = await getDoc(doc(db, 'users', userId));
  return userDoc.exists() ? userDoc.data() : null;
}

/**
 * Lista todos los grupos a los que pertenece el usuario.
 * @param {string} userId - UID del usuario
 * @returns {Promise<Array>} Lista de grupos
 */
export async function getUserGroups(userId) {
  if (!userId) return [];
  const q = query(collection(db, 'groups'), where('members', 'array-contains', userId));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
}

/**
 * Cambia el grupo activo del usuario.
 * @param {string} userId - UID del usuario
 * @param {string} groupId - ID del grupo a seleccionar
 */
export async function setActiveGroup(userId, groupId) {
  if (!userId || !groupId) throw new Error('Parámetros inválidos');
  await setDoc(doc(db, 'users', userId), {
    activeGroupId: groupId,
    updatedAt: serverTimestamp()
  }, { merge: true });
}

/**
 * Permite a un usuario unirse a un grupo existente usando su ID o código de invitación.
 * @param {string} groupId - ID del grupo
 * @param {object} user - Objeto del usuario autenticado
 */
export async function joinGroupByCode(groupId, user) {
  if (!user?.uid) throw new Error('Usuario no autenticado');
  if (!groupId?.trim()) throw new Error('El código del grupo es obligatorio');

  const groupRef = doc(db, 'groups', groupId.trim());
  const groupSnap = await getDoc(groupRef);

  if (!groupSnap.exists()) {
    throw new Error('El grupo no existe o el código es inválido');
  }

  const memberInfo = {
    uid: user.uid,
    email: user.email || '',
    name: user.displayName || user.email?.split('@')[0] || 'Usuario'
  };

  // Añadir miembro al array y su info
  await updateDoc(groupRef, {
    members: arrayUnion(user.uid),
    [`memberDetails.${user.uid}`]: memberInfo
  });

  // Establecer como grupo activo
  await setActiveGroup(user.uid, groupId.trim());

  return { id: groupSnap.id, ...groupSnap.data() };
}

/**
 * Sale de un grupo financiero.
 * @param {string} groupId - ID del grupo
 * @param {object} user - Objeto del usuario autenticado
 */
export async function leaveGroup(groupId, user) {
  if (!user?.uid || !groupId) throw new Error('Parámetros inválidos');

  const groupRef = doc(db, 'groups', groupId);
  await updateDoc(groupRef, {
    members: arrayRemove(user.uid)
  });

  // Limpiar grupo activo del usuario
  await setDoc(doc(db, 'users', user.uid), {
    activeGroupId: null
  }, { merge: true });
}


// ==========================================
// 💳 TRANSACCIONES POR GRUPO
// ==========================================

/**
 * Escucha las transacciones del grupo en tiempo real (con soporte offline).
 * @param {string} groupId - ID del grupo
 * @param {function} callback - Función que recibe la lista de transacciones
 * @returns {function} Unsubscribe function
 */
export function subscribeTransactions(groupId, callback) {
  if (!groupId) return () => {};

  const q = query(
    collection(db, 'groups', groupId, 'transactions'),
    orderBy('fecha', 'desc')
  );

  return onSnapshot(q, (snapshot) => {
    const items = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
    callback(items);
  }, (error) => {
    console.error('Error al escuchar transacciones del grupo:', error);
  });
}

/**
 * Registra una transacción bi-moneda dentro del grupo activo.
 * @param {string} groupId - ID del grupo
 * @param {{ tipo: 'ingreso'|'gasto', monto: number, moneda: 'USD'|'VES', tasaBCV?: number, fecha: string, descripcion?: string }} datos
 * @param {object} user - Usuario que registra
 */
export async function addTransaction(groupId, { tipo, monto, moneda, tasaBCV, fecha, descripcion, categoria }, user) {
  if (!groupId) throw new Error('Grupo no seleccionado');
  if (tipo !== 'ingreso' && tipo !== 'gasto') throw new Error("El tipo debe ser 'ingreso' o 'gasto'");
  if (!fecha) throw new Error('La fecha es requerida');

  const movimiento = calcularMovimientoDeDinero({ monto, moneda, tasaBCV });

  const txRef = collection(db, 'groups', groupId, 'transactions');
  const docRef = await addDoc(txRef, {
    tipo,
    ...movimiento,
    fecha,
    descripcion: descripcion ?? '',
    categoria: categoria ?? '',
    createdById: user?.uid || null,
    createdByName: user?.displayName || user?.email || 'Usuario',
    createdAt: serverTimestamp()
  });

  return docRef.id;
}

/**
 * Elimina una transacción del grupo.
 */
export async function deleteTransaction(groupId, transactionId) {
  if (!groupId || !transactionId) throw new Error('Parámetros inválidos');
  await deleteDoc(doc(db, 'groups', groupId, 'transactions', transactionId));
}


// ==========================================
// 🤝 GESTIÓN DE DEUDAS POR GRUPO
// ==========================================

/**
 * Escucha las deudas del grupo en tiempo real.
 * @param {string} groupId - ID del grupo
 * @param {function} callback - Función que recibe la lista de deudas
 */
export function subscribeDebts(groupId, callback) {
  if (!groupId) return () => {};

  const q = query(collection(db, 'groups', groupId, 'debts'), orderBy('fecha', 'desc'));
  return onSnapshot(q, (snapshot) => {
    const items = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
    callback(items);
  }, (error) => {
    console.error('Error al escuchar deudas:', error);
  });
}

/**
 * Registra una deuda en el grupo.
 */
export async function addDebt(groupId, { persona, direccion, monto, fecha, notas }, user) {
  if (!groupId) throw new Error('Grupo no seleccionado');
  if (direccion !== 'debo' && direccion !== 'me_deben') throw new Error("Dirección inválida");
  if (!persona?.trim()) throw new Error('La persona es requerida');
  if (!monto || monto <= 0) throw new Error('El monto debe ser mayor a 0');

  const debtsRef = collection(db, 'groups', groupId, 'debts');
  const docRef = await addDoc(debtsRef, {
    persona: persona.trim(),
    direccion,
    montoOriginal: monto,
    saldoPendiente: monto,
    fecha,
    estado: 'pendiente',
    notas: notas ?? '',
    createdById: user?.uid || null,
    createdByName: user?.displayName || user?.email || 'Usuario',
    createdAt: serverTimestamp()
  });

  return docRef.id;
}

/**
 * Registra un abono a una deuda y actualiza su saldo en una transacción atómica.
 */
export async function addDebtPayment(groupId, deudaId, { monto, moneda, tasaBCV, fecha }, user) {
  if (!groupId || !deudaId) throw new Error('Parámetros requeridos faltantes');

  const movimiento = calcularMovimientoDeDinero({ monto, moneda, tasaBCV });
  const deudaRef = doc(db, 'groups', groupId, 'debts', deudaId);
  const abonosRef = collection(db, 'groups', groupId, 'debts', deudaId, 'abonos');

  await runTransaction(db, async (t) => {
    const deudaDoc = await t.get(deudaRef);
    if (!deudaDoc.exists()) throw new Error('La deuda no existe');

    const deudaData = deudaDoc.data();
    if (movimiento.montoUSD > deudaData.saldoPendiente) {
      throw new Error(`El abono ($${movimiento.montoUSD}) excede el saldo pendiente ($${deudaData.saldoPendiente})`);
    }

    const nuevoSaldo = redondear(deudaData.saldoPendiente - movimiento.montoUSD);
    const nuevoEstado = nuevoSaldo <= 0 ? 'pagada' : 'pendiente';

    t.update(deudaRef, {
      saldoPendiente: nuevoSaldo,
      estado: nuevoEstado,
      updatedAt: serverTimestamp()
    });

    const newAbonoRef = doc(abonosRef);
    t.set(newAbonoRef, {
      ...movimiento,
      fecha,
      createdById: user?.uid || null,
      createdByName: user?.displayName || user?.email || 'Usuario',
      createdAt: serverTimestamp()
    });
  });
}


// ==========================================
// 📅 GASTOS FIJOS POR GRUPO
// ==========================================

/**
 * Escucha los gastos fijos del grupo en tiempo real.
 */
export function subscribeFixedExpenses(groupId, callback) {
  if (!groupId) return () => {};

  const q = query(collection(db, 'groups', groupId, 'fixedExpenses'), orderBy('diaVencimiento', 'asc'));
  return onSnapshot(q, (snapshot) => {
    const items = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
    callback(items);
  }, (error) => {
    console.error('Error al escuchar gastos fijos:', error);
  });
}

/**
 * Crea una plantilla de gasto fijo para el grupo.
 */
export async function addFixedExpense(groupId, { nombre, monto, diaVencimiento, frecuencia = 'mensual' }, user) {
  if (!groupId) throw new Error('Grupo no seleccionado');
  if (!nombre?.trim()) throw new Error('El nombre es requerido');
  if (!monto || monto <= 0) throw new Error('El monto debe ser mayor a 0');

  const docRef = await addDoc(collection(db, 'groups', groupId, 'fixedExpenses'), {
    nombre: nombre.trim(),
    monto,
    diaVencimiento: Number(diaVencimiento) || 1,
    frecuencia,
    activo: true,
    createdById: user?.uid || null,
    createdByName: user?.displayName || user?.email || 'Usuario',
    createdAt: serverTimestamp()
  });

  return docRef.id;
}

/**
 * Alterna el estado activo/inactivo de un gasto fijo.
 */
export async function toggleFixedExpense(groupId, expenseId, activo) {
  if (!groupId || !expenseId) throw new Error('Parámetros inválidos');
  await updateDoc(doc(db, 'groups', groupId, 'fixedExpenses', expenseId), {
    activo: Boolean(activo),
    updatedAt: serverTimestamp()
  });
}

/**
 * Actualiza una plantilla de gasto fijo en Firestore.
 */
export async function editFixedExpense(groupId, expenseId, { nombre, monto, diaVencimiento }) {
  if (!groupId || !expenseId) throw new Error('Parámetros inválidos');
  await updateDoc(doc(db, 'groups', groupId, 'fixedExpenses', expenseId), {
    nombre: nombre.trim(),
    monto: Number(monto),
    diaVencimiento: Number(diaVencimiento),
    updatedAt: serverTimestamp()
  });
}

/**
 * Elimina una plantilla de gasto fijo en Firestore.
 */
export async function deleteFixedExpense(groupId, expenseId) {
  if (!groupId || !expenseId) throw new Error('Parámetros inválidos');
  await deleteDoc(doc(db, 'groups', groupId, 'fixedExpenses', expenseId));
}

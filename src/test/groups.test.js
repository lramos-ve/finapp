import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mocks para Firebase
const mockFirestoreData = new Map();

vi.mock('firebase/app', () => ({
  initializeApp: vi.fn(() => ({}))
}));

vi.mock('firebase/auth', () => ({
  getAuth: vi.fn(() => ({})),
  GoogleAuthProvider: vi.fn(),
  signInWithPopup: vi.fn(),
  signOut: vi.fn()
}));

vi.mock('firebase/firestore', () => {
  return {
    initializeFirestore: vi.fn(() => ({})),
    persistentLocalCache: vi.fn(),
    persistentMultipleTabManager: vi.fn(),
    serverTimestamp: () => new Date().toISOString(),
    collection: vi.fn((db, ...pathSegments) => ({
      type: 'collection',
      path: pathSegments.join('/')
    })),
    doc: vi.fn((db, ...pathSegments) => {
      if (typeof db === 'object' && db.type === 'collection') {
        const id = 'mock-id-' + Math.random().toString(36).substring(7);
        return { type: 'doc', path: `${db.path}/${id}`, id };
      }
      const path = pathSegments.join('/');
      const parts = path.split('/');
      return { type: 'doc', path, id: parts[parts.length - 1] };
    }),
    setDoc: vi.fn(async (docRef, data, options) => {
      if (options?.merge && mockFirestoreData.has(docRef.path)) {
        const existing = mockFirestoreData.get(docRef.path);
        mockFirestoreData.set(docRef.path, { ...existing, ...data });
      } else {
        mockFirestoreData.set(docRef.path, data);
      }
    }),
    getDoc: vi.fn(async (docRef) => {
      const exists = mockFirestoreData.has(docRef.path);
      return {
        exists: () => exists,
        id: docRef.id,
        data: () => mockFirestoreData.get(docRef.path)
      };
    }),
    getDocs: vi.fn(async (q) => {
      const docs = [];
      for (const [path, data] of mockFirestoreData.entries()) {
        if (path.startsWith(q.path) && path.split('/').length === q.path.split('/').length + 1) {
          const parts = path.split('/');
          const id = parts[parts.length - 1];
          if (!q.filter || q.filter(data)) {
            docs.push({ id, data: () => data });
          }
        }
      }
      return { docs };
    }),
    addDoc: vi.fn(async (collRef, data) => {
      const id = 'mock-id-' + Math.random().toString(36).substring(7);
      const path = `${collRef.path}/${id}`;
      mockFirestoreData.set(path, data);
      return { id, path };
    }),
    updateDoc: vi.fn(async (docRef, data) => {
      const existing = mockFirestoreData.get(docRef.path) || {};
      mockFirestoreData.set(docRef.path, { ...existing, ...data });
    }),
    deleteDoc: vi.fn(async (docRef) => {
      mockFirestoreData.delete(docRef.path);
    }),
    query: vi.fn((collRef) => collRef),
    where: vi.fn(),
    orderBy: vi.fn(),
    onSnapshot: vi.fn((q, callback) => {
      callback({ docs: [] });
      return () => {};
    }),
    arrayUnion: vi.fn((item) => [item]),
    arrayRemove: vi.fn((item) => []),
    runTransaction: vi.fn(async (db, updateFunction) => {
      const mockTx = {
        get: async (docRef) => {
          const exists = mockFirestoreData.has(docRef.path);
          return {
            exists: () => exists,
            id: docRef.id,
            data: () => mockFirestoreData.get(docRef.path)
          };
        },
        update: (docRef, data) => {
          const existing = mockFirestoreData.get(docRef.path) || {};
          mockFirestoreData.set(docRef.path, { ...existing, ...data });
        },
        set: (docRef, data) => {
          mockFirestoreData.set(docRef.path, data);
        }
      };
      return await updateFunction(mockTx);
    })
  };
});

import { 
  createGroup, 
  getUserProfile, 
  joinGroupByCode, 
  addTransaction, 
  addDebt, 
  addDebtPayment,
  addFixedExpense
} from '../lib/groups.js';

describe('Operaciones por Grupo (Firestore)', () => {
  beforeEach(() => {
    mockFirestoreData.clear();
  });

  const testUser = {
    uid: 'user-123',
    email: 'test@example.com',
    displayName: 'Tester'
  };

  it('crea un grupo nuevo y asigna activeGroupId al usuario', async () => {
    const groupId = await createGroup('Presupuesto Familiar', testUser);
    expect(groupId).toBeDefined();

    const profile = await getUserProfile(testUser.uid);
    expect(profile).toBeDefined();
    expect(profile.activeGroupId).toBe(groupId);
  });

  it('permite a otro usuario unirse a un grupo existente', async () => {
    const groupId = await createGroup('Casa Compartida', testUser);

    const newUser = { uid: 'user-456', email: 'roomie@example.com', displayName: 'Roomie' };
    const group = await joinGroupByCode(groupId, newUser);
    expect(group).toBeDefined();

    const profile = await getUserProfile(newUser.uid);
    expect(profile.activeGroupId).toBe(groupId);
  });

  it('registra una transacción bi-moneda dentro del grupo', async () => {
    const groupId = await createGroup('Mi Grupo', testUser);

    const txId = await addTransaction(groupId, {
      tipo: 'gasto',
      monto: 2000,
      moneda: 'VES',
      tasaBCV: 200,
      fecha: '2026-02-20',
      descripcion: 'Supermercado'
    }, testUser);

    expect(txId).toBeDefined();
  });

  it('registra una deuda y realiza un abono atómico actualizando el saldo', async () => {
    const groupId = await createGroup('Mi Grupo', testUser);

    const debtId = await addDebt(groupId, {
      persona: 'Carlos',
      direccion: 'me_deben',
      monto: 100,
      fecha: '2026-02-20'
    }, testUser);

    expect(debtId).toBeDefined();

    // Abonar $40 a la deuda
    await addDebtPayment(groupId, debtId, {
      monto: 40,
      moneda: 'USD',
      fecha: '2026-02-21'
    }, testUser);

    const debtSnap = mockFirestoreData.get(`groups/${groupId}/debts/${debtId}`);
    expect(debtSnap.saldoPendiente).toBe(60);
    expect(debtSnap.estado).toBe('pendiente');
  });

  it('crea un gasto fijo recurrente en el grupo', async () => {
    const groupId = await createGroup('Mi Grupo', testUser);

    const expenseId = await addFixedExpense(groupId, {
      nombre: 'Internet Fibra',
      monto: 35,
      diaVencimiento: 5,
      frecuencia: 'mensual'
    }, testUser);

    expect(expenseId).toBeDefined();
  });
});

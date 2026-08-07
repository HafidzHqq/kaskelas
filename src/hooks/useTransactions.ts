'use client';

import { useState, useEffect, useCallback } from 'react';
import { Transaction } from '@/types';
import { getFirestoreDb, isFirebaseConfigured } from '@/lib/firebase';
import {
  collection,
  addDoc,
  deleteDoc,
  updateDoc,
  doc,
  query,
  onSnapshot,
  serverTimestamp,
  orderBy,
} from 'firebase/firestore';

const STORAGE_KEY = 'kas-kelas-transactions';
const DB_PATH = 'transactions';

function readLocal(): Transaction[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function writeLocal(data: Transaction[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // Storage quota exceeded, silently ignore
  }
}

export function useTransactions() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [source, setSource] = useState<'local' | 'firebase'>('local');

  useEffect(() => {
    const sortHelper = (txs: Transaction[]) => {
      return [...txs].sort((a, b) => {
        const dateDiff = new Date(b.date).getTime() - new Date(a.date).getTime();
        if (dateDiff !== 0) return dateDiff;
        return b.createdAt - a.createdAt;
      });
    };

    if (!isFirebaseConfigured()) {
      setTransactions(sortHelper(readLocal()));
      setLoading(false);
      setSource('local');
      return;
    }

    const db = getFirestoreDb();
    if (!db) {
      setTransactions(sortHelper(readLocal()));
      setLoading(false);
      setSource('local');
      return;
    }

    try {
      setSource('firebase');
      const q = query(
        collection(db, DB_PATH),
        orderBy('createdAt', 'desc')
      );

      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          const items = snapshot.docs.map((d) => {
            const data = d.data();
            let createdAt = Date.now();
            if (data.createdAt) {
              if (typeof data.createdAt.toMillis === 'function') {
                createdAt = data.createdAt.toMillis();
              } else if (data.createdAt.seconds) {
                createdAt = data.createdAt.seconds * 1000;
              } else if (typeof data.createdAt === 'number') {
                createdAt = data.createdAt;
              }
            }
            return {
              id: d.id,
              ...data,
              createdAt,
            } as Transaction;
          });
          
          setTransactions(sortHelper(items));
          setLoading(false);
        },
        (err) => {
          console.error('Firestore snapshot error:', err);
          setError('Gagal memuat dari Firebase, menggunakan data lokal.');
          setTransactions(sortHelper(readLocal()));
          setSource('local');
          setLoading(false);
        }
      );

      return () => unsubscribe();
    } catch {
      setTransactions(sortHelper(readLocal()));
      setLoading(false);
      setSource('local');
      return;
    }
  }, []);

  const addTransaction = useCallback(
    async (
      tx: Omit<Transaction, 'id' | 'createdAt'>
    ) => {
      const newTx: Transaction = {
        ...tx,
        id: typeof crypto !== 'undefined' && 'randomUUID' in crypto
          ? crypto.randomUUID()
          : Math.random().toString(36).slice(2) + Date.now().toString(36),
        createdAt: Date.now(),
      };

      if (source === 'firebase') {
        const db = getFirestoreDb();
        if (db) {
          const docRef = await addDoc(collection(db, DB_PATH), {
            type: tx.type,
            amount: tx.amount,
            category: tx.category || null,
            description: tx.description,
            date: tx.date,
            source: tx.source || null,
            memberIds: tx.memberIds || null,
            createdAt: serverTimestamp(),
          });
          newTx.id = docRef.id;
        }
      }

      setTransactions((prev) => {
        const updated = [newTx, ...prev];
        updated.sort((a, b) => {
          const dateDiff = new Date(b.date).getTime() - new Date(a.date).getTime();
          if (dateDiff !== 0) return dateDiff;
          return b.createdAt - a.createdAt;
        });
        writeLocal(updated);
        return updated;
      });
    },
    [source]
  );

  const updateTransaction = useCallback(
    async (id: string, data: Partial<Transaction>) => {
      if (source === 'firebase') {
        const db = getFirestoreDb();
        if (db) {
          const docRef = doc(db, DB_PATH, id);
          await updateDoc(docRef, data);
        }
      }

      setTransactions((prev) => {
        const updated = prev.map((tx) => (tx.id === id ? { ...tx, ...data } : tx));
        updated.sort((a, b) => {
          const dateDiff = new Date(b.date).getTime() - new Date(a.date).getTime();
          if (dateDiff !== 0) return dateDiff;
          return b.createdAt - a.createdAt;
        });
        writeLocal(updated);
        return updated;
      });
    },
    [source]
  );

  const deleteTransaction = useCallback(
    async (id: string) => {
      if (source === 'firebase') {
        const db = getFirestoreDb();
        if (db) {
          await deleteDoc(doc(db, DB_PATH, id));
        }
      }

      setTransactions((prev) => {
        const updated = prev.filter((tx) => tx.id !== id);
        writeLocal(updated);
        return updated;
      });
    },
    [source]
  );

  const stats = {
    totalSaldo: transactions.reduce(
      (acc, tx) => (tx.type === 'income' ? acc + tx.amount : acc - tx.amount),
      0
    ),
    totalPemasukan: transactions
      .filter((tx) => tx.type === 'income')
      .reduce((acc, tx) => acc + tx.amount, 0),
    totalPengeluaran: transactions
      .filter((tx) => tx.type === 'expense')
      .reduce((acc, tx) => acc + tx.amount, 0),
    jumlahTransaksi: transactions.length,
    bulanIni: {
      pemasukan: transactions
        .filter(
          (tx) =>
            tx.type === 'income' &&
            new Date(tx.date).getMonth() === new Date().getMonth() &&
            new Date(tx.date).getFullYear() === new Date().getFullYear()
        )
        .reduce((acc, tx) => acc + tx.amount, 0),
      pengeluaran: transactions
        .filter(
          (tx) =>
            tx.type === 'expense' &&
            new Date(tx.date).getMonth() === new Date().getMonth() &&
            new Date(tx.date).getFullYear() === new Date().getFullYear()
        )
        .reduce((acc, tx) => acc + tx.amount, 0),
    },
  };

  return {
    transactions,
    stats,
    loading,
    error,
    source,
    addTransaction,
    updateTransaction,
    deleteTransaction,
  };
}

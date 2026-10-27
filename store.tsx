import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  calculateDashboardMetrics,
  createTransaction,
  type AccountingTransaction,
  type AuditEvent,
  type LedgerState,
  type OutboxItem,
  type Party,
} from "./domain";
import { loadLedgerState, resetLedgerState, saveLedgerState } from "./storage";

export type NewTransactionInput = Omit<
  AccountingTransaction,
  "id" | "version" | "idempotencyKey" | "createdAt" | "syncStatus"
>;

type LedgerContextValue = {
  state: LedgerState;
  loading: boolean;
  metrics: ReturnType<typeof calculateDashboardMetrics>;
  addTransaction: (
    input: NewTransactionInput,
  ) => Promise<AccountingTransaction>;
  syncPending: () => Promise<number>;
  resetDemo: () => Promise<void>;
  findParty: (id?: string) => Party | undefined;
};

const LedgerContext = createContext<LedgerContextValue | null>(null);

export function LedgerProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<LedgerState>({
    transactions: [],
    parties: [],
    auditEvents: [],
    outbox: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLedgerState().then((loaded) => {
      setState(loaded);
      setLoading(false);
    });
  }, []);

  const persist = useCallback(async (next: LedgerState) => {
    setState(next);
    await saveLedgerState(next);
  }, []);

  const addTransaction = useCallback(
    async (input: NewTransactionInput) => {
      const transaction = createTransaction(input);
      const audit: AuditEvent = {
        id: `audit-${transaction.id}`,
        actor: "کاربر فعلی",
        action: "created",
        entity: "transaction",
        entityId: transaction.id,
        after: transaction,
        timestamp: new Date().toISOString(),
        device: "android-preview",
        branch: transaction.branch,
      };
      const outbox: OutboxItem = {
        id: `outbox-${transaction.id}`,
        entityId: transaction.id,
        operation: "create",
        idempotencyKey: transaction.idempotencyKey,
        version: transaction.version,
        status: "pending",
        attempts: 0,
        createdAt: transaction.createdAt,
      };
      await persist({
        ...state,
        transactions: [transaction, ...state.transactions],
        auditEvents: [audit, ...state.auditEvents],
        outbox: [outbox, ...state.outbox],
      });
      return transaction;
    },
    [persist, state],
  );

  const syncPending = useCallback(async () => {
    const pendingIds = new Set(
      state.outbox
        .filter((item) => item.status === "pending")
        .map((item) => item.entityId),
    );
    if (!pendingIds.size) return 0;
    const next: LedgerState = {
      ...state,
      transactions: state.transactions.map((transaction) =>
        pendingIds.has(transaction.id)
          ? { ...transaction, syncStatus: "synced" }
          : transaction,
      ),
      outbox: state.outbox.map((item) =>
        pendingIds.has(item.entityId)
          ? { ...item, status: "synced", attempts: item.attempts + 1 }
          : item,
      ),
    };
    await persist(next);
    return pendingIds.size;
  }, [persist, state]);

  const resetDemo = useCallback(async () => {
    const next = await resetLedgerState();
    setState(next);
  }, []);

  const value = useMemo<LedgerContextValue>(
    () => ({
      state,
      loading,
      metrics: calculateDashboardMetrics(state.transactions),
      addTransaction,
      syncPending,
      resetDemo,
      findParty: (id) => state.parties.find((party) => party.id === id),
    }),
    [addTransaction, loading, resetDemo, state, syncPending],
  );

  return (
    <LedgerContext.Provider value={value}>{children}</LedgerContext.Provider>
  );
}

export function useLedger() {
  const context = useContext(LedgerContext);
  if (!context) throw new Error("useLedger must be used inside LedgerProvider");
  return context;
}

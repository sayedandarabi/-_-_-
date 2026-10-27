export type TransactionType =
  | "income"
  | "expense"
  | "sale"
  | "purchase"
  | "transfer"
  | "manual";
export type SyncStatus = "pending" | "synced" | "conflict";
export type Currency = "AFN" | "USD";

export type AccountingTransaction = {
  id: string;
  type: TransactionType;
  amount: number;
  currency: Currency;
  date: string;
  debitAccount: string;
  creditAccount: string;
  partyId?: string;
  partyName?: string;
  description: string;
  branch: string;
  paymentMethod: "cash" | "bank" | "mobile" | "credit";
  receiptUri?: string;
  syncStatus: SyncStatus;
  version: number;
  idempotencyKey: string;
  createdAt: string;
};

export type LedgerLine = {
  account: string;
  debit: number;
  credit: number;
  transactionId: string;
  date: string;
};

export type BalancedEntry = {
  transactionId: string;
  lines: [LedgerLine, LedgerLine];
};

export type Party = {
  id: string;
  name: string;
  kind: "customer" | "supplier" | "both";
  phone?: string;
  balance: number;
  lastActivity: string;
};

export type AuditEvent = {
  id: string;
  actor: string;
  action: "created" | "updated" | "reversed";
  entity: "transaction";
  entityId: string;
  before?: Partial<AccountingTransaction>;
  after?: Partial<AccountingTransaction>;
  timestamp: string;
  device: string;
  branch: string;
};

export type OutboxItem = {
  id: string;
  entityId: string;
  operation: "create" | "update" | "reverse";
  idempotencyKey: string;
  version: number;
  status: SyncStatus;
  attempts: number;
  createdAt: string;
};

export type LedgerState = {
  transactions: AccountingTransaction[];
  parties: Party[];
  auditEvents: AuditEvent[];
  outbox: OutboxItem[];
};

export type DashboardMetrics = {
  income: number;
  expense: number;
  profit: number;
  cashBalance: number;
  receivables: number;
  pendingSync: number;
  transactionCount: number;
};

export function createBalancedEntry(
  transaction: AccountingTransaction,
): BalancedEntry {
  if (!Number.isFinite(transaction.amount) || transaction.amount <= 0) {
    throw new Error("Amount must be positive");
  }
  if (!transaction.debitAccount || !transaction.creditAccount) {
    throw new Error("Both debit and credit accounts are required");
  }
  if (
    transaction.debitAccount === transaction.creditAccount &&
    transaction.type !== "manual"
  ) {
    throw new Error("Debit and credit accounts must be different");
  }
  return {
    transactionId: transaction.id,
    lines: [
      {
        account: transaction.debitAccount,
        debit: transaction.amount,
        credit: 0,
        transactionId: transaction.id,
        date: transaction.date,
      },
      {
        account: transaction.creditAccount,
        debit: 0,
        credit: transaction.amount,
        transactionId: transaction.id,
        date: transaction.date,
      },
    ],
  };
}

export function getLedgerTotals(lines: LedgerLine[]) {
  return lines.reduce(
    (totals, line) => ({
      debit: totals.debit + line.debit,
      credit: totals.credit + line.credit,
    }),
    { debit: 0, credit: 0 },
  );
}

export function calculateDashboardMetrics(
  transactions: AccountingTransaction[],
): DashboardMetrics {
  const afn = transactions.filter(
    (transaction) => transaction.currency === "AFN",
  );
  const income = afn
    .filter(
      (transaction) =>
        transaction.type === "income" || transaction.type === "sale",
    )
    .reduce((sum, transaction) => sum + transaction.amount, 0);
  const expense = afn
    .filter(
      (transaction) =>
        transaction.type === "expense" || transaction.type === "purchase",
    )
    .reduce((sum, transaction) => sum + transaction.amount, 0);
  const transferIn = afn
    .filter(
      (transaction) =>
        transaction.type === "transfer" && transaction.debitAccount === "cash",
    )
    .reduce((sum, transaction) => sum + transaction.amount, 0);
  const transferOut = afn
    .filter(
      (transaction) =>
        transaction.type === "transfer" && transaction.creditAccount === "cash",
    )
    .reduce((sum, transaction) => sum + transaction.amount, 0);
  const receivables = afn
    .filter((transaction) => transaction.debitAccount === "receivable")
    .reduce((sum, transaction) => sum + transaction.amount, 0);
  return {
    income,
    expense,
    profit: income - expense,
    cashBalance: income - expense + transferIn - transferOut,
    receivables,
    pendingSync: transactions.filter(
      (transaction) => transaction.syncStatus === "pending",
    ).length,
    transactionCount: transactions.length,
  };
}

export function formatAfghani(value: number) {
  return `${new Intl.NumberFormat("fa-AF", { maximumFractionDigits: 0 }).format(value)} ؋`;
}

export function formatShortDate(date: string) {
  return new Intl.DateTimeFormat("fa-AF", {
    month: "short",
    day: "numeric",
  }).format(new Date(date));
}

export function createId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function createTransaction(
  input: Omit<
    AccountingTransaction,
    "id" | "version" | "idempotencyKey" | "createdAt" | "syncStatus"
  >,
): AccountingTransaction {
  const id = createId("tx");
  const transaction: AccountingTransaction = {
    ...input,
    id,
    version: 1,
    idempotencyKey: createId("idem"),
    createdAt: new Date().toISOString(),
    syncStatus: "pending",
  };
  createBalancedEntry(transaction);
  return transaction;
}

export function getTransactionTypeLabel(type: TransactionType) {
  return {
    income: "دریافت",
    expense: "پرداخت",
    sale: "فروش",
    purchase: "خرید",
    transfer: "انتقال",
    manual: "سند دستی",
  }[type];
}

export function getSyncLabel(status: SyncStatus) {
  return {
    pending: "در انتظار همگام‌سازی",
    synced: "همگام‌شده",
    conflict: "نیازمند بررسی",
  }[status];
}

export const seedState: LedgerState = {
  transactions: [
    {
      id: "tx-seed-1",
      type: "sale",
      amount: 18500,
      currency: "AFN",
      date: "2026-10-27T09:30:00.000Z",
      debitAccount: "cash",
      creditAccount: "sales",
      partyId: "party-pamir",
      partyName: "فروشگاه پامیر",
      description: "فروش نقدی روزانه",
      branch: "شعبه مرکزی",
      paymentMethod: "cash",
      syncStatus: "synced",
      version: 1,
      idempotencyKey: "seed-idem-1",
      createdAt: "2026-10-27T09:30:00.000Z",
    },
    {
      id: "tx-seed-2",
      type: "expense",
      amount: 4200,
      currency: "AFN",
      date: "2026-10-26T11:10:00.000Z",
      debitAccount: "expense",
      creditAccount: "cash",
      partyName: "کرایه دفتر",
      description: "کرایه و خدمات دفتر",
      branch: "شعبه مرکزی",
      paymentMethod: "cash",
      syncStatus: "synced",
      version: 1,
      idempotencyKey: "seed-idem-2",
      createdAt: "2026-10-26T11:10:00.000Z",
    },
    {
      id: "tx-seed-3",
      type: "income",
      amount: 12000,
      currency: "AFN",
      date: "2026-10-25T07:45:00.000Z",
      debitAccount: "cash",
      creditAccount: "sales",
      partyId: "party-kabul",
      partyName: "احمدی و برادران",
      description: "دریافت حساب مشتری",
      branch: "شعبه مرکزی",
      paymentMethod: "mobile",
      syncStatus: "pending",
      version: 1,
      idempotencyKey: "seed-idem-3",
      createdAt: "2026-10-25T07:45:00.000Z",
    },
    {
      id: "tx-seed-4",
      type: "purchase",
      amount: 6800,
      currency: "AFN",
      date: "2026-10-24T14:20:00.000Z",
      debitAccount: "inventory",
      creditAccount: "cash",
      partyId: "party-arya",
      partyName: "تأمین‌کننده آریا",
      description: "خرید کالا برای انبار",
      branch: "شعبه مرکزی",
      paymentMethod: "bank",
      syncStatus: "synced",
      version: 1,
      idempotencyKey: "seed-idem-4",
      createdAt: "2026-10-24T14:20:00.000Z",
    },
  ],
  parties: [
    {
      id: "party-pamir",
      name: "فروشگاه پامیر",
      kind: "customer",
      phone: "0700 123 456",
      balance: 18500,
      lastActivity: "2026-10-27",
    },
    {
      id: "party-kabul",
      name: "احمدی و برادران",
      kind: "customer",
      phone: "0701 222 890",
      balance: 12000,
      lastActivity: "2026-10-25",
    },
    {
      id: "party-arya",
      name: "تأمین‌کننده آریا",
      kind: "supplier",
      phone: "0799 764 122",
      balance: -6800,
      lastActivity: "2026-10-24",
    },
  ],
  auditEvents: [],
  outbox: [
    {
      id: "outbox-3",
      entityId: "tx-seed-3",
      operation: "create",
      idempotencyKey: "seed-idem-3",
      version: 1,
      status: "pending",
      attempts: 0,
      createdAt: "2026-10-25T07:45:00.000Z",
    },
  ],
};

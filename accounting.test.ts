import { describe, expect, it } from "vitest";
import {
  calculateDashboardMetrics,
  createBalancedEntry,
  formatAfghani,
  getLedgerTotals,
  type AccountingTransaction,
} from "@/lib/accounting/domain";

describe("double-entry accounting domain", () => {
  const tx: AccountingTransaction = {
    id: "tx-1",
    type: "income",
    amount: 12500,
    currency: "AFN",
    date: "2026-10-27",
    debitAccount: "cash",
    creditAccount: "sales",
    partyId: "party-1",
    partyName: "فروشگاه پامیر",
    description: "فروش نقدی",
    branch: "شعبه مرکزی",
    paymentMethod: "cash",
    syncStatus: "synced",
    version: 1,
    idempotencyKey: "idem-1",
    createdAt: "2026-10-27T08:00:00.000Z",
  };

  it("creates equal debit and credit lines", () => {
    const entry = createBalancedEntry(tx);
    expect(entry.lines).toHaveLength(2);
    expect(getLedgerTotals(entry.lines)).toEqual({
      debit: 12500,
      credit: 12500,
    });
  });

  it("rejects invalid amounts before persistence", () => {
    expect(() => createBalancedEntry({ ...tx, amount: 0 })).toThrow(/positive/);
    expect(() => createBalancedEntry({ ...tx, amount: -1 })).toThrow(
      /positive/,
    );
  });

  it("calculates dashboard totals without mixing currencies", () => {
    const metrics = calculateDashboardMetrics([
      tx,
      { ...tx, id: "tx-2", type: "expense", amount: 2500 },
    ]);
    expect(metrics.income).toBe(12500);
    expect(metrics.expense).toBe(2500);
    expect(metrics.profit).toBe(10000);
    expect(metrics.cashBalance).toBe(10000);
  });

  it("formats AFN for a Persian accounting surface", () => {
    expect(formatAfghani(12500)).toContain("۱۲٬۵۰۰");
  });
});

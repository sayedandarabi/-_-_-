import {
  int,
  mysqlEnum,
  mysqlTable,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

export const organizations = mysqlTable("organizations", {
  id: varchar("id", { length: 64 }).primaryKey(),
  ownerId: int("ownerId")
    .notNull()
    .references(() => users.id),
  name: varchar("name", { length: 160 }).notNull(),
  businessType: varchar("businessType", { length: 80 }),
  region: varchar("region", { length: 80 }),
  currency: varchar("currency", { length: 3 }).default("AFN").notNull(),
  subscriptionStatus: mysqlEnum("subscriptionStatus", [
    "trial",
    "active",
    "past_due",
    "expired",
  ])
    .default("trial")
    .notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const branches = mysqlTable("branches", {
  id: varchar("id", { length: 64 }).primaryKey(),
  organizationId: varchar("organizationId", { length: 64 })
    .notNull()
    .references(() => organizations.id),
  name: varchar("name", { length: 120 }).notNull(),
  address: varchar("address", { length: 255 }),
  isActive: int("isActive").default(1).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const accounts = mysqlTable("accounts", {
  id: varchar("id", { length: 64 }).primaryKey(),
  organizationId: varchar("organizationId", { length: 64 })
    .notNull()
    .references(() => organizations.id),
  branchId: varchar("branchId", { length: 64 }).references(() => branches.id),
  code: varchar("code", { length: 32 }).notNull(),
  name: varchar("name", { length: 120 }).notNull(),
  type: mysqlEnum("type", [
    "asset",
    "liability",
    "equity",
    "income",
    "expense",
  ]).notNull(),
  currency: varchar("currency", { length: 3 }).default("AFN").notNull(),
  isActive: int("isActive").default(1).notNull(),
});

export const parties = mysqlTable("parties", {
  id: varchar("id", { length: 64 }).primaryKey(),
  organizationId: varchar("organizationId", { length: 64 })
    .notNull()
    .references(() => organizations.id),
  name: varchar("name", { length: 160 }).notNull(),
  kind: mysqlEnum("kind", ["customer", "supplier", "both"]).notNull(),
  phone: varchar("phone", { length: 32 }),
  isActive: int("isActive").default(1).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const accountingTransactions = mysqlTable("accountingTransactions", {
  id: varchar("id", { length: 64 }).primaryKey(),
  organizationId: varchar("organizationId", { length: 64 })
    .notNull()
    .references(() => organizations.id),
  branchId: varchar("branchId", { length: 64 }).references(() => branches.id),
  partyId: varchar("partyId", { length: 64 }).references(() => parties.id),
  type: mysqlEnum("type", [
    "income",
    "expense",
    "sale",
    "purchase",
    "transfer",
    "manual",
  ]).notNull(),
  amount: int("amount").notNull(),
  currency: varchar("currency", { length: 3 }).default("AFN").notNull(),
  transactionDate: timestamp("transactionDate").notNull(),
  description: text("description").notNull(),
  paymentMethod: mysqlEnum("paymentMethod", [
    "cash",
    "bank",
    "mobile",
    "credit",
  ]).notNull(),
  syncStatus: mysqlEnum("syncStatus", ["pending", "synced", "conflict"])
    .default("synced")
    .notNull(),
  version: int("version").default(1).notNull(),
  idempotencyKey: varchar("idempotencyKey", { length: 96 }).notNull().unique(),
  createdBy: int("createdBy")
    .notNull()
    .references(() => users.id),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const transactionLines = mysqlTable("transactionLines", {
  id: varchar("id", { length: 64 }).primaryKey(),
  transactionId: varchar("transactionId", { length: 64 })
    .notNull()
    .references(() => accountingTransactions.id),
  accountId: varchar("accountId", { length: 64 })
    .notNull()
    .references(() => accounts.id),
  debit: int("debit").default(0).notNull(),
  credit: int("credit").default(0).notNull(),
});

export const auditEvents = mysqlTable("auditEvents", {
  id: varchar("id", { length: 64 }).primaryKey(),
  organizationId: varchar("organizationId", { length: 64 })
    .notNull()
    .references(() => organizations.id),
  actorId: int("actorId")
    .notNull()
    .references(() => users.id),
  entity: varchar("entity", { length: 64 }).notNull(),
  entityId: varchar("entityId", { length: 64 }).notNull(),
  action: mysqlEnum("action", ["created", "updated", "reversed"]).notNull(),
  beforeJson: text("beforeJson"),
  afterJson: text("afterJson"),
  device: varchar("device", { length: 120 }),
  correlationId: varchar("correlationId", { length: 96 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const syncOutbox = mysqlTable("syncOutbox", {
  id: varchar("id", { length: 64 }).primaryKey(),
  organizationId: varchar("organizationId", { length: 64 })
    .notNull()
    .references(() => organizations.id),
  entityId: varchar("entityId", { length: 64 }).notNull(),
  operation: mysqlEnum("operation", ["create", "update", "reverse"]).notNull(),
  idempotencyKey: varchar("idempotencyKey", { length: 96 }).notNull().unique(),
  version: int("version").default(1).notNull(),
  status: mysqlEnum("status", ["pending", "synced", "conflict"])
    .default("pending")
    .notNull(),
  attempts: int("attempts").default(0).notNull(),
  lastError: text("lastError"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Organization = typeof organizations.$inferSelect;
export type Branch = typeof branches.$inferSelect;
export type Account = typeof accounts.$inferSelect;
export type Party = typeof parties.$inferSelect;
export type AccountingTransaction = typeof accountingTransactions.$inferSelect;
export type TransactionLine = typeof transactionLines.$inferSelect;

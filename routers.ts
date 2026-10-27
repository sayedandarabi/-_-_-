import {
  getSessionCookieName,
  getSessionCookieOptions,
} from "./_core/cookies";
import { and, desc, eq } from "drizzle-orm";
import { z } from "zod";
import { accountingTransactions, organizations, syncOutbox } from "../drizzle/schema";
import { getDb } from "./db";
import { systemRouter } from "./_core/systemRouter";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";

export const appRouter = router({
  // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(getSessionCookieName(ctx.req), {
        ...cookieOptions,
        maxAge: -1,
      });
      return {
        success: true,
      } as const;
    }),
  }),

  accounting: router({
    transactions: protectedProcedure
      .input(z.object({ organizationId: z.string().min(1).max(64) }))
      .query(async ({ input, ctx }) => {
        const db = await getDb();
        if (!db) return [];
        const rows = await db
          .select({ transaction: accountingTransactions })
          .from(accountingTransactions)
          .innerJoin(organizations, eq(organizations.id, accountingTransactions.organizationId))
          .where(and(eq(accountingTransactions.organizationId, input.organizationId), eq(organizations.ownerId, ctx.user.id)))
          .orderBy(desc(accountingTransactions.transactionDate))
          .limit(100);
        return rows.map((row) => row.transaction);
      }),
    enqueue: protectedProcedure
      .input(z.object({ organizationId: z.string().min(1).max(64), entityId: z.string().min(1).max(64), operation: z.enum(["create", "update", "reverse"]), idempotencyKey: z.string().min(1).max(96), version: z.number().int().positive() }))
      .mutation(async ({ input, ctx }) => {
        const db = await getDb();
        if (!db) return { accepted: false, reason: "database_unavailable" as const };
        const owner = await db.select({ id: organizations.id }).from(organizations).where(and(eq(organizations.id, input.organizationId), eq(organizations.ownerId, ctx.user.id))).limit(1);
        if (!owner.length) return { accepted: false, reason: "organization_not_found" as const };
        await db.insert(syncOutbox).values({ id: `outbox-${input.idempotencyKey}`, organizationId: input.organizationId, entityId: input.entityId, operation: input.operation, idempotencyKey: input.idempotencyKey, version: input.version, status: "pending", attempts: 0 }).onDuplicateKeyUpdate({ set: { version: input.version, status: "pending" } });
        return { accepted: true as const, reason: "queued" as const };
      }),
  }),
});

export type AppRouter = typeof appRouter;

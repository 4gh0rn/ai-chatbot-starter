import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const createUser = mutation({
  args: {
    email: v.string(),
    password: v.optional(v.string()),
    type: v.union(v.literal("guest"), v.literal("regular")),
  },
  handler: async (ctx, args) => {
    const userId = await ctx.db.insert("users", {
      email: args.email,
      password: args.password,
      type: args.type,
      createdAt: Date.now(),
    });
    return userId;
  },
});

export const getUserByEmail = query({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();
  },
});

export const getUserById = query({
  args: { id: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const createGuestUser = mutation({
  handler: async (ctx) => {
    const guestEmail = `guest-${Math.random().toString(36).substring(2)}@guest.local`;
    const userId = await ctx.db.insert("users", {
      email: guestEmail,
      type: "guest",
      createdAt: Date.now(),
    });
    const user = await ctx.db.get(userId);
    return user;
  },
});

// 2FA Mutations
export const setupTwoFactor = mutation({
  args: {
    userId: v.id("users"),
    secret: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.userId, {
      twoFactorSecret: args.secret,
      twoFactorEnabled: false, // Setup but not enabled yet
    });
    return { success: true };
  },
});

export const enableTwoFactor = mutation({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    // Generate 8 backup codes
    const backupCodes = Array.from({ length: 8 }, () => 
      Math.random().toString(36).substring(2, 8).toUpperCase()
    );

    await ctx.db.patch(args.userId, {
      twoFactorEnabled: true,
      backupCodes: backupCodes,
    });

    return { success: true, backupCodes };
  },
});

export const disableTwoFactor = mutation({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.userId, {
      twoFactorEnabled: false,
      twoFactorSecret: undefined,
      backupCodes: undefined,
    });
    return { success: true };
  },
});

export const useBackupCode = mutation({
  args: {
    userId: v.id("users"),
    code: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user || !user.backupCodes) {
      return { success: false, error: "No backup codes available" };
    }

    const codeIndex = user.backupCodes.indexOf(args.code);
    if (codeIndex === -1) {
      return { success: false, error: "Invalid backup code" };
    }

    // Remove the used backup code
    const updatedCodes = user.backupCodes.filter((_, index) => index !== codeIndex);
    await ctx.db.patch(args.userId, {
      backupCodes: updatedCodes,
    });

    return { success: true, remainingCodes: updatedCodes.length };
  },
});

export const regenerateBackupCodes = mutation({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const backupCodes = Array.from({ length: 8 }, () => 
      Math.random().toString(36).substring(2, 8).toUpperCase()
    );

    await ctx.db.patch(args.userId, {
      backupCodes: backupCodes,
    });

    return { success: true, backupCodes };
  },
});

// 2FA Queries
export const getTwoFactorStatus = query({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user) {
      return { enabled: false, hasSecret: false };
    }
    return {
      enabled: user.twoFactorEnabled || false,
      hasSecret: !!user.twoFactorSecret,
      backupCodesCount: user.backupCodes?.length || 0,
    };
  },
});

export const getBackupCodes = query({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    return user?.backupCodes || [];
  },
});

import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router, protectedProcedure, adminProcedure } from "./_core/trpc";
import { z } from "zod";
import * as db from "./db";
import { TRPCError } from "@trpc/server";

// Helper to get the last inserted ID from a result
function getInsertedId(result: any): number {
  return result.insertId || result[0]?.id || 0;
}

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  // Products router
  products: router({
    list: publicProcedure.query(() => db.getAllProducts()),
    
    getById: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(({ input }) => db.getProductById(input.id)),
    
    getByCategory: publicProcedure
      .input(z.object({ category: z.string() }))
      .query(({ input }) => db.getProductsByCategory(input.category)),
    
    create: adminProcedure
      .input(z.object({
        name: z.string(),
        description: z.string().optional(),
        price: z.string(),
        category: z.string(),
        imageUrl: z.string().optional(),
        stock: z.number().default(0),
      }))
      .mutation(async ({ input }) => {
        return db.createProduct({
          name: input.name,
          description: input.description,
          price: input.price,
          category: input.category,
          imageUrl: input.imageUrl,
          stock: input.stock,
        });
      }),
    
    update: adminProcedure
      .input(z.object({
        id: z.number(),
        name: z.string().optional(),
        description: z.string().optional(),
        price: z.string().optional(),
        category: z.string().optional(),
        imageUrl: z.string().optional(),
        stock: z.number().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...updates } = input;
        return db.updateProduct(id, updates);
      }),
    
    delete: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        return db.deleteProduct(input.id);
      }),
  }),

  // Cart router
  cart: router({
    list: protectedProcedure.query(({ ctx }) => db.getCartItems(ctx.user.id)),
    
    add: protectedProcedure
      .input(z.object({
        productId: z.number(),
        quantity: z.number().min(1).default(1),
      }))
      .mutation(async ({ input, ctx }) => {
        // Verify product exists
        const product = await db.getProductById(input.productId);
        if (!product) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Product not found" });
        }
        
        // Check stock
        if (product.stock < input.quantity) {
          throw new TRPCError({ code: "BAD_REQUEST", message: "Insufficient stock available" });
        }
        
        return db.addToCart({
          userId: ctx.user.id,
          productId: input.productId,
          quantity: input.quantity,
        });
      }),
    
    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        quantity: z.number(),
      }))
      .mutation(async ({ input, ctx }) => {
        // Verify ownership of cart item
        const cartItems = await db.getCartItems(ctx.user.id);
        const item = cartItems.find(ci => ci.id === input.id);
        if (!item) {
          throw new TRPCError({ code: "FORBIDDEN", message: "Cart item not found" });
        }
        
        // Validate quantity
        if (input.quantity < 1) {
          throw new TRPCError({ code: "BAD_REQUEST", message: "Quantity must be at least 1" });
        }
        
        // Check product stock
        const product = await db.getProductById(item.productId);
        if (!product) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Product not found" });
        }
        if (product.stock < input.quantity) {
          throw new TRPCError({ code: "BAD_REQUEST", message: "Insufficient stock" });
        }
        
        return db.updateCartItem(input.id, input.quantity);
      }),
    
    remove: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input, ctx }) => {
        // Verify ownership of cart item
        const cartItems = await db.getCartItems(ctx.user.id);
        const item = cartItems.find(ci => ci.id === input.id);
        if (!item) {
          throw new TRPCError({ code: "FORBIDDEN", message: "Cart item not found" });
        }
        return db.removeFromCart(input.id);
      }),
    
    clear: protectedProcedure.mutation(({ ctx }) => db.clearCart(ctx.user.id)),
  }),

  // Orders router
  orders: router({
    list: adminProcedure.query(() => db.getAllOrders()),
    
    getById: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        const order = await db.getOrderById(input.id);
        if (!order) {
          throw new TRPCError({ code: "FORBIDDEN" });
        }
        return order;
      }),
    
    create: protectedProcedure
      .input(z.object({
        items: z.array(z.object({
          productId: z.number(),
          quantity: z.number().int().min(1),
          price: z.string(),
        })).min(1),
        totalAmount: z.string(),
      }))
      .mutation(async ({ input, ctx }) => {
        // Validate all products exist and have sufficient stock
        for (const item of input.items) {
          const product = await db.getProductById(item.productId);
          if (!product) {
            throw new TRPCError({ code: "NOT_FOUND", message: `Product ${item.productId} not found` });
          }
          if (product.stock < item.quantity) {
            throw new TRPCError({ code: "BAD_REQUEST", message: `Insufficient stock for ${product.name}` });
          }
        }
        
        const orderResult = await db.createOrder({
          customerName: "",
          customerPhone: "",
          totalAmount: input.totalAmount,
          status: "pending",
        });
        
        // Get the created order ID
        const orderId = getInsertedId(orderResult);
        
        if (!orderId) {
          throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to create order" });
        }
        
        // Add order items
        for (const item of input.items) {
          await db.addOrderItem({
            orderId,
            productId: item.productId,
            quantity: item.quantity,
            price: item.price,
          });
        }
        
        // Clear cart
        await db.clearCart(ctx.user.id);
        
        return { orderId };
      }),
    
    // Admin: get all orders
    getAllOrders: adminProcedure.query(() => db.getAllOrders()),
    
    getItems: protectedProcedure
      .input(z.object({ orderId: z.number() }))
      .query(async ({ input, ctx }) => {
        const order = await db.getOrderById(input.orderId);
        if (!order) {
          throw new TRPCError({ code: "FORBIDDEN" });
        }
        return db.getOrderItems(input.orderId);
      }),
  }),
});

export type AppRouter = typeof appRouter;

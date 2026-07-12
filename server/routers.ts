// Products router
  products: router({
    list: publicProcedure.query(() => db.getAllProducts()),
    
    getById: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(({ input }) => db.getProductById(input.id)),
    
    getByCategory: publicProcedure
      .input(z.object({ category: z.string() }))
      .query(({ input }) => db.getProductsByCategory(input.category)),
    
    // Switch to publicProcedure and look for ownerPassword
    create: publicProcedure
      .input(z.object({
        ownerPassword: z.string(), // MATCHES FRONTEND EXACTLY
        name: z.string(),
        description: z.string().optional(),
        price: z.string(),
        category: z.string(),
        imageUrl: z.string().optional(),
        stock: z.number().default(0),
      }))
      .mutation(async ({ input }) => {
        // Verify the password
        if (input.ownerPassword !== "StarMakers3D") {
          throw new TRPCError({ code: "UNAUTHORIZED", message: "Invalid Owner Password" });
        }
        
        // Pass original fields to db
        return db.createProduct({
          name: input.name,
          description: input.description,
          price: input.price,
          category: input.category,
          imageUrl: input.imageUrl,
          stock: input.stock,
        });
      }),
    
    // Switch to publicProcedure and look for ownerPassword
    update: publicProcedure
      .input(z.object({
        id: z.number(),
        ownerPassword: z.string(), // MATCHES FRONTEND EXACTLY
        name: z.string().optional(),
        description: z.string().optional(),
        price: z.string().optional(),
        category: z.string().optional(),
        imageUrl: z.string().optional(),
        stock: z.number().optional(),
      }))
      .mutation(async ({ input }) => {
        // Verify the password
        if (input.ownerPassword !== "StarMakers3D") {
          throw new TRPCError({ code: "UNAUTHORIZED", message: "Invalid Owner Password" });
        }

        // Strip the password out, pass the rest to db
        const { id, ownerPassword, ...updates } = input;
        return db.updateProduct(id, updates);
      }),
    
    // Switch to publicProcedure and look for ownerPassword
    delete: publicProcedure
      .input(z.object({ 
        id: z.number(),
        ownerPassword: z.string().optional(), // Adding optional just in case delete doesn't send it yet
      }))
      .mutation(async ({ input }) => {
        // Optional verification if you ever add the password to the delete button
        if (input.ownerPassword && input.ownerPassword !== "StarMakers3D") {
          throw new TRPCError({ code: "UNAUTHORIZED", message: "Invalid Owner Password" });
        }
        
        return db.deleteProduct(input.id);
      }),
  }),

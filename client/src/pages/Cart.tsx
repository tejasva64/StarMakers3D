import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Trash2, Plus, Minus, ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { trpc } from '@/lib/trpc';
import { useLocation } from 'wouter';

interface CartItemWithProduct {
  id: number;
  productId: number;
  quantity: number;
  product?: {
    name: string;
    price: string;
    imageUrl: string | null;
  };
}

export default function Cart() {
  const [, navigate] = useLocation();
  const { data: cartItems = [], refetch } = trpc.cart.list.useQuery();
  const { data: products = [] } = trpc.products.list.useQuery();

  const updateMutation = trpc.cart.update.useMutation();
  const removeMutation = trpc.cart.remove.useMutation();

  // Enrich cart items with product data
  const enrichedItems: CartItemWithProduct[] = cartItems.map(item => ({
    ...item,
    product: products.find(p => p.id === item.productId),
  }));

  const handleUpdateQuantity = async (itemId: number, newQuantity: number) => {
    if (newQuantity < 1) return;
    try {
      await updateMutation.mutateAsync({ id: itemId, quantity: newQuantity });
      refetch();
    } catch (error) {
      console.error('Failed to update quantity:', error);
    }
  };

  const handleRemoveItem = async (itemId: number) => {
    try {
      await removeMutation.mutateAsync({ id: itemId });
      refetch();
    } catch (error) {
      console.error('Failed to remove item:', error);
    }
  };

  // Calculate totals
  const subtotal = enrichedItems.reduce((sum, item) => {
    const price = item.product ? parseFloat(item.product.price) : 0;
    return sum + price * item.quantity;
  }, 0);

  const tax = subtotal * 0.08;
  const shipping = subtotal > 50 ? 0 : 10;
  const total = subtotal + tax + shipping;

  if (enrichedItems.length === 0) {
    return (
      <div className="min-h-screen bg-background py-12">
        <div className="container">
          <motion.div
            className="text-center py-12"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
          >
            <ShoppingBag className="w-16 h-16 mx-auto mb-4 text-foreground/40" />
            <h2 className="text-2xl font-bold mb-4">Your cart is empty</h2>
            <p className="text-foreground/60 mb-8">
              Start shopping to add items to your cart
            </p>
            <Button
              onClick={() => navigate('/products')}
              className="bg-cyan-400 hover:bg-cyan-500 text-background"
            >
              Continue Shopping
            </Button>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-12">
      <div className="container">
        <motion.h1
          className="text-4xl font-bold font-syne mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          Shopping Cart
        </motion.h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart items */}
          <div className="lg:col-span-2 space-y-4">
            {enrichedItems.map((item, index) => (
              <motion.div
                key={item.id}
                className="glass-card p-6 flex gap-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.05 }}
              >
                {/* Product image */}
                <div className="w-24 h-24 bg-white/5 rounded-lg overflow-hidden flex-shrink-0">
                  {item.product?.imageUrl && (
                    <img
                      src={item.product.imageUrl}
                      alt={item.product.name}
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>

                {/* Product details */}
                <div className="flex-1">
                  <h3 className="font-semibold text-lg mb-2">
                    {item.product?.name}
                  </h3>
                  <p className="text-cyan-400 font-semibold mb-4">
                    ${item.product ? parseFloat(item.product.price).toFixed(2) : '0.00'}
                  </p>

                  {/* Quantity controls */}
                  <div className="flex items-center gap-3 bg-white/5 rounded-lg p-2 w-fit">
                    <button
                      onClick={() =>
                        handleUpdateQuantity(item.id, item.quantity - 1)
                      }
                      className="p-1 hover:bg-white/10 rounded transition-colors"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="w-8 text-center font-semibold">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() =>
                        handleUpdateQuantity(item.id, item.quantity + 1)
                      }
                      className="p-1 hover:bg-white/10 rounded transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Price and remove */}
                <div className="text-right flex flex-col justify-between">
                  <p className="text-xl font-bold neon-glow-gold">
                    ${(
                      (item.product ? parseFloat(item.product.price) : 0) *
                      item.quantity
                    ).toFixed(2)}
                  </p>
                  <button
                    onClick={() => handleRemoveItem(item.id)}
                    className="text-red-400/60 hover:text-red-400 transition-colors"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Order summary */}
          <motion.div
            className="glass-card p-6 h-fit sticky top-4"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-xl font-bold mb-6">Order Summary</h2>

            <div className="space-y-4 mb-6 pb-6 border-b border-white/10">
              <div className="flex justify-between text-foreground/60">
                <span>Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-foreground/60">
                <span>Tax (8%)</span>
                <span>${tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-foreground/60">
                <span>Shipping</span>
                <span>
                  {shipping === 0 ? (
                    <span className="text-green-400">Free</span>
                  ) : (
                    `$${shipping.toFixed(2)}`
                  )}
                </span>
              </div>
            </div>

            <div className="flex justify-between items-center mb-6 text-lg font-bold">
              <span>Total</span>
              <span className="neon-glow-gold text-2xl">
                ${total.toFixed(2)}
              </span>
            </div>

            <Button
              onClick={() => navigate('/checkout')}
              className="w-full magnetic-button bg-cyan-400 hover:bg-cyan-500 text-background font-semibold h-12 mb-3"
            >
              Proceed to Checkout
            </Button>

            <Button
              onClick={() => navigate('/products')}
              variant="outline"
              className="w-full border-purple-400/50 text-purple-400 hover:bg-purple-400/10"
            >
              Continue Shopping
            </Button>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

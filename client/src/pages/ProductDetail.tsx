import { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ShoppingCart, Star, Minus, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { trpc } from '@/lib/trpc';
import { useLocation } from 'wouter';

interface RouteParams {
  id: string;
}

export default function ProductDetail({ id }: RouteParams) {
  const [quantity, setQuantity] = useState(1);
  const [, navigate] = useLocation();

  const productId = parseInt(id);
  const { data: product, isLoading } = trpc.products.getById.useQuery({ id: productId });
  const cartAddMutation = trpc.cart.add.useMutation();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-foreground/60">Loading...</div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center">
        <p className="text-foreground/60 mb-4">Product not found</p>
        <Button onClick={() => navigate('/products')}>
          Back to Products
        </Button>
      </div>
    );
  }

  const handleAddToCart = async () => {
    try {
      await cartAddMutation.mutateAsync({
        productId,
        quantity,
      });
      setQuantity(1);
      // Show success toast
    } catch (error) {
      console.error('Failed to add to cart:', error);
    }
  };

  const handleQuantityChange = (delta: number) => {
    const newQuantity = quantity + delta;
    if (newQuantity >= 1 && newQuantity <= product.stock) {
      setQuantity(newQuantity);
    }
  };

  return (
    <div className="min-h-screen bg-background py-12">
      <div className="container">
        {/* Back button */}
        <motion.button
          onClick={() => navigate('/products')}
          className="flex items-center gap-2 text-cyan-400/60 hover:text-cyan-400 mb-8 transition-colors"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
        >
          <ChevronLeft className="w-5 h-5" />
          Back to Products
        </motion.button>

        {/* Product content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Image section */}
          <motion.div
            className="glass-card p-8 flex items-center justify-center min-h-96"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            {product.imageUrl && (
              <img
                src={product.imageUrl}
                alt={product.name}
                className="w-full h-full object-contain"
              />
            )}
          </motion.div>

          {/* Details section */}
          <motion.div
            className="space-y-6"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            {/* Category */}
            <div>
              <span className="text-xs text-cyan-400/60 uppercase tracking-wider">
                {product.category}
              </span>
            </div>

            {/* Title */}
            <h1 className="text-4xl md:text-5xl font-bold font-syne">
              {product.name}
            </h1>

            {/* Rating */}
            <div className="flex items-center gap-4">
              <div className="flex gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className="w-5 h-5 fill-yellow-400 text-yellow-400"
                  />
                ))}
              </div>
              <span className="text-foreground/60">(128 reviews)</span>
            </div>

            {/* Price */}
            <div className="py-4 border-y border-white/10">
              <p className="text-foreground/60 text-sm mb-2">Price</p>
              <p className="text-4xl font-bold neon-glow-gold">
                ${parseFloat(product.price).toFixed(2)}
              </p>
            </div>

            {/* Description */}
            <div>
              <p className="text-foreground/70 text-lg leading-relaxed">
                {product.description}
              </p>
            </div>

            {/* Stock status */}
            <div className="flex items-center gap-2">
              <div
                className={`w-3 h-3 rounded-full ${
                  product.stock > 0 ? 'bg-green-400' : 'bg-red-400'
                }`}
              />
              <span className="text-foreground/60">
                {product.stock > 0
                  ? `${product.stock} items in stock`
                  : 'Out of stock'}
              </span>
            </div>

            {/* Quantity selector */}
            {product.stock > 0 && (
              <div className="glass-card p-4 flex items-center gap-4">
                <span className="text-foreground/60">Quantity:</span>
                <div className="flex items-center gap-3 bg-white/5 rounded-lg p-2">
                  <button
                    onClick={() => handleQuantityChange(-1)}
                    className="p-1 hover:bg-white/10 rounded transition-colors"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-8 text-center font-semibold">
                    {quantity}
                  </span>
                  <button
                    onClick={() => handleQuantityChange(1)}
                    className="p-1 hover:bg-white/10 rounded transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* Add to cart button */}
            <Button
              onClick={handleAddToCart}
              disabled={product.stock === 0 || cartAddMutation.isPending}
              size="lg"
              className="w-full magnetic-button bg-cyan-400 hover:bg-cyan-500 text-background font-semibold h-12"
            >
              <ShoppingCart className="w-5 h-5 mr-2" />
              {cartAddMutation.isPending ? 'Adding...' : 'Add to Cart'}
            </Button>

            {/* Features */}
            <div className="grid grid-cols-2 gap-4 pt-4">
              <div className="glass-card p-4 text-center">
                <p className="text-foreground/60 text-sm mb-2">Free Shipping</p>
                <p className="text-foreground font-semibold">On orders over $50</p>
              </div>
              <div className="glass-card p-4 text-center">
                <p className="text-foreground/60 text-sm mb-2">Warranty</p>
                <p className="text-foreground font-semibold">2 Year Coverage</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

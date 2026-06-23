import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ShoppingCart, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { trpc } from '@/lib/trpc';
import { useLocation } from 'wouter';

interface Product {
  id: number;
  name: string;
  description: string | null;
  price: string;
  category: string;
  imageUrl: string | null;
  stock: number;
}

export default function Products() {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [, navigate] = useLocation();

  const { data: products = [] } = trpc.products.list.useQuery();
  const cartAddMutation = trpc.cart.add.useMutation();

  // Get unique categories
  const categories = ['All', ...Array.from(new Set(products.map(p => p.category)))];

  // Filter products
  const filteredProducts = products.filter(product => {
    const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory;
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleAddToCart = async (product: Product) => {
    try {
      await cartAddMutation.mutateAsync({
        productId: product.id,
        quantity: 1,
      });
      // Show success toast
    } catch (error) {
      console.error('Failed to add to cart:', error);
    }
  };

  const handleViewProduct = (productId: number) => {
    navigate(`/product/${productId}`);
  };

  return (
    <div className="min-h-screen bg-background py-12">
      <div className="container">
        {/* Header */}
        <motion.div
          className="mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-5xl font-bold font-syne mb-4">
            <span className="neon-glow-cyan">Our Collection</span>
          </h1>
          <p className="text-foreground/60 text-lg">
            Discover premium products handpicked for excellence
          </p>
        </motion.div>

        {/* Search and Filter */}
        <motion.div
          className="mb-8 space-y-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          {/* Search */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-foreground placeholder-foreground/40 focus:outline-none focus:border-cyan-400/50 transition-colors"
            />
          </div>

          {/* Category filter */}
          <div className="flex flex-wrap gap-2">
            {categories.map(category => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-lg transition-all ${
                  selectedCategory === category
                    ? 'bg-cyan-400/20 border border-cyan-400/50 text-cyan-400'
                    : 'bg-white/5 border border-white/10 text-foreground/60 hover:border-white/20'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map((product, index) => (
            <motion.div
              key={product.id}
              className="glass-card overflow-hidden group cursor-pointer"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.05 }}
              onClick={() => handleViewProduct(product.id)}
            >
              {/* Image */}
              <div className="relative h-48 bg-gradient-to-br from-cyan-400/10 to-purple-400/10 overflow-hidden">
                {product.imageUrl && (
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                )}
                {/* Stock badge */}
                <div className="absolute top-4 right-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    product.stock > 20
                      ? 'bg-green-400/20 text-green-400'
                      : product.stock > 0
                      ? 'bg-yellow-400/20 text-yellow-400'
                      : 'bg-red-400/20 text-red-400'
                  }`}>
                    {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
                  </span>
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                <div className="mb-2">
                  <span className="text-xs text-cyan-400/60 uppercase tracking-wider">
                    {product.category}
                  </span>
                </div>
                <h3 className="text-lg font-semibold mb-2 line-clamp-2">
                  {product.name}
                </h3>
                <p className="text-sm text-foreground/60 mb-4 line-clamp-2">
                  {product.description}
                </p>

                {/* Price and rating */}
                <div className="flex items-center justify-between mb-4">
                  <span className="text-2xl font-bold neon-glow-gold">
                    ${parseFloat(product.price).toFixed(2)}
                  </span>
                  <div className="flex gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className="w-4 h-4 fill-yellow-400 text-yellow-400"
                      />
                    ))}
                  </div>
                </div>

                {/* Add to cart button */}
                <Button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleAddToCart(product);
                  }}
                  disabled={product.stock === 0}
                  className="w-full magnetic-button bg-cyan-400/20 hover:bg-cyan-400/30 border border-cyan-400/50 text-cyan-400"
                >
                  <ShoppingCart className="w-4 h-4 mr-2" />
                  Add to Cart
                </Button>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Empty state */}
        {filteredProducts.length === 0 && (
          <motion.div
            className="text-center py-12"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
          >
            <p className="text-foreground/60 text-lg">
              No products found matching your criteria
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
}

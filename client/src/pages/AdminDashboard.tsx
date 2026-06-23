import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Edit2, Trash2, TrendingUp, ShoppingBag, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { trpc } from '@/lib/trpc';
import { useLocation } from 'wouter';
import ProductFormModal from '@/components/ProductFormModal';

interface Product {
  id: number;
  name: string;
  description: string | null;
  price: string;
  category: string;
  imageUrl: string | null;
  stock: number;
}

export default function AdminDashboard() {
  const [, navigate] = useLocation();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const { data: user } = trpc.auth.me.useQuery();
  const { data: products = [], refetch: refetchProducts } = trpc.products.list.useQuery();
  const { data: orders = [] } = trpc.orders.getAllOrders.useQuery();
  const deleteProductMutation = trpc.products.delete.useMutation();

  // Check if user is admin
  if (!user || user.role !== 'admin') {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center">
        <p className="text-foreground/60 mb-4 text-lg">Access Denied</p>
        <p className="text-foreground/40 mb-8">You don't have permission to access this page</p>
        <Button onClick={() => navigate('/')}>
          Back to Home
        </Button>
      </div>
    );
  }

  const handleDeleteProduct = async (productId: number) => {
    if (confirm('Are you sure you want to delete this product?')) {
      try {
        await deleteProductMutation.mutateAsync({ id: productId });
        refetchProducts();
      } catch (error) {
        console.error('Failed to delete product:', error);
      }
    }
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingProduct(null);
    refetchProducts();
  };

  // Calculate statistics
  const totalRevenue = orders.reduce((sum, order) => sum + parseFloat(order.totalAmount), 0);
  const totalOrders = orders.length;
  const totalProducts = products.length;

  return (
    <div className="min-h-screen bg-background py-12">
      <div className="container">
        {/* Header */}
        <motion.div
          className="flex items-center justify-between mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-4xl font-bold font-syne">
            Admin <span className="neon-glow-cyan">Dashboard</span>
          </h1>
          <Button
            onClick={() => navigate('/')}
            variant="outline"
            className="border-purple-400/50 text-purple-400 hover:bg-purple-400/10"
          >
            Back to Store
          </Button>
        </motion.div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {[
            {
              icon: TrendingUp,
              label: 'Total Revenue',
              value: `$${totalRevenue.toFixed(2)}`,
              color: 'text-cyan-400',
            },
            {
              icon: ShoppingBag,
              label: 'Total Orders',
              value: totalOrders.toString(),
              color: 'text-purple-400',
            },
            {
              icon: Users,
              label: 'Products',
              value: totalProducts.toString(),
              color: 'text-yellow-400',
            },
          ].map((stat, index) => (
            <motion.div
              key={index}
              className="glass-card p-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-foreground/60 text-sm mb-2">{stat.label}</p>
                  <p className="text-3xl font-bold">{stat.value}</p>
                </div>
                <stat.icon className={`w-12 h-12 ${stat.color}/30`} />
              </div>
            </motion.div>
          ))}
        </div>

        {/* Products section */}
        <motion.div
          className="glass-card p-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Products</h2>
            <Button
              onClick={() => {
                setEditingProduct(null);
                setIsFormOpen(true);
              }}
              className="magnetic-button bg-cyan-400 hover:bg-cyan-500 text-background font-semibold"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Product
            </Button>
          </div>

          {/* Products table */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left py-4 px-4 font-semibold">Name</th>
                  <th className="text-left py-4 px-4 font-semibold">Category</th>
                  <th className="text-left py-4 px-4 font-semibold">Price</th>
                  <th className="text-left py-4 px-4 font-semibold">Stock</th>
                  <th className="text-left py-4 px-4 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product, index) => (
                  <motion.tr
                    key={product.id}
                    className="border-b border-white/5 hover:bg-white/5 transition-colors"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                  >
                    <td className="py-4 px-4">{product.name}</td>
                    <td className="py-4 px-4 text-foreground/60">{product.category}</td>
                    <td className="py-4 px-4 font-semibold neon-glow-gold">
                      ${parseFloat(product.price).toFixed(2)}
                    </td>
                    <td className="py-4 px-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        product.stock > 20
                          ? 'bg-green-400/20 text-green-400'
                          : product.stock > 0
                          ? 'bg-yellow-400/20 text-yellow-400'
                          : 'bg-red-400/20 text-red-400'
                      }`}>
                        {product.stock}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEditProduct(product)}
                          className="p-2 hover:bg-white/10 rounded transition-colors text-cyan-400"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(product.id)}
                          className="p-2 hover:bg-white/10 rounded transition-colors text-red-400"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>

          {products.length === 0 && (
            <div className="text-center py-12">
              <p className="text-foreground/60">No products yet. Create your first product!</p>
            </div>
          )}
        </motion.div>
      </div>

      {/* Product form modal */}
      <ProductFormModal
        isOpen={isFormOpen}
        onClose={handleCloseForm}
        editingProduct={editingProduct}
        onSuccess={refetchProducts}
      />
    </div>
  );
}

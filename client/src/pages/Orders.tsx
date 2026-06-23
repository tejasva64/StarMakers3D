import { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { trpc } from '@/lib/trpc';
import { useLocation } from 'wouter';

interface Order {
  id: number;
  userId: number;
  totalAmount: string;
  status: 'pending' | 'completed' | 'cancelled';
  createdAt: Date;
  updatedAt: Date;
}

interface OrderItem {
  id: number;
  orderId: number;
  productId: number;
  quantity: number;
  price: string;
}

export default function Orders() {
  const [, navigate] = useLocation();
  const [expandedOrderId, setExpandedOrderId] = useState<number | null>(null);

  const { data: user } = trpc.auth.me.useQuery();
  const { data: orders = [] } = trpc.orders.list.useQuery();

  // Check if user is authenticated
  if (!user) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center">
        <p className="text-foreground/60 mb-4 text-lg">Please log in to view your orders</p>
        <Button onClick={() => navigate('/')}>
          Back to Home
        </Button>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-400/20 text-green-400';
      case 'pending':
        return 'bg-yellow-400/20 text-yellow-400';
      case 'cancelled':
        return 'bg-red-400/20 text-red-400';
      default:
        return 'bg-foreground/20 text-foreground';
    }
  };

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
            My <span className="neon-glow-cyan">Orders</span>
          </h1>
          <Button
            onClick={() => navigate('/products')}
            variant="outline"
            className="border-purple-400/50 text-purple-400 hover:bg-purple-400/10"
          >
            Continue Shopping
          </Button>
        </motion.div>

        {/* Orders list */}
        {orders.length === 0 ? (
          <motion.div
            className="text-center py-12"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
          >
            <p className="text-foreground/60 text-lg mb-4">You haven't placed any orders yet</p>
            <Button
              onClick={() => navigate('/products')}
              className="bg-cyan-400 hover:bg-cyan-500 text-background"
            >
              Start Shopping
            </Button>
          </motion.div>
        ) : (
          <div className="space-y-4">
            {orders.map((order, index) => (
              <motion.div
                key={order.id}
                className="glass-card overflow-hidden"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.05 }}
              >
                {/* Order header */}
                <button
                  onClick={() =>
                    setExpandedOrderId(expandedOrderId === order.id ? null : order.id)
                  }
                  className="w-full p-6 flex items-center justify-between hover:bg-white/5 transition-colors"
                >
                  <div className="text-left flex-1">
                    <div className="flex items-center gap-4 mb-2">
                      <p className="font-semibold">Order #{order.id}</p>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(order.status)}`}>
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </span>
                    </div>
                    <p className="text-foreground/60 text-sm">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold neon-glow-gold mb-2">
                      ${parseFloat(order.totalAmount).toFixed(2)}
                    </p>
                    {expandedOrderId === order.id ? (
                      <ChevronUp className="w-5 h-5 text-foreground/60" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-foreground/60" />
                    )}
                  </div>
                </button>

                {/* Order details */}
                {expandedOrderId === order.id && (
                  <motion.div
                    className="border-t border-white/10 p-6 bg-white/5"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <p className="text-foreground/60 text-sm mb-4">
                      Order placed on {new Date(order.createdAt).toLocaleDateString()} at{' '}
                      {new Date(order.createdAt).toLocaleTimeString()}
                    </p>

                    {/* Order items would be displayed here */}
                    <div className="space-y-2">
                      <p className="font-semibold mb-3">Order Summary</p>
                      <div className="flex justify-between text-foreground/60">
                        <span>Subtotal</span>
                        <span>${(parseFloat(order.totalAmount) * 0.926).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-foreground/60">
                        <span>Tax (8%)</span>
                        <span>${(parseFloat(order.totalAmount) * 0.074).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between font-semibold pt-2 border-t border-white/10">
                        <span>Total</span>
                        <span className="neon-glow-gold">${parseFloat(order.totalAmount).toFixed(2)}</span>
                      </div>
                    </div>
                  </motion.div>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

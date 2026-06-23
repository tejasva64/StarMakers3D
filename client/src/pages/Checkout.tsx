import { useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { trpc } from '@/lib/trpc';
import { useLocation } from 'wouter';

interface CheckoutFormData {
  email: string;
  firstName: string;
  lastName: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  cardNumber: string;
}

export default function Checkout() {
  const [, navigate] = useLocation();
  const [step, setStep] = useState<'form' | 'confirmation'>('form');
  const [orderId, setOrderId] = useState<number | null>(null);
  const [formData, setFormData] = useState<CheckoutFormData>({
    email: '',
    firstName: '',
    lastName: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    cardNumber: '',
  });

  const { data: cartItems = [] } = trpc.cart.list.useQuery();
  const { data: products = [] } = trpc.products.list.useQuery();
  const createOrderMutation = trpc.orders.create.useMutation();

  // Enrich cart items with product data
  const enrichedItems = cartItems.map(item => ({
    ...item,
    product: products.find(p => p.id === item.productId),
  }));

  // Calculate totals
  const subtotal = enrichedItems.reduce((sum, item) => {
    const price = item.product ? parseFloat(item.product.price) : 0;
    return sum + price * item.quantity;
  }, 0);

  const tax = subtotal * 0.08;
  const shipping = subtotal > 50 ? 0 : 10;
  const total = subtotal + tax + shipping;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const result = await createOrderMutation.mutateAsync({
        items: enrichedItems.map(item => ({
          productId: item.productId,
          quantity: item.quantity,
          price: item.product?.price || '0',
        })),
        totalAmount: total.toFixed(2),
      });

      setOrderId(result.orderId);
      setStep('confirmation');
    } catch (error) {
      console.error('Failed to create order:', error);
    }
  };

  if (step === 'confirmation' && orderId) {
    return (
      <div className="min-h-screen bg-background py-12">
        <div className="container max-w-2xl">
          <motion.div
            className="text-center"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
          >
            <motion.div
              className="mb-6 flex justify-center"
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <CheckCircle className="w-20 h-20 text-green-400" />
            </motion.div>

            <h1 className="text-4xl font-bold font-syne mb-4">
              Order Confirmed!
            </h1>

            <p className="text-foreground/60 text-lg mb-8">
              Thank you for your purchase. Your order has been successfully placed.
            </p>

            {/* Order details */}
            <motion.div
              className="glass-card p-8 mb-8 text-left"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <div className="grid grid-cols-2 gap-8 mb-8">
                <div>
                  <p className="text-foreground/60 text-sm mb-2">Order Number</p>
                  <p className="text-2xl font-bold neon-glow-cyan">
                    #{orderId}
                  </p>
                </div>
                <div>
                  <p className="text-foreground/60 text-sm mb-2">Total Amount</p>
                  <p className="text-2xl font-bold neon-glow-gold">
                    ${total.toFixed(2)}
                  </p>
                </div>
              </div>

              <div className="border-t border-white/10 pt-8">
                <h3 className="font-semibold mb-4">Order Items</h3>
                <div className="space-y-3">
                  {enrichedItems.map(item => (
                    <div
                      key={item.id}
                      className="flex justify-between text-foreground/70"
                    >
                      <span>
                        {item.product?.name} x {item.quantity}
                      </span>
                      <span>
                        ${(
                          (item.product ? parseFloat(item.product.price) : 0) *
                          item.quantity
                        ).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Next steps */}
            <motion.div
              className="glass-card p-6 mb-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <p className="text-foreground/60 mb-4">
                A confirmation email has been sent to <strong>{formData.email}</strong>
              </p>
              <p className="text-foreground/60">
                You can track your order status in your account dashboard.
              </p>
            </motion.div>

            {/* Action buttons */}
            <div className="flex gap-4 justify-center">
              <Button
                onClick={() => navigate('/products')}
                className="magnetic-button bg-cyan-400 hover:bg-cyan-500 text-background font-semibold px-8"
              >
                Continue Shopping
              </Button>
              <Button
                onClick={() => navigate('/')}
                variant="outline"
                className="magnetic-button border-purple-400/50 text-purple-400 hover:bg-purple-400/10 px-8"
              >
                Back to Home
              </Button>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-12">
      <div className="container max-w-2xl">
        <motion.h1
          className="text-4xl font-bold font-syne mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          Checkout
        </motion.h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Checkout form */}
          <motion.div
            className="lg:col-span-2"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Contact info */}
              <div className="glass-card p-6">
                <h2 className="text-lg font-semibold mb-4">Contact Information</h2>
                <input
                  type="email"
                  name="email"
                  placeholder="Email address"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-foreground placeholder-foreground/40 focus:outline-none focus:border-cyan-400/50 transition-colors mb-4"
                />
              </div>

              {/* Shipping info */}
              <div className="glass-card p-6">
                <h2 className="text-lg font-semibold mb-4">Shipping Address</h2>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <input
                    type="text"
                    name="firstName"
                    placeholder="First name"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    required
                    className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-foreground placeholder-foreground/40 focus:outline-none focus:border-cyan-400/50 transition-colors"
                  />
                  <input
                    type="text"
                    name="lastName"
                    placeholder="Last name"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    required
                    className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-foreground placeholder-foreground/40 focus:outline-none focus:border-cyan-400/50 transition-colors"
                  />
                </div>
                <input
                  type="text"
                  name="address"
                  placeholder="Street address"
                  value={formData.address}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-foreground placeholder-foreground/40 focus:outline-none focus:border-cyan-400/50 transition-colors mb-4"
                />
                <div className="grid grid-cols-3 gap-4">
                  <input
                    type="text"
                    name="city"
                    placeholder="City"
                    value={formData.city}
                    onChange={handleInputChange}
                    required
                    className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-foreground placeholder-foreground/40 focus:outline-none focus:border-cyan-400/50 transition-colors"
                  />
                  <input
                    type="text"
                    name="state"
                    placeholder="State"
                    value={formData.state}
                    onChange={handleInputChange}
                    required
                    className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-foreground placeholder-foreground/40 focus:outline-none focus:border-cyan-400/50 transition-colors"
                  />
                  <input
                    type="text"
                    name="zipCode"
                    placeholder="ZIP code"
                    value={formData.zipCode}
                    onChange={handleInputChange}
                    required
                    className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-foreground placeholder-foreground/40 focus:outline-none focus:border-cyan-400/50 transition-colors"
                  />
                </div>
              </div>

              {/* Payment info */}
              <div className="glass-card p-6">
                <h2 className="text-lg font-semibold mb-4">Payment Method</h2>
                <input
                  type="text"
                  name="cardNumber"
                  placeholder="Card number"
                  value={formData.cardNumber}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-foreground placeholder-foreground/40 focus:outline-none focus:border-cyan-400/50 transition-colors"
                />
                <p className="text-xs text-foreground/40 mt-2">
                  This is a demo. Use any card number for testing.
                </p>
              </div>

              <Button
                type="submit"
                disabled={createOrderMutation.isPending}
                className="w-full magnetic-button bg-cyan-400 hover:bg-cyan-500 text-background font-semibold h-12"
              >
                {createOrderMutation.isPending ? 'Processing...' : 'Place Order'}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </form>
          </motion.div>

          {/* Order summary */}
          <motion.div
            className="glass-card p-6 h-fit sticky top-4"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-lg font-semibold mb-6">Order Summary</h2>

            <div className="space-y-3 mb-6 pb-6 border-b border-white/10">
              {enrichedItems.map(item => (
                <div key={item.id} className="flex justify-between text-sm">
                  <span className="text-foreground/60">
                    {item.product?.name} x {item.quantity}
                  </span>
                  <span>
                    ${(
                      (item.product ? parseFloat(item.product.price) : 0) *
                      item.quantity
                    ).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>

            <div className="space-y-2 mb-6 pb-6 border-b border-white/10">
              <div className="flex justify-between text-foreground/60">
                <span>Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-foreground/60">
                <span>Tax</span>
                <span>${tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-foreground/60">
                <span>Shipping</span>
                <span>{shipping === 0 ? 'Free' : `$${shipping.toFixed(2)}`}</span>
              </div>
            </div>

            <div className="flex justify-between items-center text-lg font-bold">
              <span>Total</span>
              <span className="neon-glow-gold text-2xl">${total.toFixed(2)}</span>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

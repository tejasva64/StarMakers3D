import { useState } from 'react';
import { useLocation } from 'wouter';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { trpc } from '@/lib/trpc';
import { toast } from 'sonner';
import { ShoppingBag, Phone, User } from 'lucide-react';

interface CartItem {
  id: number;
  productId: number;
  productName: string;
  quantity: number;
  price: string;
  imageUrl: string | null;
  colorSelections?: string;
}

export default function Checkout() {
  const [, navigate] = useLocation();
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { data: cartItems = [] } = trpc.cart.list.useQuery();
  const createOrderMutation = trpc.orders.create.useMutation();

  // Parse cart items
  const items = cartItems as CartItem[];
  const total = items.reduce((sum, item) => sum + parseFloat(item.price) * item.quantity, 0);

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!customerName.trim()) {
      toast.error('Please enter your name');
      return;
    }
    
    if (!customerPhone.trim() || customerPhone.length < 10) {
      toast.error('Please enter a valid phone number');
      return;
    }

    if (items.length === 0) {
      toast.error('Your cart is empty');
      return;
    }

    setIsLoading(true);

    try {
      // Create order with customer info
      const orderData = {
        items: items.map(item => ({
          productId: item.productId,
          quantity: item.quantity,
          price: item.price,
          colorSelections: item.colorSelections || '',
        })),
        totalAmount: total.toFixed(2),
        customerName,
        customerPhone,
      };

      // Create order in database
      const order = await createOrderMutation.mutateAsync(orderData);

      // Generate WhatsApp message
      const itemsList = items
        .map(item => {
          const colors = item.colorSelections ? JSON.parse(item.colorSelections) : {};
          const colorStr = Object.entries(colors)
            .map(([part, color]) => `${part}- ${color}`)
            .join('\n                           ');
          return `• ${item.productName}${colorStr ? ` (${colorStr})` : ''} x${item.quantity} — ₹${(parseFloat(item.price) * item.quantity).toFixed(2)}`;
        })
        .join('\n');

      const message = `Order — StarMakers3D

Name: ${customerName}
Phone: ${customerPhone}

Items:
${itemsList}

Total: ₹${total.toFixed(2)}`;

      // Redirect to WhatsApp
      const encodedMessage = encodeURIComponent(message);
      const whatsappUrl = `https://wa.me/919833759808?text=${encodedMessage}`;
      window.open(whatsappUrl, '_blank');

      // Show success message
      toast.success('Order created! Opening WhatsApp...');
      
      // Redirect to confirmation page after a delay
      setTimeout(() => {
        navigate('/order-confirmation');
      }, 1000);
    } catch (error) {
      console.error('Failed to create order:', error);
      toast.error('Failed to create order. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-background py-12">
        <div className="container">
          <motion.div
            className="text-center py-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <ShoppingBag className="w-16 h-16 mx-auto mb-4 text-foreground/40" />
            <h1 className="text-3xl font-bold mb-4">Your cart is empty</h1>
            <p className="text-foreground/60 mb-8">Add some products before checking out</p>
            <Button onClick={() => navigate('/products')} className="bg-cyan-400 hover:bg-cyan-500">
              Continue Shopping
            </Button>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-12">
      <div className="container max-w-4xl">
        <motion.h1
          className="text-4xl font-bold mb-12 font-syne"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          Checkout
        </motion.h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Order Summary */}
          <motion.div
            className="lg:col-span-2 glass-card p-8 rounded-2xl"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <h2 className="text-2xl font-bold mb-6">Order Summary</h2>
            
            <div className="space-y-4 mb-6">
              {items.map((item, index) => {
                const colors = item.colorSelections ? JSON.parse(item.colorSelections) : {};
                return (
                  <motion.div
                    key={item.id}
                    className="border border-white/10 rounded-lg p-4"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-semibold">{item.productName}</h3>
                        <p className="text-sm text-foreground/60">Qty: {item.quantity}</p>
                      </div>
                      <p className="font-semibold neon-glow-gold">₹{(parseFloat(item.price) * item.quantity).toFixed(2)}</p>
                    </div>
                    
                    {Object.keys(colors).length > 0 && (
                      <div className="text-xs text-foreground/60 mt-2 space-y-1">
                        {Object.entries(colors).map(([part, color]) => (
                          <p key={part}>
                            <span className="font-medium">{part}:</span> {color as string}
                          </p>
                        ))}
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </div>

            <div className="border-t border-white/10 pt-6">
              <div className="flex justify-between items-center text-xl font-bold">
                <span>Total:</span>
                <span className="neon-glow-gold">₹{total.toFixed(2)}</span>
              </div>
            </div>
          </motion.div>

          {/* Customer Info Form */}
          <motion.div
            className="glass-card p-8 rounded-2xl h-fit sticky top-24"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h2 className="text-2xl font-bold mb-6">Your Details</h2>
            
            <form onSubmit={handleSubmitOrder} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Full Name *</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-foreground/40" />
                  <Input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Your name"
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Phone Number *</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-foreground/40" />
                  <Input
                    type="tel"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="10-digit number"
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div className="bg-blue-400/10 border border-blue-400/20 rounded-lg p-4 text-sm">
                <p className="text-blue-400 font-medium mb-2">📱 How it works:</p>
                <p className="text-foreground/80">
                  After placing your order, you'll be redirected to WhatsApp to confirm your order details with our team.
                </p>
              </div>

              <Button
                type="submit"
                disabled={isLoading || !customerName.trim() || !customerPhone.trim()}
                className="w-full bg-gradient-to-r from-cyan-400 to-purple-400 hover:opacity-90 text-background font-semibold py-3 text-lg"
              >
                {isLoading ? 'Processing...' : 'Place Order on WhatsApp'}
              </Button>

              <Button
                type="button"
                onClick={() => navigate('/cart')}
                variant="outline"
                className="w-full"
              >
                Back to Cart
              </Button>
            </form>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

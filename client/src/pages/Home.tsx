import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import HeroSection from '@/components/HeroSection';
import { ShoppingCart, Zap, Shield, Truck } from 'lucide-react';
import ScrollReveal from '@/components/ScrollReveal';
import CounterAnimation from '@/components/CounterAnimation';

export default function Home() {
  const [, navigate] = useLocation();

  useEffect(() => {
    // Scroll to top on mount
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-40 glass-card rounded-none border-b border-white/10 backdrop-blur-xl">
        <div className="container flex items-center justify-between h-16">
          <motion.div
            className="flex items-center gap-2 cursor-pointer"
            onClick={() => navigate('/')}
            whileHover={{ scale: 1.05 }}
          >
            <img src="/manus-storage/starmakers3d-logo_2eb28c61.jpg" alt="StarMakers3D" className="h-8 w-auto" />
          </motion.div>

          <div className="flex items-center gap-6">
            <button
              onClick={() => navigate('/products')}
              className="text-foreground/60 hover:text-foreground transition-colors"
            >
              Shop
            </button>
            <button
              onClick={() => navigate('/orders')}
              className="text-foreground/60 hover:text-foreground transition-colors"
            >
              Orders
            </button>
            <button
              onClick={() => navigate('/owner-login')}
              className="text-foreground/60 hover:text-foreground transition-colors text-sm"
            >
              Admin
            </button>
            <button
              onClick={() => navigate('/cart')}
              className="relative text-foreground/60 hover:text-foreground transition-colors"
            >
              <ShoppingCart className="w-5 h-5" />
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="pt-16">
        <HeroSection />
      </div>

      {/* Features Section */}
      <section className="py-20 bg-gradient-to-b from-background to-purple-950/10">
        <div className="container">
        <ScrollReveal className="mb-12">
          <motion.h2
            className="text-4xl font-bold font-syne text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            Why Choose <span className="neon-glow-cyan">StarMakers3D</span>
          </motion.h2>
        </ScrollReveal>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: Zap,
                title: 'Premium Quality',
                description: 'Handpicked products meeting the highest standards',
              },
              {
                icon: Truck,
                title: 'Fast Shipping',
                description: 'Free shipping on orders over $50',
              },
              {
                icon: Shield,
                title: 'Secure Checkout',
                description: 'Your payment information is always protected',
              },
              {
                icon: ShoppingCart,
                title: 'Easy Returns',
                description: '30-day return policy on all items',
              },
            ].map((feature, index) => (
            <ScrollReveal key={index} delay={index * 0.1}>
              <motion.div
                className="glass-card p-6 text-center"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
              >
                <feature.icon className="w-12 h-12 mx-auto mb-4 text-cyan-400" />
                <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
                <p className="text-foreground/60 text-sm">{feature.description}</p>
              </motion.div>
            </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container">
          <ScrollReveal>
            <motion.div
              className="glass-card p-12 text-center neon-border-cyan"
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <h2 className="text-4xl font-bold font-syne mb-4">
                Ready to Create with StarMakers3D?
              </h2>
              <p className="text-foreground/60 text-lg mb-8 max-w-2xl mx-auto">
                Explore our 3D printing solutions and bring your ideas to life.
              </p>
              <Button
                onClick={() => navigate('/products')}
                className="magnetic-button bg-cyan-400 hover:bg-cyan-500 text-background font-semibold px-8 h-12"
              >
                Start Shopping
              </Button>
            </motion.div>
          </ScrollReveal>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 py-12 bg-background/50">
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="font-bold text-lg mb-4 neon-glow-cyan">StarMakers3D</h3>
              <p className="text-foreground/60 text-sm">
                Cutting-edge 3D printing solutions for creators and innovators.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Shop</h4>
              <ul className="space-y-2 text-foreground/60 text-sm">
                <li>
                  <button
                    onClick={() => navigate('/products')}
                    className="hover:text-cyan-400 transition-colors"
                  >
                    All Products
                  </button>
                </li>
                <li>New Arrivals</li>
                <li>Best Sellers</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-foreground/60 text-sm">
                <li>Contact Us</li>
                <li>Shipping Info</li>
                <li>Returns</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-foreground/60 text-sm">
                <li>Privacy Policy</li>
                <li>Terms of Service</li>
                <li>Cookie Policy</li>
              </ul>
            </div>
          </div>

          <div className="border-t border-white/10 pt-8 text-center text-foreground/40 text-sm">
            <p>&copy; 2026 StarMakers3D. 3D Printing Solutions. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

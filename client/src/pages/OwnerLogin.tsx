import { useState } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { motion } from 'framer-motion';
import { Lock, AlertCircle } from 'lucide-react';

const OWNER_PASSWORD = 'StarMakers3D';

export default function OwnerLogin() {
  const [, navigate] = useLocation();
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // Simulate a small delay for UX
    await new Promise(resolve => setTimeout(resolve, 500));

    if (password === OWNER_PASSWORD) {
      // Store authentication in localStorage
      localStorage.setItem('ownerAuthenticated', 'true');
      localStorage.setItem('ownerLoginTime', new Date().toISOString());
      navigate('/admin');
    } else {
      setError('Invalid password. Please try again.');
      setPassword('');
    }
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="glass-card rounded-2xl p-8 border border-white/10">
          {/* Logo */}
          <div className="flex justify-center mb-8">
            <img 
              src="/manus-storage/starmakers3d-logo_2eb28c61.jpg" 
              alt="StarMakers3D" 
              className="h-12 w-auto"
            />
          </div>

          <h1 className="text-2xl font-bold text-center mb-2 font-syne">Owner Portal</h1>
          <p className="text-foreground/60 text-center mb-8">Enter your password to access the admin panel</p>

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-foreground/40" />
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  className="pl-10"
                  disabled={isLoading}
                  autoFocus
                />
              </div>
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-gap-2 p-4 bg-red-500/10 border border-red-500/20 rounded-lg"
              >
                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                <p className="text-red-500 text-sm">{error}</p>
              </motion.div>
            )}

            <Button
              type="submit"
              disabled={isLoading || !password}
              className="w-full bg-gradient-to-r from-neon-cyan to-neon-purple hover:opacity-90"
            >
              {isLoading ? 'Verifying...' : 'Login'}
            </Button>
          </form>

          <button
            onClick={() => navigate('/')}
            className="w-full mt-4 text-foreground/60 hover:text-foreground transition-colors text-sm"
          >
            ← Back to Home
          </button>
        </div>
      </motion.div>
    </div>
  );
}

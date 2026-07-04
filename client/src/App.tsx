import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import Products from "./pages/Products";
import ProductDetailPage from "./pages/ProductDetail";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import AdminDashboard from "./pages/AdminDashboard";
import Orders from "./pages/Orders";
import OwnerLogin from "./pages/OwnerLogin";
import LoadingScreen from "./components/LoadingScreen";
import CustomCursor from "./components/CustomCursor";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

// Page transition variants
const pageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  exit: { opacity: 0, y: -20, transition: { duration: 0.3 } },
};

// Wrapper component for page transitions
function TransitionWrapper({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial="initial"
      animate="animate"
      exit="exit"
      variants={pageVariants}
    >
      {children}
    </motion.div>
  );
}

// Wrapper component to handle route parameters
function ProductDetail({ params }: { params: { id: string } }) {
  return (
    <TransitionWrapper>
      <ProductDetailPage id={params.id} />
    </TransitionWrapper>
  );
}

function Router() {
  return (
    <AnimatePresence mode="wait">
      <Switch>
        <Route path={"/"}>
          <TransitionWrapper>
            <Home />
          </TransitionWrapper>
        </Route>
        <Route path={"/products"}>
          <TransitionWrapper>
            <Products />
          </TransitionWrapper>
        </Route>
        <Route path={"/product/:id"} component={ProductDetail} />
        <Route path={"/cart"}>
          <TransitionWrapper>
            <Cart />
          </TransitionWrapper>
        </Route>
        <Route path={"/checkout"}>
          <TransitionWrapper>
            <Checkout />
          </TransitionWrapper>
        </Route>
        <Route path={"/orders"}>
          <TransitionWrapper>
            <Orders />
          </TransitionWrapper>
        </Route>
        <Route path={"/owner-login"}>
          <TransitionWrapper>
            <OwnerLogin />
          </TransitionWrapper>
        </Route>
        <Route path={"/admin"}>
          <TransitionWrapper>
            <AdminDashboard />
          </TransitionWrapper>
        </Route>
        <Route path={"/404"}>
          <TransitionWrapper>
            <NotFound />
          </TransitionWrapper>
        </Route>
        {/* Final fallback route */}
        <Route>
          <TransitionWrapper>
            <NotFound />
          </TransitionWrapper>
        </Route>
      </Switch>
    </AnimatePresence>
  );
}

function App() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate initial load
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="dark">
        <TooltipProvider>
          <Toaster />
          <CustomCursor />
          <LoadingScreen isLoading={isLoading} />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;

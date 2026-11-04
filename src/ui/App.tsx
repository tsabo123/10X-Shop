import { Component, lazy, Suspense, useEffect, type ReactNode } from 'react';
import { Navigate, Outlet, Route, Routes, useLocation, useParams } from 'react-router-dom';
import { useAuth } from '../contexts';
import { Layout } from './Layout';
import { PageNotFound } from './shared';
import { ToastProvider } from './Toast';
const CatalogPage = lazy(() => import('../pages/CatalogPage'));
const ProductPage = lazy(() => import('../pages/ProductPage'));
const CartPage = lazy(() => import('../pages/CartPage'));
const CheckoutPage = lazy(() => import('../pages/CheckoutPage'));
const LoginPage = lazy(() => import('../pages/LoginPage'));
const SignupPage = lazy(() => import('../pages/SignupPage'));
const ForgotPasswordPage = lazy(() => import('../pages/ForgotPasswordPage'));
const OrdersPage = lazy(() => import('../pages/OrdersPage'));
const OrderDetailPage = lazy(() => import('../pages/OrderDetailPage'));
const ProfilePage = lazy(() => import('../pages/ProfilePage'));
function ScrollToTop() {
  const {
    pathname
  } = useLocation();
  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: 'instant'
    });
  }, [pathname]);
  return null;
}
function ProtectedRoute() {
  const {
    user
  } = useAuth();
  const location = useLocation();
  return user ? <Outlet /> : <Navigate to={`/login?next=${location.pathname.slice(1)}`} replace state={{
    from: location.pathname
  }} />;
}
function ProductPathAlias() {
  const {
    id = ''
  } = useParams();
  return <Navigate to={`/products/${id}`} replace />;
}
class StoreErrorBoundary extends Component<{
  children: ReactNode;
}, {
  failed: boolean;
}> {
  state = {
    failed: false
  };
  static getDerivedStateFromError(): {
    failed: boolean;
  } {
    return {
      failed: true
    };
  }
  componentDidCatch(error: Error): void {
    console.error('[10X Shop] UI error:', error);
  }
  render() {
    return this.state.failed ? <main className="empty wrap"><h1>Something went wrong.</h1><p>Please reload the shop and try again.</p><button className="button dark-button" onClick={() => location.reload()}>Reload</button></main> : this.props.children;
  }
}
export default function App() {
  return <ToastProvider><StoreErrorBoundary><ScrollToTop /><Suspense fallback={<div className="status">Opening the shop…</div>}><Routes><Route element={<Layout />}><Route index element={<CatalogPage />} /><Route path="products/:id" element={<ProductPage />} /><Route path="product/:id" element={<ProductPathAlias />} /><Route path="cart" element={<CartPage />} /><Route path="login" element={<LoginPage />} /><Route path="signup" element={<SignupPage />} /><Route path="forgot-password" element={<ForgotPasswordPage />} /><Route element={<ProtectedRoute />}><Route path="checkout" element={<CheckoutPage />} /><Route path="orders" element={<OrdersPage />} /><Route path="orders/:id" element={<OrderDetailPage />} /><Route path="profile" element={<ProfilePage />} /></Route><Route path="*" element={<PageNotFound />} /></Route></Routes></Suspense></StoreErrorBoundary></ToastProvider>;
}

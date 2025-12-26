import { Routes, Route, Navigate, Link } from 'react-router-dom';
import LoginPage from './pages/LoginPage.jsx';
import RegisterPage from './pages/RegisterPage.jsx';
import ProductListPage from './pages/ProductListPage.jsx';
import ProductDetailPage from './pages/ProductDetailPage.jsx';
import CartPage from './pages/CartPage.jsx';
import SellerDashboardPage from './pages/SellerDashboardPage.jsx';
import { useCart } from './context/CartContext.jsx';

function AppHeader() {
  const { totalCount } = useCart();

  return (
    <header className="border-b bg-white">
      <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link to="/" className="text-xl font-semibold text-primary">
          Maestro
        </Link>
        <nav className="flex gap-4 text-sm items-center">
          <Link to="/" className="text-textSecondary hover:text-primary">
            Каталог
          </Link>
          <Link to="/cart" className="text-textSecondary hover:text-primary">
            Корзина{totalCount > 0 ? ` (${totalCount})` : ''}
          </Link>
          <Link
            to="/seller"
            className="text-textSecondary hover:text-primary"
          >
            Кабинет продавца
          </Link>
          <Link to="/login" className="text-textSecondary hover:text-primary">
            Вход
          </Link>
          <Link
            to="/register"
            className="px-3 py-1 rounded-md bg-primary text-white hover:bg-blue-700"
          >
            Регистрация
          </Link>
        </nav>
      </div>
    </header>
  );
}

function App() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <AppHeader />

      <main className="flex-1">
        <div className="max-w-5xl mx-auto px-4 py-8">
          <Routes>
            <Route path="/" element={<ProductListPage />} />
            <Route path="/products/:id" element={<ProductDetailPage />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/seller" element={<SellerDashboardPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </main>
    </div>
  );
}

export default App;

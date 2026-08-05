import { createBrowserRouter } from 'react-router-dom';
import RootLayout from '../components/layout/RootLayout';
import DashboardLayout from '../components/layout/DashboardLayout';
import ProtectedRoute from './ProtectedRoute';
import Home from '../pages/Home';
import Collection from '../pages/Collection';
import Rates from '../pages/Rates';
import Exchange from '../pages/Exchange';
import VisitUs from '../pages/VisitUs';
import Cart from '../pages/Cart';
import News from '../pages/News';
import NewsDetail from '../pages/NewsDetail';
import Login from '../pages/Login';
import Dashboard from '../pages/admin/Dashboard';
import NewsList from '../pages/admin/NewsList';
import NewsCreate from '../pages/admin/NewsCreate';
import NewsEdit from '../pages/admin/NewsEdit';
import RatesAdmin from '../pages/admin/RatesAdmin';
import ProductList from '../pages/admin/ProductList';
import ProductCreate from '../pages/admin/ProductCreate';
import ProductEdit from '../pages/admin/ProductEdit';
import ProductDetail from '../pages/ProductDetail';
import NotFound from '../pages/NotFound';

const router = createBrowserRouter([
  // Public storefront — shares the navbar/footer shell
  {
    path: '/',
    element: <RootLayout />,
    errorElement: <NotFound />,
    children: [
      { index: true, element: <Home /> },
      { path: 'collection', element: <Collection /> },
      { path: 'collection/:slug', element: <ProductDetail /> },
      { path: 'rates', element: <Rates /> },
      { path: 'exchange', element: <Exchange /> },
      { path: 'visit', element: <VisitUs /> },
      { path: 'cart', element: <Cart /> },
      { path: 'news', element: <News /> },
      { path: 'news/:slug', element: <NewsDetail /> },
      { path: '*', element: <NotFound /> },
    ],
  },

  // Login sits outside RootLayout — it renders its own full-screen split layout
  { path: '/login', element: <Login />, errorElement: <NotFound /> },

  // Admin console — gated once at the layout so every child inherits the guard
  {
    path: '/admin',
    element: (
      <ProtectedRoute roles={['admin', 'staff']}>
        <DashboardLayout />
      </ProtectedRoute>
    ),
    errorElement: <NotFound />,
    children: [
      { index: true, element: <Dashboard /> },
      { path: 'news', element: <NewsList /> },
      { path: 'news/new', element: <NewsCreate /> },
      { path: 'news/:id/edit', element: <NewsEdit /> },
      { path: 'products', element: <ProductList /> },
      { path: 'products/new', element: <ProductCreate /> },
      { path: 'products/:id/edit', element: <ProductEdit /> },
      { path: 'rates', element: <RatesAdmin /> },
      { path: '*', element: <NotFound /> },
    ],
  },
]);

export default router;

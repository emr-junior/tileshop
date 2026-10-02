import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShoppingCart, Menu, X, Layers } from 'lucide-react';
import { useCart } from '../context/CartContext';

export default function Navbar() {
  const { totalItems } = useCart();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  const isHome = location.pathname === '/';

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navBase = isHome && !scrolled
    ? 'text-white'
    : 'text-stone-800';

  const bgClass = scrolled || !isHome
    ? 'bg-white/95 backdrop-blur-md shadow-sm border-b border-stone-100'
    : 'bg-transparent';

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${bgClass}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
              <Layers size={18} className="text-white" />
            </div>
            <span className={`font-display font-bold text-xl transition-colors ${navBase}`}>
              TileShop<span className="text-primary-500">.</span>cm
            </span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-8">
            <Link to="/" className={`text-sm font-medium hover:text-primary-600 transition-colors ${navBase}`}>
              Home
            </Link>
            <Link to="/products" className={`text-sm font-medium hover:text-primary-600 transition-colors ${navBase}`}>
              Products
            </Link>
            <Link to="/products?category=floor" className={`text-sm font-medium hover:text-primary-600 transition-colors ${navBase}`}>
              Categories
            </Link>
            <a href="tel:+237600000000" className={`text-sm font-medium hover:text-primary-600 transition-colors ${navBase}`}>
              Contact
            </a>
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-3">
            <Link to="/cart" className={`relative p-2 rounded-xl hover:bg-primary-600/10 transition-colors ${navBase}`}>
              <ShoppingCart size={22} />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary-600 text-white text-xs rounded-full flex items-center justify-center font-medium">
                  {totalItems > 9 ? '9+' : totalItems}
                </span>
              )}
            </Link>
            <button
              className={`md:hidden p-2 rounded-xl hover:bg-primary-600/10 transition-colors ${navBase}`}
              onClick={() => setMenuOpen(!menuOpen)}
            >
              {menuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden bg-white border-t border-stone-100 shadow-lg animate-fadeIn">
          <div className="px-4 py-4 flex flex-col gap-1">
            {[
              { to: '/', label: 'Home' },
              { to: '/products', label: 'All Products' },
              { to: '/products?category=floor', label: 'Floor Tiles' },
              { to: '/products?category=wall', label: 'Wall Tiles' },
              { to: '/products?category=bathroom', label: 'Bathroom Tiles' },
              { to: '/cart', label: 'Cart' },
            ].map(link => (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setMenuOpen(false)}
                className="py-3 px-4 rounded-xl text-stone-700 font-medium hover:bg-stone-50 hover:text-primary-600 transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
}

import { Link } from 'react-router-dom';
import { MapPin, Phone, Mail, Layers, MessageCircle } from 'lucide-react';

const WHATSAPP = import.meta.env.VITE_WHATSAPP || '237600000000';

export default function Footer() {
  return (
    <footer className="bg-stone-900 text-stone-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                <Layers size={18} className="text-white" />
              </div>
              <span className="font-display font-bold text-xl text-white">
                TileShop<span className="text-primary-400">.</span>cm
              </span>
            </div>
            <p className="text-sm leading-relaxed text-stone-400">
              Cameroon's premier destination for premium tiles. Quality flooring solutions for homes, offices and commercial spaces.
            </p>
            <a
              href={`https://wa.me/${WHATSAPP}`}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-5 inline-flex items-center gap-2 bg-green-600 hover:bg-green-500 text-white px-4 py-2.5 rounded-xl text-sm font-medium transition-colors"
            >
              <MessageCircle size={16} />
              Chat on WhatsApp
            </a>
          </div>

          {/* Products */}
          <div>
            <h4 className="font-display font-semibold text-white mb-5">Products</h4>
            <ul className="space-y-3 text-sm">
              {[
                ['Floor Tiles', '/products?category=floor'],
                ['Wall Tiles', '/products?category=wall'],
                ['Bathroom Tiles', '/products?category=bathroom'],
                ['Kitchen Tiles', '/products?category=kitchen'],
                ['Outdoor Tiles', '/products?category=outdoor'],
                ['Mosaic Tiles', '/products?category=mosaic'],
                ['Decorative', '/products?category=decorative'],
              ].map(([label, href]) => (
                <li key={href}>
                  <Link to={href} className="hover:text-primary-400 transition-colors">{label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="font-display font-semibold text-white mb-5">Company</h4>
            <ul className="space-y-3 text-sm">
              {[
                ['About Us', '/'],
                ['All Products', '/products'],
                ['View Cart', '/cart'],
              ].map(([label, href]) => (
                <li key={href}>
                  <Link to={href} className="hover:text-primary-400 transition-colors">{label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-display font-semibold text-white mb-5">Contact</h4>
            <ul className="space-y-4 text-sm">
              <li className="flex items-start gap-3">
                <MapPin size={16} className="text-primary-400 mt-0.5 flex-shrink-0" />
                <span className="text-stone-400">Douala, Cameroon<br/>Akwa, Rue de la Joie</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone size={16} className="text-primary-400 flex-shrink-0" />
                <a href="tel:+237600000000" className="hover:text-primary-400 transition-colors">+237 600 000 000</a>
              </li>
              <li className="flex items-center gap-3">
                <Mail size={16} className="text-primary-400 flex-shrink-0" />
                <a href="mailto:info@tileshop.cm" className="hover:text-primary-400 transition-colors">info@tileshop.cm</a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-stone-800 mt-12 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-stone-500">
          <p>© {new Date().getFullYear()} TileShop Cameroon. All rights reserved.</p>
          <p>Prices in XAF (FCFA)</p>
        </div>
      </div>
    </footer>
  );
}

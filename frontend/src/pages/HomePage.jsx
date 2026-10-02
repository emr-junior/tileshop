import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ShieldCheck, Truck, Headphones, Star } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import ProductCard from '../components/ProductCard';
import WhatsAppButton from '../components/WhatsAppButton';
import { productAPI, categoryAPI } from '../utils/api';

const CATEGORY_IMAGES = {
  floor: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=500',
  wall: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=500',
  bathroom: 'https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?w=500',
  kitchen: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=500',
  outdoor: 'https://images.unsplash.com/photo-1604014237800-1c9102c219da?w=500',
  mosaic: 'https://images.unsplash.com/photo-1519710164239-da123dc03ef4?w=500',
  decorative: 'https://images.unsplash.com/photo-1484154218962-a197022b5858?w=500',
};

export default function HomePage() {
  const [featured, setFeatured] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      productAPI.getAll({ featured: true, limit: 8 }),
      categoryAPI.getAll()
    ]).then(([prodRes, catRes]) => {
      setFeatured(prodRes.data.data);
      setCategories(catRes.data.data.slice(0, 6));
    }).finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-stone-50">
      <Navbar />

      {/* Hero Section */}
      <section className="relative h-screen min-h-[600px] flex items-center overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=1600"
            alt="Beautiful tiled interior"
            className="w-full h-full object-cover"
          />
          <div className="hero-gradient absolute inset-0" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 text-white/90 text-sm px-4 py-2 rounded-full mb-6 animate-fadeInUp stagger-1">
              <Star size={14} className="text-primary-400" fill="currentColor" />
              Premium Tile Collection — Cameroon's #1 Tile Shop
            </div>
            <h1 className="font-display text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-tight mb-6 animate-fadeInUp stagger-2">
              Transform Your<br />
              <span className="text-primary-400">Space</span> With<br />
              Premium Tiles
            </h1>
            <p className="text-white/80 text-lg md:text-xl mb-8 leading-relaxed animate-fadeInUp stagger-3">
              Discover hundreds of tile designs for floors, walls, bathrooms and more.
              Delivered to your doorstep across Cameroon.
            </p>
            <div className="flex flex-wrap gap-4 animate-fadeInUp stagger-4">
              <Link to="/products" className="btn-primary text-base px-8 py-4">
                Shop Now <ArrowRight size={18} />
              </Link>
              <a
                href="https://wa.me/237600000000"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-green-500 hover:bg-green-400 text-white font-medium px-8 py-4 rounded-lg transition-colors inline-flex items-center gap-2 text-base"
              >
                Get a Quote
              </a>
            </div>
          </div>
        </div>

        {/* Stats bar */}
        <div className="absolute bottom-0 inset-x-0 bg-white/10 backdrop-blur-md border-t border-white/20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="grid grid-cols-3 gap-4 text-white text-center">
              {[['500+', 'Products'], ['1000+', 'Happy Customers'], ['5+', 'Years Experience']].map(([num, label]) => (
                <div key={label}>
                  <div className="font-display font-bold text-2xl text-primary-400">{num}</div>
                  <div className="text-xs text-white/70">{label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features strip */}
      <section className="bg-primary-600 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-white">
            {[
              { icon: Truck, title: 'Free Delivery', desc: 'On orders above 100,000 FCFA in Douala' },
              { icon: ShieldCheck, title: 'Quality Guarantee', desc: '100% authentic premium tiles' },
              { icon: Headphones, title: 'Expert Support', desc: 'WhatsApp & phone consultation' },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="flex items-center gap-4">
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Icon size={20} />
                </div>
                <div>
                  <p className="font-semibold text-sm">{title}</p>
                  <p className="text-xs text-primary-100">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="section-title">Shop by Category</h2>
            <p className="section-subtitle mx-auto">
              From elegant floors to stunning walls — find the perfect tile for every room
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
            {categories.map((cat) => (
              <Link
                key={cat.id}
                to={`/products?category=${cat.id}`}
                className="group relative rounded-2xl overflow-hidden aspect-[4/3] bg-stone-100"
              >
                <img
                  src={CATEGORY_IMAGES[cat.id] || CATEGORY_IMAGES.floor}
                  alt={cat.label}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                  onError={(e) => e.target.src = CATEGORY_IMAGES.floor}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-stone-900/80 via-stone-900/20 to-transparent" />
                <div className="absolute bottom-0 inset-x-0 p-4">
                  <div className="text-2xl mb-1">{cat.icon}</div>
                  <h3 className="font-display font-bold text-white text-lg">{cat.label}</h3>
                  <p className="text-white/70 text-xs">{cat.count} products</p>
                </div>
              </Link>
            ))}
          </div>
          <div className="text-center mt-8">
            <Link to="/products" className="btn-outline">
              View All Categories <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-20 bg-stone-50 bg-tile-pattern">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="section-title">Featured Collection</h2>
            <p className="section-subtitle mx-auto">
              Handpicked tiles that our customers love most
            </p>
          </div>
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {Array(8).fill(0).map((_, i) => (
                <div key={i} className="card">
                  <div className="skeleton aspect-square" />
                  <div className="p-4 space-y-3">
                    <div className="skeleton h-4 rounded w-3/4" />
                    <div className="skeleton h-3 rounded w-1/2" />
                    <div className="skeleton h-5 rounded w-1/3" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {featured.map(product => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          )}
          <div className="text-center mt-10">
            <Link to="/products" className="btn-primary">
              View All Products <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="py-20 bg-stone-900 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-tile-pattern" />
        </div>
        <div className="relative max-w-4xl mx-auto px-4 text-center">
          <h2 className="font-display text-4xl md:text-5xl font-bold text-white mb-4">
            Not sure which tiles to choose?
          </h2>
          <p className="text-stone-400 text-lg mb-8">
            Our expert team is available on WhatsApp to help you select the perfect tiles for your project.
          </p>
          <a
            href="https://wa.me/237600000000?text=Hello!%20I%20need%20help%20choosing%20tiles."
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-3 bg-green-500 hover:bg-green-400 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-colors"
          >
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
            </svg>
            Chat with Us on WhatsApp
          </a>
        </div>
      </section>

      <Footer />
      <WhatsAppButton />
    </div>
  );
}

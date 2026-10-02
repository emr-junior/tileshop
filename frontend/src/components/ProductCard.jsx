import { Link } from 'react-router-dom';
import { ShoppingCart, Star, Package } from 'lucide-react';
import { useCart } from '../context/CartContext';
import toast from 'react-hot-toast';

const formatPrice = (price) =>
  new Intl.NumberFormat('fr-CM', {
    style: 'currency',
    currency: 'XAF',
    maximumFractionDigits: 0
  }).format(price);

const availabilityConfig = {
  in_stock: { label: 'In Stock', className: 'badge-green' },
  low_stock: { label: 'Low Stock', className: 'badge-yellow' },
  out_of_stock: { label: 'Out of Stock', className: 'badge-red' },
};

export default function ProductCard({ product }) {
  const { addItem, items } = useCart();
  const inCart = items.some(i => i._id === product._id);
  const avail = availabilityConfig[product.availability] || availabilityConfig.in_stock;

  // ✅ FIXED IMAGE HANDLING (VERY IMPORTANT)
  const imageUrl =
    product.images?.[0]?.url
      ? `http://localhost:5000${product.images[0].url}`
      : product.image
        ? `http://localhost:5000${product.image}`
        : 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400';

  const handleAddToCart = (e) => {
    e.preventDefault();
    if (product.availability === 'out_of_stock') return;
    addItem(product);
    toast.success(`${product.name} added to cart!`);
  };

  return (
    <Link to={`/products/${product._id}`} className="card group block">
      
      {/* Image */}
      <div className="relative overflow-hidden aspect-square bg-stone-100">
        <img
          src={imageUrl}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
          onError={(e) => {
            e.target.src = 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400';
          }}
        />

        {product.isFeatured && (
          <div className="absolute top-3 left-3">
            <span className="bg-primary-600 text-white text-xs font-medium px-2.5 py-1 rounded-full flex items-center gap-1">
              <Star size={10} fill="currentColor" /> Featured
            </span>
          </div>
        )}

        <div className="absolute top-3 right-3">
          <span className={`badge ${avail.className} text-xs`}>
            {avail.label}
          </span>
        </div>

        {/* Quick add overlay */}
        <div className="absolute inset-x-0 bottom-0 p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
          <button
            onClick={handleAddToCart}
            disabled={product.availability === 'out_of_stock'}
            className={`w-full py-2.5 rounded-xl text-sm font-medium flex items-center justify-center gap-2 transition-all
              ${inCart
                ? 'bg-stone-800 text-white'
                : product.availability === 'out_of_stock'
                  ? 'bg-stone-300 text-stone-500 cursor-not-allowed'
                  : 'bg-primary-600 hover:bg-primary-700 text-white shadow-lg'
              }`}
          >
            <ShoppingCart size={15} />
            {inCart
              ? 'In Cart'
              : product.availability === 'out_of_stock'
                ? 'Out of Stock'
                : 'Add to Cart'}
          </button>
        </div>
      </div>

      {/* Info */}
      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-1">
          <h3 className="font-display font-semibold text-stone-900 text-base leading-tight line-clamp-2 group-hover:text-primary-700 transition-colors">
            {product.name}
          </h3>
        </div>

        <div className="flex items-center gap-3 text-xs text-stone-500 mt-1 mb-3">
          <span className="flex items-center gap-1">
            <Package size={12} />
            {product.size} cm
          </span>
          <span className="capitalize">{product.material}</span>
          <span className="capitalize">{product.finish}</span>
        </div>

        <div className="flex items-end justify-between">
          <div>
            <p className="text-lg font-bold text-primary-700">
              {formatPrice(product.pricePerBox)}
            </p>
            <p className="text-xs text-stone-400">
              per box • covers {product.coveragePerBox}m²
            </p>
          </div>

          {product.pricePerM2 && (
            <p className="text-xs text-stone-500 text-right">
              {formatPrice(product.pricePerM2)}/m²
            </p>
          )}
        </div>
      </div>
    </Link>
  );
}
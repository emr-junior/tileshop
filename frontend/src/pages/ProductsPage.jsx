import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, SlidersHorizontal, X, ChevronDown } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import ProductCard from '../components/ProductCard';
import WhatsAppButton from '../components/WhatsAppButton';
import { productAPI } from '../utils/api';

const CATEGORIES = [
  { value: 'all', label: 'All Categories' },
  { value: 'floor', label: 'Floor Tiles' },
  { value: 'wall', label: 'Wall Tiles' },
  { value: 'bathroom', label: 'Bathroom' },
  { value: 'kitchen', label: 'Kitchen' },
  { value: 'outdoor', label: 'Outdoor' },
  { value: 'mosaic', label: 'Mosaic' },
  { value: 'decorative', label: 'Decorative' },
];

const SORT_OPTIONS = [
  { value: '-createdAt', label: 'Newest First' },
  { value: 'pricePerBox', label: 'Price: Low to High' },
  { value: '-pricePerBox', label: 'Price: High to Low' },
  { value: 'name', label: 'Name A-Z' },
];

export default function ProductsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [pagination, setPagination] = useState({});
  const [loading, setLoading] = useState(true);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const category = searchParams.get('category') || 'all';
  const search = searchParams.get('search') || '';
  const sort = searchParams.get('sort') || '-createdAt';
  const page = parseInt(searchParams.get('page') || '1');

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = { sort, page, limit: 12 };
      if (category !== 'all') params.category = category;
      if (search) params.search = search;

      const res = await productAPI.getAll(params);
      setProducts(res.data.data);
      setPagination(res.data.pagination);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [category, search, sort, page]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  const updateParam = (key, value) => {
    const p = new URLSearchParams(searchParams);
    if (value) p.set(key, value); else p.delete(key);
    p.delete('page');
    setSearchParams(p);
  };

  let searchTimeout;
  const handleSearch = (e) => {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => updateParam('search', e.target.value), 400);
  };

  return (
    <div className="min-h-screen bg-stone-50">
      <Navbar />

      <div className="pt-20 pb-6 bg-white border-b border-stone-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="section-title mb-2">Our Tile Collection</h1>
          <p className="text-stone-500">
            {pagination.total ? `${pagination.total} products available` : 'Browse our premium selection'}
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters Bar */}
        <div className="flex flex-wrap gap-3 mb-8">
          {/* Search */}
          <div className="relative flex-1 min-w-[200px]">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
            <input
              type="text"
              placeholder="Search tiles..."
              defaultValue={search}
              onChange={handleSearch}
              className="input-field pl-9 h-11"
            />
          </div>

          {/* Category filter */}
          <div className="relative">
            <select
              value={category}
              onChange={(e) => updateParam('category', e.target.value)}
              className="input-field h-11 pr-9 appearance-none cursor-pointer min-w-[160px]"
            >
              {CATEGORIES.map(c => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </select>
            <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 pointer-events-none" />
          </div>

          {/* Sort */}
          <div className="relative">
            <select
              value={sort}
              onChange={(e) => updateParam('sort', e.target.value)}
              className="input-field h-11 pr-9 appearance-none cursor-pointer min-w-[180px]"
            >
              {SORT_OPTIONS.map(o => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
            <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 pointer-events-none" />
          </div>

          {/* Clear filters */}
          {(category !== 'all' || search || sort !== '-createdAt') && (
            <button
              onClick={() => setSearchParams({})}
              className="inline-flex items-center gap-2 h-11 px-4 rounded-xl border border-stone-200 text-stone-600 hover:bg-stone-100 text-sm transition-colors"
            >
              <X size={14} /> Clear
            </button>
          )}
        </div>

        {/* Category pills */}
        <div className="flex gap-2 mb-8 overflow-x-auto scrollbar-hide pb-1">
          {CATEGORIES.map(c => (
            <button
              key={c.value}
              onClick={() => updateParam('category', c.value)}
              className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-all flex-shrink-0
                ${category === c.value
                  ? 'bg-primary-600 text-white shadow-sm'
                  : 'bg-white text-stone-600 border border-stone-200 hover:border-primary-300 hover:text-primary-700'
                }`}
            >
              {c.label}
            </button>
          ))}
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {Array(12).fill(0).map((_, i) => (
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
        ) : products.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="font-display text-2xl font-bold text-stone-700 mb-2">No products found</h3>
            <p className="text-stone-500 mb-6">Try adjusting your filters or search term</p>
            <button onClick={() => setSearchParams({})} className="btn-primary">
              Clear Filters
            </button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {products.map(product => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>

            {/* Pagination */}
            {pagination.pages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-12">
                <button
                  disabled={page <= 1}
                  onClick={() => updateParam('page', page - 1)}
                  className="px-4 py-2 rounded-xl border border-stone-200 text-sm font-medium disabled:opacity-40 hover:bg-stone-50 transition-colors"
                >
                  Previous
                </button>
                {Array.from({ length: Math.min(pagination.pages, 7) }, (_, i) => i + 1).map(p => (
                  <button
                    key={p}
                    onClick={() => updateParam('page', p)}
                    className={`w-10 h-10 rounded-xl text-sm font-medium transition-colors
                      ${p === page ? 'bg-primary-600 text-white' : 'border border-stone-200 hover:bg-stone-50 text-stone-600'}`}
                  >
                    {p}
                  </button>
                ))}
                <button
                  disabled={page >= pagination.pages}
                  onClick={() => updateParam('page', page + 1)}
                  className="px-4 py-2 rounded-xl border border-stone-200 text-sm font-medium disabled:opacity-40 hover:bg-stone-50 transition-colors"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>

      <Footer />
      <WhatsAppButton />
    </div>
  );
}

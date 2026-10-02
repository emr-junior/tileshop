import { useState, useEffect, useRef } from 'react';
import { Plus, Pencil, Trash2, Search, Image, X, Package, ToggleLeft, ToggleRight } from 'lucide-react';
import toast from 'react-hot-toast';
import { productAPI } from '../../utils/api';

const CATEGORIES = ['floor','wall','outdoor','bathroom','kitchen','decorative','mosaic'];
const MATERIALS = ['ceramic','porcelain','marble','granite','travertine','slate','glass','other'];
const FINISHES = ['matte','glossy','polished','textured','satin'];

const formatPrice = (p) =>
  new Intl.NumberFormat('fr-CM', { style: 'currency', currency: 'XAF', maximumFractionDigits: 0 }).format(p);

const EMPTY_FORM = {
  name: '', description: '', category: 'floor', size: '',
  material: 'ceramic', finish: 'matte', color: '', brand: '', origin: '',
  pricePerBox: '', pricePerM2: '', tilesPerBox: '1', coveragePerBox: '1',
  stock: '', tags: '', isFeatured: false, isActive: true,
};

function ProductModal({ product, onClose, onSaved }) {
  const [form, setForm] = useState(product ? {
    ...product,
    tags: Array.isArray(product.tags) ? product.tags.join(', ') : '',
    pricePerBox: product.pricePerBox?.toString() || '',
    pricePerM2: product.pricePerM2?.toString() || '',
    tilesPerBox: product.tilesPerBox?.toString() || '1',
    coveragePerBox: product.coveragePerBox?.toString() || '1',
    stock: product.stock?.toString() || '',
    isFeatured: product.isFeatured || false,
    isActive: product.isActive !== false,
  } : EMPTY_FORM);
  const [images, setImages] = useState([]);
  const [previews, setPreviews] = useState(product?.images || []);
  const [saving, setSaving] = useState(false);
  const fileRef = useRef();

  const handleChange = (field, value) => setForm(p => ({ ...p, [field]: value }));

  const handleFiles = (e) => {
    const files = Array.from(e.target.files);
    setImages(prev => [...prev, ...files]);
    const newPreviews = files.map(f => ({ url: URL.createObjectURL(f), local: true }));
    setPreviews(prev => [...prev, ...newPreviews]);
  };

  const removePreview = (i) => {
    setPreviews(prev => prev.filter((_, idx) => idx !== i));
    const localIdx = previews.slice(0, i).filter(p => p.local).length;
    if (previews[i]?.local) setImages(prev => prev.filter((_, idx) => idx !== localIdx));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.pricePerBox || !form.stock || !form.size) {
      toast.error('Please fill required fields: Name, Size, Price, Stock');
      return;
    }
    setSaving(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => {
        if (v !== undefined && v !== null) fd.append(k, v);
      });
      images.forEach(f => fd.append('images', f));

      if (product?._id) {
        await productAPI.update(product._id, fd);
        toast.success('Product updated!');
      } else {
        await productAPI.create(fd);
        toast.success('Product created!');
      }
      onSaved();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save product');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 backdrop-blur-sm overflow-y-auto py-6 px-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl my-auto animate-fadeIn">
        <div className="flex items-center justify-between p-6 border-b border-stone-100">
          <h2 className="font-display text-xl font-bold text-stone-900">
            {product ? 'Edit Product' : 'Add New Product'}
          </h2>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-stone-100 text-stone-500"><X size={20} /></button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[80vh] overflow-y-auto custom-scroll">
          {/* Images */}
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-2">Images</label>
            <div className="flex flex-wrap gap-3 mb-3">
              {previews.map((img, i) => (
                <div key={i} className="relative w-20 h-20 rounded-xl overflow-hidden border-2 border-stone-200 group">
                  <img src={img.url} alt="" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removePreview(i)}
                    className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
                  >
                    <X size={16} className="text-white" />
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="w-20 h-20 rounded-xl border-2 border-dashed border-stone-300 flex flex-col items-center justify-center text-stone-400 hover:border-primary-400 hover:text-primary-500 transition-colors"
              >
                <Image size={18} />
                <span className="text-xs mt-1">Add</span>
              </button>
            </div>
            <input ref={fileRef} type="file" multiple accept="image/*" onChange={handleFiles} className="hidden" />
          </div>

          {/* Name */}
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-stone-700 mb-1">Name *</label>
              <input value={form.name} onChange={e => handleChange('name', e.target.value)}
                className="input-field" placeholder="e.g. Ivory Marble Polished" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">Category *</label>
              <select value={form.category} onChange={e => handleChange('category', e.target.value)} className="input-field capitalize">
                {CATEGORIES.map(c => <option key={c} value={c} className="capitalize">{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">Size (cm) *</label>
              <input value={form.size} onChange={e => handleChange('size', e.target.value)}
                className="input-field" placeholder="e.g. 60x60" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">Material</label>
              <select value={form.material} onChange={e => handleChange('material', e.target.value)} className="input-field capitalize">
                {MATERIALS.map(m => <option key={m} value={m} className="capitalize">{m}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">Finish</label>
              <select value={form.finish} onChange={e => handleChange('finish', e.target.value)} className="input-field capitalize">
                {FINISHES.map(f => <option key={f} value={f} className="capitalize">{f}</option>)}
              </select>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">Description *</label>
            <textarea value={form.description} onChange={e => handleChange('description', e.target.value)}
              rows={3} className="input-field resize-none" placeholder="Describe the tile..." required />
          </div>

          {/* Pricing */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">Price per Box (FCFA) *</label>
              <input type="number" value={form.pricePerBox} onChange={e => handleChange('pricePerBox', e.target.value)}
                className="input-field" placeholder="18500" min="0" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">Price per m² (FCFA)</label>
              <input type="number" value={form.pricePerM2} onChange={e => handleChange('pricePerM2', e.target.value)}
                className="input-field" placeholder="8500" min="0" />
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">Tiles per Box</label>
              <input type="number" value={form.tilesPerBox} onChange={e => handleChange('tilesPerBox', e.target.value)}
                className="input-field" min="1" />
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">Coverage per Box (m²)</label>
              <input type="number" value={form.coveragePerBox} onChange={e => handleChange('coveragePerBox', e.target.value)}
                className="input-field" step="0.01" min="0.01" />
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">Stock (boxes) *</label>
              <input type="number" value={form.stock} onChange={e => handleChange('stock', e.target.value)}
                className="input-field" placeholder="100" min="0" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">Color</label>
              <input value={form.color} onChange={e => handleChange('color', e.target.value)}
                className="input-field" placeholder="e.g. Ivory/Cream" />
            </div>
          </div>

          {/* Extra */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">Brand</label>
              <input value={form.brand} onChange={e => handleChange('brand', e.target.value)} className="input-field" placeholder="EuroTile" />
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">Origin Country</label>
              <input value={form.origin} onChange={e => handleChange('origin', e.target.value)} className="input-field" placeholder="Spain" />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-stone-700 mb-1">Tags (comma-separated)</label>
              <input value={form.tags} onChange={e => handleChange('tags', e.target.value)}
                className="input-field" placeholder="marble, luxury, floor" />
            </div>
          </div>

          {/* Toggles */}
          <div className="flex items-center gap-6">
            <button type="button" onClick={() => handleChange('isFeatured', !form.isFeatured)}
              className={`flex items-center gap-2 text-sm font-medium transition-colors ${form.isFeatured ? 'text-primary-600' : 'text-stone-500'}`}>
              {form.isFeatured ? <ToggleRight size={22} className="text-primary-600" /> : <ToggleLeft size={22} />}
              Featured Product
            </button>
            <button type="button" onClick={() => handleChange('isActive', !form.isActive)}
              className={`flex items-center gap-2 text-sm font-medium transition-colors ${form.isActive ? 'text-emerald-600' : 'text-stone-400'}`}>
              {form.isActive ? <ToggleRight size={22} className="text-emerald-600" /> : <ToggleLeft size={22} />}
              {form.isActive ? 'Active' : 'Inactive'}
            </button>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary flex-1 justify-center">Cancel</button>
            <button type="submit" disabled={saving} className="btn-primary flex-1 justify-center disabled:opacity-60">
              {saving ? <><div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> Saving...</> : (product ? 'Update Product' : 'Create Product')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [pagination, setPagination] = useState({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [page, setPage] = useState(1);
  const [modalProduct, setModalProduct] = useState(undefined); // undefined=closed, null=new, obj=edit
  const [deletingId, setDeletingId] = useState(null);
  const [stockEditing, setStockEditing] = useState({}); // id -> value

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = { page, limit: 15, sort: '-createdAt' };
      if (search) params.search = search;
      if (category !== 'all') params.category = category;
      const res = await productAPI.getAdminAll(params);
      setProducts(res.data.data);
      setPagination(res.data.pagination);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProducts(); }, [search, category, page]);

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete "${name}"? This cannot be undone.`)) return;
    setDeletingId(id);
    try {
      await productAPI.delete(id);
      toast.success('Product deleted');
      fetchProducts();
    } catch {
      toast.error('Failed to delete');
    } finally {
      setDeletingId(null);
    }
  };

  const handleStockSave = async (id) => {
    const val = stockEditing[id];
    if (val === undefined || val === '') return;
    try {
      await productAPI.updateStock(id, parseInt(val));
      toast.success('Stock updated');
      setStockEditing(prev => { const n = {...prev}; delete n[id]; return n; });
      setProducts(prev => prev.map(p => p._id === id ? {...p, stock: parseInt(val)} : p));
    } catch {
      toast.error('Failed to update stock');
    }
  };

  const avail = (stock) => stock === 0 ? 'badge-red' : stock <= 10 ? 'badge-yellow' : 'badge-green';
  const availLabel = (stock) => stock === 0 ? 'Out' : stock <= 10 ? 'Low' : 'In Stock';

  return (
    <div className="p-4 sm:p-6">
      {modalProduct !== undefined && (
        <ProductModal
          product={modalProduct}
          onClose={() => setModalProduct(undefined)}
          onSaved={() => { setModalProduct(undefined); fetchProducts(); }}
        />
      )}

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="font-display text-2xl font-bold text-stone-900">Products</h1>
          <p className="text-stone-500 text-sm">{pagination.total || 0} total products</p>
        </div>
        <button onClick={() => setModalProduct(null)} className="btn-primary">
          <Plus size={18} /> Add Product
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <div className="relative flex-1 min-w-[180px]">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
          <input
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search products..."
            className="input-field pl-9 h-10 text-sm"
          />
        </div>
        <select
          value={category}
          onChange={e => { setCategory(e.target.value); setPage(1); }}
          className="input-field h-10 text-sm pr-8 min-w-[140px] capitalize"
        >
          <option value="all">All Categories</option>
          {CATEGORIES.map(c => <option key={c} value={c} className="capitalize">{c}</option>)}
        </select>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-stone-50 border-b border-stone-100">
                <th className="text-left px-4 py-3 text-stone-500 font-medium">Product</th>
                <th className="text-left px-4 py-3 text-stone-500 font-medium hidden md:table-cell">Category</th>
                <th className="text-left px-4 py-3 text-stone-500 font-medium hidden sm:table-cell">Size</th>
                <th className="text-left px-4 py-3 text-stone-500 font-medium">Price/Box</th>
                <th className="text-left px-4 py-3 text-stone-500 font-medium">Stock</th>
                <th className="text-left px-4 py-3 text-stone-500 font-medium hidden lg:table-cell">Status</th>
                <th className="text-right px-4 py-3 text-stone-500 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-50">
              {loading ? (
                Array(8).fill(0).map((_, i) => (
                  <tr key={i}>
                    {Array(7).fill(0).map((_, j) => (
                      <td key={j} className="px-4 py-3"><div className="skeleton h-4 rounded w-3/4" /></td>
                    ))}
                  </tr>
                ))
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-stone-400">
                    <Package size={32} className="mx-auto mb-3 opacity-40" />
                    No products found
                  </td>
                </tr>
              ) : products.map(p => {
                const img = p.images?.[0]?.url;
                const isEditingStock = p._id in stockEditing;
                return (
                  <tr key={p._id} className="hover:bg-stone-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {img ? (
                          <img src={img} alt={p.name} className="w-10 h-10 rounded-lg object-cover flex-shrink-0" onError={e => e.target.style.display='none'} />
                        ) : (
                          <div className="w-10 h-10 bg-stone-100 rounded-lg flex items-center justify-center flex-shrink-0">
                            <Package size={16} className="text-stone-400" />
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="font-medium text-stone-900 truncate max-w-[160px]">{p.name}</p>
                          {p.isFeatured && <span className="text-xs text-primary-600 font-medium">★ Featured</span>}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 capitalize text-stone-600 hidden md:table-cell">{p.category}</td>
                    <td className="px-4 py-3 text-stone-600 hidden sm:table-cell">{p.size} cm</td>
                    <td className="px-4 py-3 font-medium text-stone-800">{formatPrice(p.pricePerBox)}</td>
                    <td className="px-4 py-3">
                      {isEditingStock ? (
                        <div className="flex items-center gap-1">
                          <input
                            type="number"
                            value={stockEditing[p._id]}
                            onChange={e => setStockEditing(prev => ({...prev, [p._id]: e.target.value}))}
                            className="w-16 border border-stone-200 rounded-lg px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-primary-400"
                            min="0"
                            autoFocus
                          />
                          <button onClick={() => handleStockSave(p._id)} className="text-xs bg-primary-600 text-white px-2 py-1 rounded-lg hover:bg-primary-700">✓</button>
                          <button onClick={() => setStockEditing(prev => { const n={...prev}; delete n[p._id]; return n; })} className="text-xs text-stone-400 hover:text-stone-600 px-1">✕</button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setStockEditing(prev => ({...prev, [p._id]: p.stock}))}
                          className="flex items-center gap-1.5 hover:text-primary-600 transition-colors group"
                          title="Click to edit stock"
                        >
                          <span className={`badge ${avail(p.stock)}`}>{p.stock}</span>
                          <span className="text-xs text-stone-400 group-hover:text-primary-500">{availLabel(p.stock)}</span>
                        </button>
                      )}
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell">
                      <span className={`badge ${p.isActive ? 'badge-green' : 'badge-gray'}`}>
                        {p.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setModalProduct(p)}
                          className="p-1.5 rounded-lg hover:bg-primary-50 text-stone-400 hover:text-primary-600 transition-colors"
                          title="Edit"
                        >
                          <Pencil size={15} />
                        </button>
                        <button
                          onClick={() => handleDelete(p._id, p.name)}
                          disabled={deletingId === p._id}
                          className="p-1.5 rounded-lg hover:bg-red-50 text-stone-400 hover:text-red-500 transition-colors disabled:opacity-40"
                          title="Delete"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-stone-100">
            <p className="text-sm text-stone-500">
              Showing {((page-1)*15)+1}–{Math.min(page*15, pagination.total)} of {pagination.total}
            </p>
            <div className="flex gap-2">
              <button disabled={page<=1} onClick={() => setPage(p => p-1)}
                className="px-3 py-1.5 rounded-lg border border-stone-200 text-sm disabled:opacity-40 hover:bg-stone-50">Previous</button>
              <button disabled={page>=pagination.pages} onClick={() => setPage(p => p+1)}
                className="px-3 py-1.5 rounded-lg border border-stone-200 text-sm disabled:opacity-40 hover:bg-stone-50">Next</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

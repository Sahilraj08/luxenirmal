import React, { useState, useEffect } from 'react';
import { Product, GlobalSettings } from '../types';
import { Settings, LogOut, Package, Plus, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router';

export function Admin() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(true);
  
  const [products, setProducts] = useState<Product[]>([]);
  const [settings, setSettings] = useState<GlobalSettings>({
    whatsappNumber: '', instagramUrl: '', heroTitle: '', heroSubtitle: '',
    heroImage: '', primaryColor: '', fontHeading: '', fontBody: ''
  });
  
  const navigate = useNavigate();

  useEffect(() => {
    // Check auth status
    fetch('/api/admin/check')
      .then(res => {
        if (res.ok) {
          setIsAuthenticated(true);
          fetchData();
        }
        setLoading(false);
      });
  }, []);

  const fetchData = async () => {
    const pRes = await fetch('/api/products');
    setProducts(await pRes.json());
    
    const sRes = await fetch('/api/settings');
    setSettings(await sRes.json());
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password })
    });
    if (res.ok) {
      setIsAuthenticated(true);
      fetchData();
    } else {
      alert("Invalid password");
    }
  };

  const handleLogout = async () => {
    await fetch('/api/logout', { method: 'POST' });
    setIsAuthenticated(false);
    navigate('/');
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch('/api/admin/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settings)
    });
    alert("Settings saved!");
  };

  const handleDeleteProduct = async (id: string) => {
    if (confirm("Are you sure?")) {
      await fetch(`/api/admin/products/${id}`, { method: 'DELETE' });
      setProducts(products.filter(p => p.id !== id));
    }
  };

  // Basic Add Product Form logic (simplified for the demo)
  const handleAddProduct = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    
    const newProduct = {
      title: fd.get('title') as string,
      description: fd.get('description') as string,
      price: parseFloat(fd.get('price') as string),
      category: fd.get('category') as string,
      images: [fd.get('image') as string],
      marketplaceLink: fd.get('marketplaceLink') as string || undefined,
    };

    const res = await fetch('/api/admin/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newProduct)
    });
    const saved = await res.json();
    setProducts([...products, saved]);
    e.currentTarget.reset();
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-lux-cream px-4">
        <div className="bg-white p-8 rounded-xl shadow-sm max-w-sm w-full border border-gray-100">
          <h1 className="font-serif text-2xl text-center mb-6">Admin Portal</h1>
          <form onSubmit={handleLogin} className="flex flex-col gap-4">
            <input 
              type="password" 
              placeholder="Enter Master Password"
              className="px-4 py-3 border border-gray-200 rounded focus:border-lux-gold focus:outline-none"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
            <button type="submit" className="bg-lux-charcoal text-white py-3 rounded hover:bg-black transition-colors font-medium">
              Access Dashboard
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-6 border-b border-gray-100">
          <h2 className="font-serif text-xl font-medium">Luxenirmal</h2>
          <p className="text-xs text-gray-500 uppercase tracking-widest mt-1">Admin Dashboard</p>
        </div>
        <nav className="p-4 flex flex-col gap-2 flex-grow text-sm">
          <a href="#products" className="flex items-center gap-3 p-3 bg-gray-50 text-lux-charcoal rounded-md font-medium">
            <Package size={18} /> Products
          </a>
          <a href="#settings" className="flex items-center gap-3 p-3 hover:bg-gray-50 text-gray-600 rounded-md transition-colors">
            <Settings size={18} /> Global Settings
          </a>
        </nav>
        <div className="p-4 border-t border-gray-100">
          <button onClick={handleLogout} className="flex items-center gap-3 p-3 w-full text-left text-red-500 hover:bg-red-50 rounded-md transition-colors text-sm font-medium">
            <LogOut size={18} /> Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-y-auto w-full">
        <div className="max-w-4xl mx-auto space-y-12">
          
          <section id="settings" className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h3 className="font-serif text-2xl mb-6 flex items-center gap-2"><Settings className="text-gray-400"/> Settings</h3>
            <form onSubmit={handleSaveSettings} className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-medium uppercase tracking-wider text-gray-500 mb-2">WhatsApp Number</label>
                <input 
                  type="text" 
                  className="w-full border border-gray-200 rounded p-2 focus:border-lux-gold focus:outline-none"
                  value={settings.whatsappNumber}
                  onChange={e => setSettings({...settings, whatsappNumber: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-xs font-medium uppercase tracking-wider text-gray-500 mb-2">Instagram URL</label>
                <input 
                  type="text" 
                  className="w-full border border-gray-200 rounded p-2 focus:border-lux-gold focus:outline-none"
                  value={settings.instagramUrl}
                  onChange={e => setSettings({...settings, instagramUrl: e.target.value})}
                />
              </div>
              <div className="md:col-span-2 pt-4 border-t border-gray-100">
                <h4 className="font-serif text-lg mb-4 text-gray-800">Appearance & Theme</h4>
              </div>
              <div>
                <label className="block text-xs font-medium uppercase tracking-wider text-gray-500 mb-2">Primary Accent Color (Hex/Tailwind)</label>
                <div className="flex gap-2">
                  <input type="color" className="p-1 h-10 w-12 border border-gray-200 rounded cursor-pointer" value={settings.primaryColor || '#C5A059'} onChange={e => setSettings({...settings, primaryColor: e.target.value})} />
                  <input 
                    type="text" 
                    className="flex-1 border border-gray-200 rounded p-2 focus:border-lux-gold focus:outline-none"
                    value={settings.primaryColor}
                    placeholder="#C5A059"
                    onChange={e => setSettings({...settings, primaryColor: e.target.value})}
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium uppercase tracking-wider text-gray-500 mb-2">Heading Font Family</label>
                <input 
                  type="text" 
                  className="w-full border border-gray-200 rounded p-2 focus:border-lux-gold focus:outline-none"
                  value={settings.fontHeading}
                  placeholder="Playfair Display"
                  onChange={e => setSettings({...settings, fontHeading: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-xs font-medium uppercase tracking-wider text-gray-500 mb-2">Body Font Family</label>
                <input 
                  type="text" 
                  className="w-full border border-gray-200 rounded p-2 focus:border-lux-gold focus:outline-none"
                  value={settings.fontBody}
                  placeholder="Inter"
                  onChange={e => setSettings({...settings, fontBody: e.target.value})}
                />
              </div>
              <div className="md:col-span-2 pt-4 border-t border-gray-100">
                <h4 className="font-serif text-lg mb-4 text-gray-800">Hero Section</h4>
              </div>
              <div>
                <label className="block text-xs font-medium uppercase tracking-wider text-gray-500 mb-2">Hero Image URL</label>
                <input 
                  type="text" 
                  className="w-full border border-gray-200 rounded p-2 focus:border-lux-gold focus:outline-none"
                  value={settings.heroImage}
                  onChange={e => setSettings({...settings, heroImage: e.target.value})}
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-medium uppercase tracking-wider text-gray-500 mb-2">Hero Title (Allows basic HTML)</label>
                <input 
                  type="text" 
                  className="w-full border border-gray-200 rounded p-2 focus:border-lux-gold focus:outline-none"
                  value={settings.heroTitle}
                  onChange={e => setSettings({...settings, heroTitle: e.target.value})}
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-medium uppercase tracking-wider text-gray-500 mb-2">Hero Subtitle</label>
                <textarea 
                  className="w-full border border-gray-200 rounded p-2 focus:border-lux-gold focus:outline-none h-20"
                  value={settings.heroSubtitle}
                  onChange={e => setSettings({...settings, heroSubtitle: e.target.value})}
                />
              </div>
              <div className="md:col-span-2 flex justify-end">
                <button type="submit" className="bg-lux-charcoal text-white px-6 py-2 rounded text-sm hover:bg-black transition-colors">Save Settings</button>
              </div>
            </form>
          </section>

          <section id="products" className="space-y-6">
            <h3 className="font-serif text-2xl flex items-center gap-2"><Package className="text-gray-400"/> Manage Products</h3>
            
            {/* Add Product Form */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <h4 className="font-medium mb-4 flex items-center gap-2 text-sm uppercase tracking-wide text-gray-500"><Plus size={16}/> Add New</h4>
              <form onSubmit={handleAddProduct} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input required name="title" placeholder="Product Title" className="border border-gray-200 rounded p-2 text-sm" />
                <input required name="price" type="number" step="0.01" placeholder="Price" className="border border-gray-200 rounded p-2 text-sm" />
                <input required name="category" placeholder="Category" className="border border-gray-200 rounded p-2 text-sm" />
                <input required name="image" placeholder="Image URL" className="border border-gray-200 rounded p-2 text-sm" />
                <input name="marketplaceLink" placeholder="Marketplace Link (Optional to switch to Flow B)" className="border border-gray-200 rounded p-2 text-sm md:col-span-2" />
                <textarea required name="description" placeholder="Premium description..." className="border border-gray-200 rounded p-2 text-sm md:col-span-2 h-20"></textarea>
                <div className="md:col-span-2">
                  <button type="submit" className="bg-lux-gold text-white px-6 py-2 rounded text-sm hover:opacity-90 transition-opacity">Add Product</button>
                </div>
              </form>
            </div>

            {/* List Products */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-gray-50 text-gray-500 uppercase tracking-wider text-xs">
                    <tr>
                      <th className="p-4 font-medium">Product</th>
                      <th className="p-4 font-medium">Price</th>
                      <th className="p-4 font-medium">Category</th>
                      <th className="p-4 font-medium">Type</th>
                      <th className="p-4 font-medium text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {products.map(p => (
                      <tr key={p.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="p-4 flex items-center gap-3">
                          <img src={p.images[0]} alt={p.title} className="w-10 h-10 object-cover rounded bg-gray-100" />
                          <span className="font-medium truncate max-w-[200px]">{p.title}</span>
                        </td>
                        <td className="p-4">₹{p.price.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                        <td className="p-4"><span className="px-2 py-1 bg-gray-100 rounded text-xs">{p.category}</span></td>
                        <td className="p-4">
                          {p.marketplaceLink ? <span className="text-lux-gold text-xs font-medium">Flow B (External)</span> : <span className="text-green-600 text-xs font-medium">Flow A (Direct)</span>}
                        </td>
                        <td className="p-4 text-right">
                          <button onClick={() => handleDeleteProduct(p.id)} className="text-gray-400 hover:text-red-500 transition-colors p-1">
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

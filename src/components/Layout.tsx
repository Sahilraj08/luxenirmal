import React, { useEffect, useState } from 'react';
import { ShoppingBag, Menu } from 'lucide-react';
import { Outlet, Link } from 'react-router';
import { useStore } from '../store';
import { CartDrawer } from './CartDrawer';
import { GlobalSettings } from '../types';

export function Layout() {
  const { toggleCart, cart } = useStore();
  const [settings, setSettings] = useState<GlobalSettings | null>(null);

  useEffect(() => {
    fetch('/api/settings')
      .then(res => res.json())
      .then(data => {
        setSettings(data);
        if (data.primaryColor) {
          document.documentElement.style.setProperty('--color-lux-gold', data.primaryColor);
        }
        if (data.fontHeading) {
          document.documentElement.style.setProperty('--font-serif', `"${data.fontHeading}", ui-serif, Georgia, serif`);
        }
        if (data.fontBody) {
          document.documentElement.style.setProperty('--font-sans', `"${data.fontBody}", ui-sans-serif, system-ui, sans-serif`);
        }
      })
      .catch(err => console.error("Could not fetch settings", err));
  }, []);

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="min-h-screen flex flex-col font-sans">
      <header className="sticky top-0 z-30 bg-lux-cream/90 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button className="md:hidden p-2 text-lux-charcoal hover:bg-black/5 rounded-full transition-colors">
              <Menu />
            </button>
            <Link to="/" className="font-serif text-3xl font-medium tracking-tight text-lux-charcoal">
              Luxenirmal
            </Link>
          </div>
          
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium tracking-wide uppercase text-gray-600">
            <Link to="/" className="hover:text-lux-gold transition-colors">Shop</Link>
            <a href="#" className="hover:text-lux-gold transition-colors">About</a>
            <a href="#" className="hover:text-lux-gold transition-colors">Journal</a>
          </nav>

          <div className="flex items-center gap-4">
            <button 
              onClick={toggleCart}
              className="relative p-2 text-lux-charcoal hover:bg-black/5 rounded-full transition-colors flex items-center justify-center"
            >
              <ShoppingBag />
              {totalItems > 0 && (
                <span className="absolute top-0 right-0 transform translate-x-1 -translate-y-1 bg-lux-gold text-white text-[10px] font-bold h-5 w-5 flex items-center justify-center rounded-full shadow-sm">
                  {totalItems}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <Outlet context={{ settings }} />
      </main>

      <footer className="bg-lux-charcoal text-lux-white/70 py-16 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-3 gap-12 text-sm">
          <div>
            <h4 className="font-serif text-2xl text-lux-white mb-6">Luxenirmal</h4>
            <p className="max-w-xs">Curating minimalist, elegant, and timeless pieces for your sacred spaces.</p>
          </div>
          <div>
            <h5 className="uppercase tracking-widest text-lux-white/50 mb-6 font-medium text-xs">Explore</h5>
            <ul className="flex flex-col gap-3">
              <li><Link to="/" className="hover:text-lux-white transition-colors">All Products</Link></li>
              <li><a href="#" className="hover:text-lux-white transition-colors">Our Story</a></li>
              <li><Link to="/admin-portal" className="text-lux-gold hover:text-white transition-colors mt-2 block">Admin Login</Link></li>
            </ul>
          </div>
          <div>
            <h5 className="uppercase tracking-widest text-lux-white/50 mb-6 font-medium text-xs">Connect</h5>
            <ul className="flex flex-col gap-3">
              <li>
                <a 
                  href={settings?.instagramUrl || '#'} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="hover:text-lux-white transition-colors"
                >
                  Instagram
                </a>
              </li>
              <li><a href="#" className="hover:text-lux-white transition-colors">Support</a></li>
            </ul>
          </div>
        </div>
      </footer>

      <CartDrawer settings={settings} />
    </div>
  );
}

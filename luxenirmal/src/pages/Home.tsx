import React, { useEffect, useState } from 'react';
import { ProductCard } from '../components/ProductCard';
import { Product, GlobalSettings } from '../types';
import { motion } from 'motion/react';
import { useOutletContext } from 'react-router';

export function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const { settings } = useOutletContext<{ settings: GlobalSettings | null }>();

  useEffect(() => {
    fetch('/api/products')
      .then(res => res.json())
      .then(data => {
        setProducts(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  return (
    <div>
      <section className="relative h-[70vh] min-h-[600px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img 
            src={settings?.heroImage || "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&q=80&w=2000"} 
            alt="Minimalist living room" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/20" />
        </div>
        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
          <motion.h1 
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="font-serif text-5xl md:text-7xl text-lux-white mb-6 leading-tight drop-shadow-sm"
            dangerouslySetInnerHTML={{ __html: settings?.heroTitle || "Elevate Your <br/><span class='text-lux-beige italic'>Everyday Space</span>" }}
          />
          <motion.p 
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
            className="text-lux-white/90 text-lg md:text-xl font-sans max-w-2xl mx-auto drop-shadow-sm"
          >
            {settings?.heroSubtitle || "Discover our curated collection of luxury home essentials, designed for the modern minimalist."}
          </motion.p>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="flex flex-col items-center justify-center mb-16 text-center">
          <h2 className="font-serif text-4xl mb-4">Curated Collection</h2>
          <div className="w-16 h-[1px] bg-lux-gold/50"></div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-lux-gold"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

import React from 'react';
import { Product } from '../types';
import { useStore } from '../store';
import { ShoppingBag, ExternalLink } from 'lucide-react';
import { motion } from 'motion/react';

interface ProductCardProps {
  product: Product;
  key?: React.Key;
}

export function ProductCard({ product }: ProductCardProps) {
  const addToCart = useStore((state) => state.addToCart);

  const isExternal = Boolean(product.marketplaceLink);

  const handleBuy = () => {
    if (isExternal && product.marketplaceLink) {
      window.open(product.marketplaceLink, '_blank');
    } else {
      addToCart(product);
    }
  };

  return (
    <motion.div 
      className="group relative flex flex-col bg-lux-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300"
      whileHover={{ y: -5 }}
    >
      <div className="aspect-[4/5] bg-lux-beige overflow-hidden">
        <img 
          src={product.images[0] || 'https://images.unsplash.com/photo-1542282811-943ef1a647a5?auto=format&fit=crop&q=80&w=800'} 
          alt={product.title}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
      </div>
      
      <div className="p-6 flex flex-col flex-grow">
        <div className="uppercase tracking-widest text-xs text-lux-gold mb-2 font-medium">
          {product.category}
        </div>
        <h3 className="font-serif text-xl text-lux-charcoal mb-2 line-clamp-1">{product.title}</h3>
        <p className="text-gray-600 font-sans text-sm mb-4 line-clamp-2 flex-grow">
          {product.description}
        </p>
        <div className="flex items-center justify-between mt-auto">
          <span className="font-sans text-lg font-semibold">₹{product.price.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
          
          <button 
            onClick={handleBuy}
            className="flex items-center justify-center gap-2 bg-lux-charcoal text-lux-white px-4 py-2 rounded-full hover:bg-black transition-colors font-sans text-sm font-medium"
          >
            {isExternal ? (
              <>
                <span>Buy External</span>
                <ExternalLink size={16} />
              </>
            ) : (
              <>
                <span>Add to Cart</span>
                <ShoppingBag size={16} />
              </>
            )}
          </button>
        </div>
      </div>
    </motion.div>
  );
}

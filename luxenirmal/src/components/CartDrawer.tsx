import React, { useState } from 'react';
import { useStore } from '../store';
import { motion, AnimatePresence } from 'motion/react';
import { X, Minus, Plus, ShoppingBag } from 'lucide-react';
import { GlobalSettings } from '../types';

interface CartDrawerProps {
  settings?: GlobalSettings | null;
}

export function CartDrawer({ settings }: CartDrawerProps) {
  const { cart, isCartOpen, toggleCart, updateQuantity, removeFromCart, clearCart } = useStore();
  const [formData, setFormData] = useState({ name: '', address: '', phone: '' });

  const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const handleCheckout = (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings?.whatsappNumber) {
      alert("Store configuration error. Please try again later.");
      return;
    }

    const { name, address, phone } = formData;
    
    let orderText = `🛍️ *NEW ORDER FROM LUXENIRMAL* 🛍️\n\n`;
    orderText += `👤 *CUSTOMER DETAILS:*\n`;
    orderText += `• Name: ${name}\n`;
    orderText += `• Phone: ${phone}\n`;
    orderText += `• Address: ${address}\n\n`;
    orderText += `📦 *ORDERED ITEMS:*\n`;
    
    cart.forEach(item => {
      orderText += `• ${item.title} (Qty: ${item.quantity}) - ₹${(item.price * item.quantity).toFixed(2)}\n`;
    });
    
    orderText += `\n💵 *TOTAL AMOUNT:* ₹${total.toFixed(2)}\n\n`;
    orderText += `👉 Please confirm your order by replying to this message.`;

    const encodedText = encodeURIComponent(orderText);
    const whatsappUrl = `https://wa.me/${settings.whatsappNumber}?text=${encodedText}`;
    
    window.open(whatsappUrl, '_blank');
    clearCart();
    toggleCart();
  };

  return (
    <AnimatePresence>
      {isCartOpen && (
        <>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black z-40"
            onClick={toggleCart}
          />
          <motion.div 
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 h-full w-full max-w-md bg-lux-cream shadow-2xl z-50 flex flex-col"
          >
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h2 className="font-serif text-2xl flex items-center gap-2">
                <ShoppingBag /> Your Cart
              </h2>
              <button 
                onClick={toggleCart}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6">
              {cart.length === 0 ? (
                <div className="flex-1 flex items-center justify-center text-gray-500 font-sans">
                  Your cart is elegantly empty.
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  {cart.map(item => (
                    <div key={item.id} className="flex gap-4 bg-lux-white p-3 rounded-lg shadow-sm">
                      <img src={item.images[0]} alt={item.title} className="w-20 h-24 object-cover rounded" />
                      <div className="flex flex-col flex-1">
                        <h4 className="font-serif text-lg leading-tight mb-1">{item.title}</h4>
                        <span className="text-gray-500 text-sm mb-auto font-sans">₹{item.price.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                        <div className="flex items-center justify-between border-t border-gray-100 pt-2 mt-2">
                          <div className="flex items-center gap-3">
                            <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="p-1 hover:bg-gray-100 rounded">
                              <Minus size={14} />
                            </button>
                            <span className="text-sm font-medium">{item.quantity}</span>
                            <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="p-1 hover:bg-gray-100 rounded">
                              <Plus size={14} />
                            </button>
                          </div>
                          <button onClick={() => removeFromCart(item.id)} className="text-xs text-red-400 hover:text-red-600 transition-colors uppercase tracking-wider font-medium">
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {cart.length > 0 && (
              <div className="border-t border-gray-200 p-6 bg-lux-white">
                <div className="flex justify-between items-center mb-6">
                  <span className="font-sans text-gray-600">Subtotal</span>
                  <span className="font-serif text-2xl font-medium">₹{total.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
                
                <form onSubmit={handleCheckout} className="flex flex-col gap-4">
                  <h3 className="font-serif text-lg mb-2 border-b pb-2">Checkout Details</h3>
                  <input
                    required
                    type="text"
                    placeholder="Full Name"
                    className="w-full px-4 py-3 rounded-md border border-gray-200 focus:outline-none focus:border-lux-gold font-sans transition-colors"
                    value={formData.name}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                  />
                  <input
                    required
                    type="text"
                    placeholder="Delivery Address (City, State, Pincode)"
                    className="w-full px-4 py-3 rounded-md border border-gray-200 focus:outline-none focus:border-lux-gold font-sans transition-colors"
                    value={formData.address}
                    onChange={e => setFormData({...formData, address: e.target.value})}
                  />
                  <input
                    required
                    type="tel"
                    placeholder="Active Phone Number"
                    className="w-full px-4 py-3 rounded-md border border-gray-200 focus:outline-none focus:border-lux-gold font-sans transition-colors"
                    value={formData.phone}
                    onChange={e => setFormData({...formData, phone: e.target.value})}
                  />
                  
                  <button type="submit" className="w-full bg-lux-charcoal text-lux-white py-4 rounded-full font-medium tracking-wide hover:bg-black transition-colors flex items-center justify-center gap-2 mt-2">
                    Complete via WhatsApp
                  </button>
                </form>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

import React from 'react';
import { X, Trash2, ShoppingBag, ArrowRight } from 'lucide-react';
import type { CartItem } from '../lib/api.ts';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onUpdateQuantity: (productId: string, delta: number) => void;
  onRemoveItem: (productId: string) => void;
  onProceedCheckout: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  items,
  onUpdateQuantity,
  onRemoveItem,
  onProceedCheckout,
}) => {
  if (!isOpen) return null;

  const subtotal = items.reduce((sum, item) => {
    const price = item.customSellingPrice !== undefined ? item.customSellingPrice : item.product.basePrice;
    return sum + price * item.quantity;
  }, 0);

  const deliveryFee = subtotal > 5000 ? 0 : 80; // Free delivery over ৳5000
  const grandTotal = subtotal + (items.length > 0 ? deliveryFee : 0);

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/60 backdrop-blur-xs flex justify-end">
      <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col justify-between animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-[#0066ff]" />
            <h2 className="text-sm font-bold text-slate-900">Your Shopping Bag ({items.length})</h2>
          </div>
          <button
            onClick={onClose}
            aria-label="Close cart drawer"
            className="p-1 rounded-md text-slate-500 hover:text-slate-800 hover:bg-slate-200/60 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Item List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {items.length === 0 ? (
            <div className="py-16 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-slate-100 mx-auto flex items-center justify-center text-slate-400">
                <ShoppingBag className="w-6 h-6" />
              </div>
              <p className="text-sm font-medium text-slate-700">Your bag is currently empty.</p>
              <button
                onClick={onClose}
                className="text-xs font-semibold text-[#0066ff] hover:underline cursor-pointer"
              >
                Browse Our Catalog
              </button>
            </div>
          ) : (
            items.map((item) => {
              const price = item.customSellingPrice !== undefined ? item.customSellingPrice : (item.product.originalPrice || item.product.basePrice);
              return (
                <div
                  key={item.product.id}
                  className="flex gap-3 p-3 rounded-lg border border-slate-200 bg-white shadow-2xs items-center"
                >
                  <img
                    src={item.product.images[0]}
                    alt={item.product.name}
                    className="w-16 h-16 object-cover rounded-md bg-slate-100 shrink-0"
                    referrerPolicy="no-referrer"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-semibold text-slate-900 truncate" title={item.product.name}>
                      {item.product.name}
                    </h4>
                    <p className="text-xs font-mono font-bold text-slate-900 mt-0.5 tabular-nums">
                      ৳{price.toLocaleString()}
                    </p>

                    {/* Quantity controls */}
                    <div className="flex items-center gap-2 mt-2">
                      <div className="flex items-center border border-slate-200 rounded">
                        <button
                          onClick={() => onUpdateQuantity(item.product.id, -1)}
                          className="px-2 py-0.5 text-xs text-slate-600 hover:bg-slate-100 cursor-pointer"
                        >
                          -
                        </button>
                        <span className="px-2 text-xs font-mono font-bold tabular-nums">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => onUpdateQuantity(item.product.id, 1)}
                          className="px-2 py-0.5 text-xs text-slate-600 hover:bg-slate-100 cursor-pointer"
                        >
                          +
                        </button>
                      </div>

                      <button
                        onClick={() => onRemoveItem(item.product.id)}
                        className="text-slate-400 hover:text-red-500 p-1 cursor-pointer transition-colors"
                        title="Remove"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer Summary & Checkout */}
        {items.length > 0 && (
          <div className="p-4 border-t border-slate-200 bg-slate-50 space-y-3">
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal</span>
                <span className="font-mono tabular-nums">৳{subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Estimated Shipping</span>
                <span className="font-mono tabular-nums">
                  {deliveryFee === 0 ? <span className="text-emerald-600 font-semibold">FREE</span> : `৳${deliveryFee}`}
                </span>
              </div>
              <div className="flex justify-between text-sm font-bold text-slate-900 pt-2 border-t border-slate-200">
                <span>Total</span>
                <span className="font-mono tabular-nums text-[#0066ff]">৳{grandTotal.toLocaleString()}</span>
              </div>
            </div>

            <button
              onClick={() => {
                onClose();
                onProceedCheckout();
              }}
              className="w-full py-2.5 px-4 bg-[#0066ff] hover:bg-[#0052cc] text-white text-xs font-bold rounded-lg flex items-center justify-center gap-2 shadow-sm transition-colors cursor-pointer"
            >
              <span>Proceed to Checkout</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

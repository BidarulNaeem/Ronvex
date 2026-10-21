import React, { useState } from 'react';
import { X, ShoppingBag, Zap, ShieldCheck, Truck, RefreshCw, Share2, Check } from 'lucide-react';
import type { Product } from '../types/index.ts';

interface ProductModalProps {
  product: Product | null;
  displayPrice?: number;
  affiliateId?: string | null;
  onClose: () => void;
  onAddToCart: (product: Product, quantity: number, customPrice?: number) => void;
  onBuyNow: (product: Product, quantity: number, customPrice?: number) => void;
}

export const ProductModal: React.FC<ProductModalProps> = ({
  product,
  displayPrice,
  affiliateId,
  onClose,
  onAddToCart,
  onBuyNow,
}) => {
  const [quantity, setQuantity] = useState(1);
  const [copied, setCopied] = useState(false);

  if (!product) return null;

  const finalPrice = displayPrice !== undefined ? displayPrice : product.basePrice;
  const originalPrice = product.originalPrice && product.originalPrice > finalPrice ? product.originalPrice : null;

  const handleShare = () => {
    const url = new URL(window.location.origin);
    url.searchParams.set('product', product.slug);
    if (affiliateId) {
      url.searchParams.set('ref', affiliateId);
    }
    navigator.clipboard.writeText(url.toString());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="relative bg-white rounded-2xl max-w-3xl w-full overflow-hidden shadow-2xl border border-slate-200">
        {/* Close Button */}
        <button
          onClick={onClose}
          aria-label="Close product view"
          className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center cursor-pointer transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2">
          {/* Left: Product Image */}
          <div className="bg-slate-100 p-6 flex items-center justify-center relative">
            <img
              src={product.images[0]}
              alt={product.name}
              className="max-h-[380px] w-full object-contain rounded-lg"
              referrerPolicy="no-referrer"
            />
            {product.featured && (
              <span className="absolute top-4 left-4 bg-[#0a192f] text-[#38bdf8] text-[10px] font-bold px-2 py-0.5 rounded">
                Flagship Edition
              </span>
            )}
          </div>

          {/* Right: Contiguous Purchase Module */}
          <div className="p-6 md:p-8 flex flex-col justify-between space-y-5">
            <div>
              {/* Unboxed Metadata */}
              <div className="flex items-center gap-2 text-xs text-slate-600 mb-1 font-medium">
                <span>{product.category}</span>
                <span aria-hidden="true">·</span>
                <span>SKU: {product.sku}</span>
              </div>

              <h2 className="text-xl font-bold text-slate-900 leading-snug mb-3">
                {product.name}
              </h2>

              {/* Pricing */}
              <div className="flex items-baseline gap-3 mb-4">
                <span className="text-2xl font-black text-slate-900 font-mono tabular-nums">
                  ৳{finalPrice.toLocaleString()}
                </span>
                {originalPrice && (
                  <span className="text-sm text-slate-400 line-through font-mono tabular-nums">
                    ৳{originalPrice.toLocaleString()}
                  </span>
                )}
                <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                  Stock: {product.stock} units
                </span>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed mb-4">
                {product.description}
              </p>

              {/* Quantity selector */}
              <div className="flex items-center gap-3 pt-2">
                <span className="text-xs font-medium text-slate-700">Quantity:</span>
                <div className="flex items-center border border-slate-300 rounded-lg overflow-hidden">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-3 py-1 bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold text-sm cursor-pointer"
                  >
                    -
                  </button>
                  <span className="px-3 py-1 text-xs font-bold text-slate-900 font-mono tabular-nums">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                    className="px-3 py-1 bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold text-sm cursor-pointer"
                  >
                    +
                  </button>
                </div>

                <button
                  onClick={handleShare}
                  className="ml-auto flex items-center gap-1.5 text-xs text-slate-600 hover:text-slate-900 px-2.5 py-1 rounded border border-slate-200 hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Share2 className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Link Copied!' : 'Share Product'}</span>
                </button>
              </div>
            </div>

            {/* Action buttons */}
            <div className="space-y-3 pt-4 border-t border-slate-100">
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => {
                    onAddToCart(product, quantity, displayPrice);
                    onClose();
                  }}
                  className="py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-lg flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>Add to Bag</span>
                </button>

                <button
                  onClick={() => {
                    onBuyNow(product, quantity, displayPrice);
                    onClose();
                  }}
                  className="py-2.5 px-4 bg-[#0066ff] hover:bg-[#0052cc] text-white text-xs font-bold rounded-lg flex items-center justify-center gap-2 shadow-sm transition-colors cursor-pointer"
                >
                  <Zap className="w-4 h-4" />
                  <span>Instant Checkout</span>
                </button>
              </div>

              {/* Trust Badges */}
              <div className="grid grid-cols-3 gap-2 pt-2 text-[11px] text-slate-500">
                <div className="flex items-center gap-1.5">
                  <Truck className="w-3.5 h-3.5 text-[#0066ff]" />
                  <span>Cash on Delivery</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#0066ff]" />
                  <span>100% Genuine</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <RefreshCw className="w-3.5 h-3.5 text-[#0066ff]" />
                  <span>7-Day Return</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

import React from 'react';
import { ShoppingBag, Eye, Zap } from 'lucide-react';
import type { Product } from '../types/index.ts';

interface ProductCardProps {
  product: Product;
  displayPrice?: number; // Custom affiliate price if in mini-store
  isMiniStore?: boolean;
  onOpenDetail: (product: Product) => void;
  onAddToCart: (product: Product, customPrice?: number) => void;
  onQuickBuy: (product: Product, customPrice?: number) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  displayPrice,
  isMiniStore,
  onOpenDetail,
  onAddToCart,
  onQuickBuy,
}) => {
  const finalPrice = displayPrice !== undefined ? displayPrice : product.basePrice;
  const originalPrice = product.originalPrice && product.originalPrice > finalPrice ? product.originalPrice : null;
  const discountPercent = originalPrice ? Math.round(((originalPrice - finalPrice) / originalPrice) * 100) : 0;

  return (
    <div className="group bg-white rounded-xl border border-slate-200/80 hover:border-slate-300 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col overflow-hidden">
      {/* 4:3 Product Image */}
      <div
        onClick={() => onOpenDetail(product)}
        className="relative aspect-[4/3] bg-slate-100 overflow-hidden cursor-pointer"
      >
        <img
          src={product.images[0]}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          referrerPolicy="no-referrer"
          onError={(e) => {
            // Styled SVG fallback container if image load fails
            (e.target as HTMLElement).style.display = 'none';
          }}
        />

        {discountPercent > 0 && (
          <div className="absolute top-2.5 left-2.5 bg-[#0066ff] text-white text-[11px] font-bold px-2 py-0.5 rounded shadow-sm">
            {discountPercent}% OFF
          </div>
        )}

        {isMiniStore && (
          <div className="absolute top-2.5 right-2.5 bg-[#0a192f]/90 text-[#38bdf8] text-[10px] font-bold px-2 py-0.5 rounded backdrop-blur-xs border border-blue-500/20">
            Partner Verified
          </div>
        )}

        {/* Hover quick inspect overlay */}
        <div className="absolute inset-0 bg-slate-900/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
          <span className="bg-white/95 text-slate-800 text-xs font-semibold px-3 py-1.5 rounded-lg shadow-md flex items-center gap-1.5">
            <Eye className="w-3.5 h-3.5" />
            Quick View
          </span>
        </div>
      </div>

      {/* Product Content Details */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          {/* Zero-Pill Unboxed Metadata */}
          <div className="flex items-center gap-1.5 text-xs text-slate-600 mb-1 font-medium">
            <span>{product.category}</span>
            <span aria-hidden="true">·</span>
            <span>{product.sku}</span>
          </div>

          <h3
            onClick={() => onOpenDetail(product)}
            className="text-sm font-semibold text-slate-900 line-clamp-2 hover:text-[#0066ff] cursor-pointer transition-colors leading-snug"
            title={product.name}
          >
            {product.name}
          </h3>
        </div>

        <div className="pt-3 mt-2 border-t border-slate-100">
          {/* Pricing Row */}
          <div className="flex items-baseline gap-2 mb-3">
            <span className="text-base font-bold text-slate-900 font-mono tabular-nums">
              ৳{finalPrice.toLocaleString()}
            </span>
            {originalPrice && (
              <span className="text-xs text-slate-400 line-through font-mono tabular-nums">
                ৳{originalPrice.toLocaleString()}
              </span>
            )}
            <span className="ml-auto text-[11px] font-semibold text-emerald-600">
              {product.stock > 5 ? 'In Stock' : `Only ${product.stock} left`}
            </span>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => onAddToCart(product, displayPrice)}
              className="w-full py-1.5 px-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>Add to Bag</span>
            </button>

            <button
              onClick={() => onQuickBuy(product, displayPrice)}
              className="w-full py-1.5 px-2 bg-[#0066ff] hover:bg-[#0052cc] text-white text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 shadow-sm transition-colors cursor-pointer"
            >
              <Zap className="w-3.5 h-3.5" />
              <span>Buy Now</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

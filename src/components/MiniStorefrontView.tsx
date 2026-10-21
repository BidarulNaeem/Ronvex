import React, { useState, useEffect } from 'react';
import { Store, ShieldCheck, ArrowLeft, Share2, Check, Sparkles, ShoppingBag } from 'lucide-react';
import { api, setStoredAttribution } from '../lib/api.ts';
import { ProductCard } from './ProductCard.tsx';
import type { Product, StorefrontConfig, AffiliateProfile } from '../types/index.ts';

interface MiniStorefrontViewProps {
  slug: string;
  onOpenProductDetail: (product: Product, customPrice?: number) => void;
  onAddToCart: (product: Product, customPrice?: number) => void;
  onQuickBuy: (product: Product, customPrice?: number) => void;
  onBackToCatalog: () => void;
}

export const MiniStorefrontView: React.FC<MiniStorefrontViewProps> = ({
  slug,
  onOpenProductDetail,
  onAddToCart,
  onQuickBuy,
  onBackToCatalog,
}) => {
  const [data, setData] = useState<{
    storefront: StorefrontConfig;
    affiliate: AffiliateProfile;
    productsWithPricing: (Product & { customSellingPrice: number; isStoreFeatured?: boolean })[];
  } | null>(null);

  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    loadStorefront();
  }, [slug]);

  const loadStorefront = async () => {
    try {
      setLoading(true);
      setErrorMsg('');
      const res = await api.getStorefront(slug);
      setData(res);

      // Track click & activate 30-day affiliate attribution
      if (res.affiliate) {
        setStoredAttribution(res.affiliate.id, res.affiliate.slug);
        api.trackClick(res.affiliate.slug);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Storefront not found or unavailable.');
    } finally {
      setLoading(false);
    }
  };

  const handleShareStore = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <div className="w-8 h-8 border-3 border-[#0066ff] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-xs text-slate-500 font-medium">Opening partner storefront...</p>
      </div>
    );
  }

  if (errorMsg || !data) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto">
          <Store className="w-6 h-6" />
        </div>
        <h2 className="text-lg font-bold text-slate-900">Mini-Storefront Unavailable</h2>
        <p className="text-xs text-slate-500">{errorMsg || 'This partner storefront does not exist or has been disabled.'}</p>
        <button
          onClick={onBackToCatalog}
          className="px-4 py-2 bg-[#0066ff] hover:bg-[#0052cc] text-white text-xs font-semibold rounded-lg cursor-pointer"
        >
          Return to RONVEX Main Store
        </button>
      </div>
    );
  }

  const { storefront, affiliate, productsWithPricing } = data;

  return (
    <div className="space-y-8 pb-12">
      {/* Storefront Hero Banner */}
      <div className="bg-[#0a192f] text-white border-b border-slate-800 py-10 px-4 relative overflow-hidden">
        <div className="absolute top-0 right-10 w-80 h-80 bg-[#0066ff]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-3 max-w-2xl">
            <div className="flex items-center gap-2">
              <button
                onClick={onBackToCatalog}
                className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors cursor-pointer mr-2"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>RONVEX Hub</span>
              </button>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#38bdf8] bg-blue-950 px-2 py-0.5 rounded border border-blue-500/30 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-[#38bdf8]" />
                Official RONVEX Partner Store
              </span>
            </div>

            <h1 className="text-3xl font-black tracking-tight text-white">{storefront.storeName}</h1>
            {storefront.tagline && (
              <p className="text-sm font-medium text-[#38bdf8]">{storefront.tagline}</p>
            )}
            <p className="text-xs text-slate-300 leading-relaxed">{storefront.bio}</p>

            <div className="flex items-center gap-4 text-xs text-slate-400 pt-1">
              <span>Curated by <strong>{affiliate.fullName}</strong></span>
              <span>·</span>
              <span className="flex items-center gap-1 text-emerald-400">
                <ShieldCheck className="w-3.5 h-3.5" />
                Direct Fulfillment by RONVEX
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleShareStore}
              className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer border border-white/20"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5" />}
              <span>{copied ? 'Store Link Copied' : 'Share Storefront'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Product Grid */}
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Hand-Picked Selections</h2>
            <p className="text-xs text-slate-500">
              Vetted hardware with full manufacturer warranty and Cash on Delivery.
            </p>
          </div>
          <span className="text-xs font-semibold text-slate-500">
            {productsWithPricing.length} items curated
          </span>
        </div>

        {productsWithPricing.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-xs bg-white rounded-xl border border-slate-200">
            No products currently featured in this storefront.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {productsWithPricing.map((prod) => (
              <ProductCard
                key={prod.id}
                product={prod}
                displayPrice={prod.customSellingPrice}
                isMiniStore={true}
                onOpenDetail={(p) => onOpenProductDetail(p, prod.customSellingPrice)}
                onAddToCart={(p) => onAddToCart(p, prod.customSellingPrice)}
                onQuickBuy={(p) => onQuickBuy(p, prod.customSellingPrice)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

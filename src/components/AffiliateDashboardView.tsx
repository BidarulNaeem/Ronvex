import React, { useState, useEffect } from 'react';
import {
  Store,
  DollarSign,
  MousePointerClick,
  ShoppingBag,
  ExternalLink,
  Copy,
  Check,
  Save,
  AlertCircle,
  Clock,
  CheckCircle2,
  Sliders,
  Sparkles,
} from 'lucide-react';
import { api } from '../lib/api.ts';
import type { Product, StorefrontConfig, AffiliateProfile } from '../types/index.ts';

interface AffiliateDashboardViewProps {
  onNavigateToStore: (slug: string) => void;
}

export const AffiliateDashboardView: React.FC<AffiliateDashboardViewProps> = ({
  onNavigateToStore,
}) => {
  const [data, setData] = useState<{
    affiliate: AffiliateProfile;
    storefront: StorefrontConfig;
    stats: any;
    recentOrders: any[];
    earningsList: any[];
    clicks: any[];
  } | null>(null);

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingStore, setSavingStore] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [copiedLink, setCopiedLink] = useState(false);

  // Storefront form state
  const [storeName, setStoreName] = useState('');
  const [bio, setBio] = useState('');
  const [tagline, setTagline] = useState('');
  const [customPricing, setCustomPricing] = useState<Record<string, { price: number; enabled: boolean }>>({});

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      const [dashRes, prodRes] = await Promise.all([
        api.getAffiliateDashboard(),
        api.getProducts(),
      ]);

      setData(dashRes);
      setProducts(prodRes.products);

      if (dashRes.storefront) {
        setStoreName(dashRes.storefront.storeName || '');
        setBio(dashRes.storefront.bio || '');
        setTagline(dashRes.storefront.tagline || '');

        const pricingMap: Record<string, { price: number; enabled: boolean }> = {};
        // Pre-fill existing customized products
        dashRes.storefront.customProducts.forEach((cp) => {
          pricingMap[cp.productId] = {
            price: cp.customSellingPrice,
            enabled: true,
          };
        });

        // For any products not yet selected, provide sensible defaults within range
        prodRes.products.forEach((p) => {
          if (!pricingMap[p.id]) {
            pricingMap[p.id] = {
              price: p.minPrice + Math.round((p.maxPrice - p.minPrice) * 0.5),
              enabled: false,
            };
          }
        });

        setCustomPricing(pricingMap);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to load affiliate dashboard.');
    } finally {
      setLoading(false);
    }
  };

  const handlePriceChange = (productId: string, newPrice: number) => {
    setCustomPricing((prev) => ({
      ...prev,
      [productId]: {
        ...prev[productId],
        price: newPrice,
      },
    }));
  };

  const handleToggleProduct = (productId: string) => {
    setCustomPricing((prev) => ({
      ...prev,
      [productId]: {
        ...prev[productId],
        enabled: !prev[productId]?.enabled,
      },
    }));
  };

  const handleSaveStorefront = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    // Prepare custom products payload
    const selectedCustomProducts = Object.entries(customPricing)
      .filter(([_, config]) => config.enabled)
      .map(([productId, config]) => {
        const prod = products.find((p) => p.id === productId);
        return {
          productId,
          customSellingPrice: config.price,
          isFeatured: true,
        };
      });

    if (selectedCustomProducts.length === 0) {
      setErrorMsg('Please select at least one product for your mini-storefront.');
      return;
    }

    try {
      setSavingStore(true);
      const res = await api.updateAffiliateStorefront({
        storeName: storeName.trim(),
        bio: bio.trim(),
        tagline: tagline.trim(),
        isPublished: true,
        customProducts: selectedCustomProducts,
      });

      if (res.success) {
        setSuccessMsg('Storefront & custom selling prices updated and published successfully!');
        loadDashboard();
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to update storefront.');
    } finally {
      setSavingStore(false);
    }
  };

  const copyStorefrontUrl = () => {
    if (!data?.affiliate) return;
    const url = `${window.location.origin}/#store-${data.affiliate.slug}`;
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <div className="w-8 h-8 border-3 border-[#0066ff] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-xs text-slate-500 font-medium">Loading your affiliate dashboard...</p>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      {/* Top Banner & Profile Overview */}
      <div className="bg-gradient-to-r from-[#0a192f] to-[#112240] rounded-2xl p-6 text-white border border-slate-700/80 shadow-md flex flex-wrap items-center justify-between gap-6">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#38bdf8] bg-blue-900/60 px-2 py-0.5 rounded border border-blue-500/30">
              Affiliate Partner Portal
            </span>
            <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              Account Active
            </span>
          </div>
          <h1 className="text-2xl font-black tracking-tight">{data.affiliate.storeName}</h1>
          <p className="text-xs text-slate-300">
            Partner: <strong className="text-white">{data.affiliate.fullName}</strong> ({data.affiliate.email}) · Slug:{' '}
            <span className="font-mono text-[#38bdf8]">/store/{data.affiliate.slug}</span>
          </p>
        </div>

        {/* Storefront Link Card */}
        <div className="p-3 bg-white/5 border border-white/10 rounded-xl flex items-center gap-3">
          <div>
            <span className="text-[10px] text-slate-400 block uppercase font-bold">Your Live Storefront</span>
            <span className="text-xs font-mono font-bold text-[#38bdf8] block truncate max-w-[200px]">
              ronvex.com/store/{data.affiliate.slug}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={copyStorefrontUrl}
              className="p-2 rounded-lg bg-blue-600/30 hover:bg-blue-600/50 text-[#38bdf8] transition-colors cursor-pointer"
              title="Copy Store URL"
            >
              {copiedLink ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            </button>
            <button
              onClick={() => onNavigateToStore(data.affiliate.slug)}
              className="p-2 rounded-lg bg-[#0066ff] hover:bg-[#0052cc] text-white transition-colors cursor-pointer"
              title="Open Public Storefront"
            >
              <ExternalLink className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* KPI Stats Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Total Clicks */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold">Storefront Clicks</span>
            <MousePointerClick className="w-4 h-4 text-[#0066ff]" />
          </div>
          <p className="text-2xl font-black text-slate-900 font-mono tabular-nums">
            {data.stats.totalClicks}
          </p>
          <span className="text-[11px] text-slate-400">Total customer visits</span>
        </div>

        {/* Attributed Orders */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold">Attributed Orders</span>
            <ShoppingBag className="w-4 h-4 text-[#0066ff]" />
          </div>
          <p className="text-2xl font-black text-slate-900 font-mono tabular-nums">
            {data.stats.totalOrders}
          </p>
          <span className="text-[11px] text-slate-400">{data.stats.deliveredOrders} delivered</span>
        </div>

        {/* Pending Earnings */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold">Pending Earnings</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-2xl font-black text-amber-600 font-mono tabular-nums">
            ৳{data.stats.pendingEarnings.toLocaleString()}
          </p>
          <span className="text-[11px] text-slate-400">Orders in fulfillment</span>
        </div>

        {/* Confirmed Earnings */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-2xs space-y-1 bg-gradient-to-br from-white to-blue-50/40">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold">Confirmed Earnings</span>
            <DollarSign className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-black text-emerald-600 font-mono tabular-nums">
            ৳{data.stats.confirmedEarnings.toLocaleString()}
          </p>
          <span className="text-[11px] text-emerald-600 font-medium">Eligible for payout</span>
        </div>
      </div>

      {/* Formula Explanation Callout */}
      <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-900 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-[#0066ff] shrink-0" />
          <span>
            <strong>RONVEX Affiliate Profit Rule:</strong> You earn{' '}
            <span className="font-mono bg-white px-1.5 py-0.5 rounded border border-blue-300 font-bold">
              Affiliate Selling Price - Admin Base Price
            </span>{' '}
            for every order successfully marked as Delivered!
          </span>
        </div>
        <span className="text-[11px] text-blue-700 bg-blue-100/70 px-2 py-0.5 rounded font-medium">
          Zero Commission Deductions
        </span>
      </div>

      {/* Storefront Customization & Price Controls */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-6">
        <div className="flex items-center justify-between border-b border-slate-200 pb-4">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Sliders className="w-4 h-4 text-[#0066ff]" />
              <span>Mini-Storefront Customizer & Price Setting</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Select products to showcase in your storefront and set custom selling prices within allowed limits.
            </p>
          </div>

          <button
            onClick={handleSaveStorefront}
            disabled={savingStore}
            className="px-4 py-2 bg-[#0066ff] hover:bg-[#0052cc] text-white text-xs font-bold rounded-lg shadow-sm flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{savingStore ? 'Publishing...' : 'Save & Publish Store'}</span>
          </button>
        </div>

        {successMsg && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-700 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {errorMsg && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSaveStorefront} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Store Name</label>
              <input
                type="text"
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
                placeholder="e.g. Naeem's Tech Haven"
                className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:outline-none focus:border-[#0066ff]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Store Tagline</label>
              <input
                type="text"
                value={tagline}
                onChange={(e) => setTagline(e.target.value)}
                placeholder="e.g. Authentic Gadgets Curated For Creators"
                className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:outline-none focus:border-[#0066ff]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Store URL (Immutable)</label>
              <input
                type="text"
                disabled
                value={`/store/${data.affiliate.slug}`}
                className="w-full text-xs p-2.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-500 font-mono"
              />
            </div>

            <div className="sm:col-span-3">
              <label className="block text-xs font-semibold text-slate-700 mb-1">Storefront Bio / Message</label>
              <input
                type="text"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Welcome message to your visitors..."
                className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:outline-none focus:border-[#0066ff]"
              />
            </div>
          </div>

          {/* Product Price Controls Table */}
          <div>
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">
              Products & Your Custom Selling Prices
            </h3>

            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                  <tr>
                    <th className="p-3 w-12 text-center">Include</th>
                    <th className="p-3">Product</th>
                    <th className="p-3">Admin Base Price</th>
                    <th className="p-3">Allowed Range</th>
                    <th className="p-3">Your Selling Price</th>
                    <th className="p-3 text-right">Your Profit / Order</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {products.map((prod) => {
                    const config = customPricing[prod.id] || { price: prod.minPrice, enabled: false };
                    const profitPerOrder = Math.max(0, config.price - prod.basePrice);

                    return (
                      <tr key={prod.id} className={config.enabled ? 'bg-white' : 'bg-slate-50/50 opacity-60'}>
                        <td className="p-3 text-center">
                          <input
                            type="checkbox"
                            checked={config.enabled}
                            onChange={() => handleToggleProduct(prod.id)}
                            className="w-4 h-4 text-[#0066ff] rounded border-slate-300 cursor-pointer"
                          />
                        </td>
                        <td className="p-3">
                          <div className="flex items-center gap-2.5">
                            <img
                              src={prod.images[0]}
                              alt={prod.name}
                              className="w-10 h-10 object-cover rounded bg-slate-100"
                              referrerPolicy="no-referrer"
                            />
                            <div>
                              <p className="font-semibold text-slate-900">{prod.name}</p>
                              <p className="text-[11px] text-slate-500 font-mono">{prod.sku}</p>
                            </div>
                          </div>
                        </td>
                        <td className="p-3 font-mono font-medium text-slate-600 tabular-nums">
                          ৳{prod.basePrice.toLocaleString()}
                        </td>
                        <td className="p-3 text-slate-500 text-[11px] font-mono tabular-nums">
                          ৳{prod.minPrice.toLocaleString()} - ৳{prod.maxPrice.toLocaleString()}
                        </td>
                        <td className="p-3">
                          <div className="flex items-center gap-1.5 max-w-[160px]">
                            <span className="text-slate-500 font-mono">৳</span>
                            <input
                              type="number"
                              disabled={!config.enabled}
                              min={prod.minPrice}
                              max={prod.maxPrice}
                              step={50}
                              value={config.price}
                              onChange={(e) => handlePriceChange(prod.id, Number(e.target.value))}
                              className="w-full p-1.5 text-xs font-mono font-bold border border-slate-300 rounded focus:outline-none focus:border-[#0066ff] tabular-nums"
                            />
                          </div>
                        </td>
                        <td className="p-3 text-right">
                          <span className="font-mono font-bold text-emerald-600 tabular-nums">
                            +৳{profitPerOrder.toLocaleString()}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </form>
      </div>

      {/* Attributed Orders History Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900">Attributed Orders</h2>
            <p className="text-xs text-slate-500">Orders placed through your personal storefront or referral links</p>
          </div>
          <span className="text-xs font-mono font-bold text-slate-600">{data.recentOrders.length} orders total</span>
        </div>

        {data.recentOrders.length === 0 ? (
          <div className="py-12 text-center text-slate-500 text-xs">
            No orders attributed yet. Share your storefront link to start earning!
          </div>
        ) : (
          <div className="border border-slate-200 rounded-xl overflow-x-auto">
            <table className="w-full text-left text-xs whitespace-nowrap">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                <tr>
                  <th className="p-3">Order #</th>
                  <th className="p-3">Customer</th>
                  <th className="p-3">Items</th>
                  <th className="p-3">Total Amount</th>
                  <th className="p-3">Your Commission</th>
                  <th className="p-3">Delivery Status</th>
                  <th className="p-3">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {data.recentOrders.map((ord: any) => {
                  const affiliateMargin = ord.items.reduce((sum: number, it: any) => {
                    if (it.affiliateId === data.affiliate.id) {
                      return sum + Math.max(0, it.sellingPriceSnapshot - it.basePriceSnapshot) * it.quantity;
                    }
                    return sum;
                  }, 0);

                  return (
                    <tr key={ord.id} className="hover:bg-slate-50">
                      <td className="p-3 font-mono font-bold text-slate-900">{ord.orderNumber}</td>
                      <td className="p-3 font-medium text-slate-800">{ord.customer.fullName}</td>
                      <td className="p-3 text-slate-600">
                        {ord.items.map((i: any) => `${i.productName} (x${i.quantity})`).join(', ')}
                      </td>
                      <td className="p-3 font-mono tabular-nums font-semibold text-slate-900">
                        ৳{ord.totalAmount.toLocaleString()}
                      </td>
                      <td className="p-3 font-mono font-bold text-emerald-600 tabular-nums">
                        ৳{affiliateMargin.toLocaleString()}
                      </td>
                      <td className="p-3">
                        <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                          ord.deliveryStatus === 'delivered' ? 'bg-emerald-100 text-emerald-800' :
                          ord.deliveryStatus === 'cancelled' || ord.deliveryStatus === 'returned' ? 'bg-red-100 text-red-800' :
                          'bg-blue-100 text-blue-800'
                        }`}>
                          {ord.deliveryStatus}
                        </span>
                      </td>
                      <td className="p-3 text-slate-500">
                        {new Date(ord.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

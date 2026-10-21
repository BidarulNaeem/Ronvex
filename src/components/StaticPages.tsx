import React from 'react';
import { ShieldCheck, Truck, RotateCcw, Mail, Phone, MapPin } from 'lucide-react';

interface StaticPageProps {
  page: 'about' | 'contact' | 'privacy' | 'terms' | 'return';
  onBack: () => void;
}

export const StaticPages: React.FC<StaticPageProps> = ({ page, onBack }) => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <button
        onClick={onBack}
        className="text-xs font-semibold text-[#0066ff] hover:underline mb-6 block cursor-pointer"
      >
        ← Back to Catalog
      </button>

      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-8 space-y-6">
        {page === 'about' && (
          <div className="space-y-4">
            <h1 className="text-2xl font-black text-slate-900">About RONVEX</h1>
            <p className="text-xs font-semibold text-[#0066ff] uppercase tracking-wider">
              YOUR BRAND. YOUR VISION. YOUR FUTURE.
            </p>
            <p className="text-xs text-slate-600 leading-relaxed">
              RONVEX is an engineering-first consumer electronics platform designed to eliminate the friction between innovative gadget designers and discerning tech enthusiasts. Combining direct retail with a democratic affiliate mini-store architecture, we empower content creators and entrepreneurs to curate hardware stores without upfront inventory risk.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-slate-100">
              <div className="p-4 bg-slate-50 rounded-xl space-y-1">
                <ShieldCheck className="w-5 h-5 text-[#0066ff]" />
                <h3 className="text-xs font-bold text-slate-900">100% Authentic</h3>
                <p className="text-[11px] text-slate-500">Every SKU undergoes strict quality testing prior to warehouse intake.</p>
              </div>
              <div className="p-4 bg-slate-50 rounded-xl space-y-1">
                <Truck className="w-5 h-5 text-[#0066ff]" />
                <h3 className="text-xs font-bold text-slate-900">Express Fulfillment</h3>
                <p className="text-[11px] text-slate-500">Fast nationwide courier delivery with doorstep Cash on Delivery.</p>
              </div>
              <div className="p-4 bg-slate-50 rounded-xl space-y-1">
                <RotateCcw className="w-5 h-5 text-[#0066ff]" />
                <h3 className="text-xs font-bold text-slate-900">7-Day Guarantee</h3>
                <p className="text-[11px] text-slate-500">Transparent return and replacement policy on verified factory faults.</p>
              </div>
            </div>
          </div>
        )}

        {page === 'contact' && (
          <div className="space-y-4">
            <h1 className="text-2xl font-black text-slate-900">Contact RONVEX Headquarters</h1>
            <p className="text-xs text-slate-600">
              Our support team and affiliate specialists are available Saturday through Thursday, 9 AM – 8 PM.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-slate-100 text-xs">
              <div className="p-4 bg-slate-50 rounded-xl space-y-1">
                <Mail className="w-4 h-4 text-[#0066ff]" />
                <h3 className="font-bold text-slate-900">Email Support</h3>
                <p className="text-slate-600 font-mono">support@ronvex.com</p>
              </div>
              <div className="p-4 bg-slate-50 rounded-xl space-y-1">
                <Phone className="w-4 h-4 text-[#0066ff]" />
                <h3 className="font-bold text-slate-900">Customer Helpline</h3>
                <p className="text-slate-600 font-mono">+880 9610-RONVEX</p>
              </div>
              <div className="p-4 bg-slate-50 rounded-xl space-y-1">
                <MapPin className="w-4 h-4 text-[#0066ff]" />
                <h3 className="font-bold text-slate-900">Head Office</h3>
                <p className="text-slate-600">Gulshan 2, Dhaka 1212, Bangladesh</p>
              </div>
            </div>
          </div>
        )}

        {page === 'privacy' && (
          <div className="space-y-4 text-xs text-slate-600 leading-relaxed">
            <h1 className="text-2xl font-black text-slate-900">Privacy Policy</h1>
            <p>
              At RONVEX, we respect the confidentiality of your personal and transaction information. We never sell, lease, or monetize customer or affiliate credentials.
            </p>
            <h3 className="text-sm font-bold text-slate-800">1. Information We Collect</h3>
            <p>
              We collect customer name, shipping address, mobile contact, and order notes strictly to fulfill orders and verify deliveries. For affiliate applicants, we store verification details and payout credentials.
            </p>
            <h3 className="text-sm font-bold text-slate-800">2. Affiliate Attribution Cookies</h3>
            <p>
              When a visitor navigates through an authorized affiliate link, a first-party attribution token is stored for 30 days to ensure proper commission crediting upon delivery.
            </p>
          </div>
        )}

        {page === 'terms' && (
          <div className="space-y-4 text-xs text-slate-600 leading-relaxed">
            <h1 className="text-2xl font-black text-slate-900">Terms of Service & Affiliate Rules</h1>
            <h3 className="text-sm font-bold text-slate-800">1. Selling Price Boundaries</h3>
            <p>
              Affiliates must set their selling prices strictly within the admin-defined [MinPrice, MaxPrice] window. Any attempts to manipulate price fields via browser tampering are rejected on the server.
            </p>
            <h3 className="text-sm font-bold text-slate-800">2. Earnings Accrual & Reversals</h3>
            <p>
              Affiliate gross earnings (Selling Price - Base Price) are eligible only upon verified delivery. Any returned or cancelled orders will have their earnings reversed in the financial audit log.
            </p>
          </div>
        )}

        {page === 'return' && (
          <div className="space-y-4 text-xs text-slate-600 leading-relaxed">
            <h1 className="text-2xl font-black text-slate-900">Return & Replacement Policy</h1>
            <p>
              Customers may request a replacement or return within 7 calendar days of delivery if the product has a factory defect, transit damage, or mismatch with the specifications shown on the storefront.
            </p>
            <p>
              To initiate a return, contact support@ronvex.com with your order number (e.g. RNV-2026-XXXXX) and a clear photo/video of the issue.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

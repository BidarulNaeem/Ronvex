import React from 'react';
import { ShieldCheck, Truck, Headphones, Store } from 'lucide-react';

interface FooterProps {
  onNavigate: (view: string, param?: string) => void;
  onOpenAffiliateModal: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate, onOpenAffiliateModal }) => {
  return (
    <footer className="bg-[#071324] text-slate-300 border-t border-slate-800 text-xs mt-16">
      {/* Trust banner */}
      <div className="border-b border-slate-800/80 py-8 px-4">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-600/10 text-[#38bdf8] flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-white font-bold text-xs">Authentic Hardware</h4>
              <p className="text-[11px] text-slate-400">Directly sourced, warranty covered</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-600/10 text-[#38bdf8] flex items-center justify-center shrink-0">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-white font-bold text-xs">Cash on Delivery</h4>
              <p className="text-[11px] text-slate-400">Doorstep courier payment</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-600/10 text-[#38bdf8] flex items-center justify-center shrink-0">
              <Store className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-white font-bold text-xs">Affiliate Mini-Stores</h4>
              <p className="text-[11px] text-slate-400">Custom prices & instant payouts</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-600/10 text-[#38bdf8] flex items-center justify-center shrink-0">
              <Headphones className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-white font-bold text-xs">Dedicated Support</h4>
              <p className="text-[11px] text-slate-400">support@ronvex.com</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main footer navigation */}
      <div className="max-w-7xl mx-auto px-4 py-10 grid grid-cols-1 md:grid-cols-4 gap-8">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded bg-[#0066ff] flex items-center justify-center text-white font-bold text-sm">
              R
            </div>
            <span className="text-base font-black text-white tracking-tight">RONVEX</span>
          </div>
          <p className="text-xs text-[#38bdf8] font-semibold">YOUR BRAND. YOUR VISION. YOUR FUTURE.</p>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            Leading consumer electronics direct shopping and decentralized creator micro-store platform.
          </p>
        </div>

        <div>
          <h4 className="text-white font-bold mb-3 uppercase tracking-wider text-[11px]">Quick Links</h4>
          <ul className="space-y-2">
            <li>
              <button onClick={() => onNavigate('home')} className="hover:text-white cursor-pointer transition-colors">
                Browse Products
              </button>
            </li>
            <li>
              <button onClick={() => onNavigate('track-order')} className="hover:text-white cursor-pointer transition-colors">
                Track Live Order
              </button>
            </li>
            <li>
              <button onClick={() => onNavigate('storefront', 'naeem')} className="hover:text-[#38bdf8] cursor-pointer transition-colors">
                Partner Store: Naeem's Haven
              </button>
            </li>
            <li>
              <button onClick={onOpenAffiliateModal} className="text-[#38bdf8] hover:underline cursor-pointer">
                Apply for Affiliate Account
              </button>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="text-white font-bold mb-3 uppercase tracking-wider text-[11px]">Policies & Legal</h4>
          <ul className="space-y-2">
            <li>
              <button onClick={() => onNavigate('static', 'about')} className="hover:text-white cursor-pointer transition-colors">
                About RONVEX
              </button>
            </li>
            <li>
              <button onClick={() => onNavigate('static', 'contact')} className="hover:text-white cursor-pointer transition-colors">
                Contact & Support
              </button>
            </li>
            <li>
              <button onClick={() => onNavigate('static', 'privacy')} className="hover:text-white cursor-pointer transition-colors">
                Privacy Policy
              </button>
            </li>
            <li>
              <button onClick={() => onNavigate('static', 'terms')} className="hover:text-white cursor-pointer transition-colors">
                Terms of Service
              </button>
            </li>
            <li>
              <button onClick={() => onNavigate('static', 'return')} className="hover:text-white cursor-pointer transition-colors">
                Return & Refund Policy
              </button>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="text-white font-bold mb-3 uppercase tracking-wider text-[11px]">Creator Program</h4>
          <p className="text-[11px] text-slate-400 mb-3 leading-relaxed">
            Earn gross profit on every order with your personal branded URL. No inventory investment required.
          </p>
          <button
            onClick={onOpenAffiliateModal}
            className="w-full py-2 bg-[#0066ff] hover:bg-[#0052cc] text-white text-xs font-bold rounded-lg transition-colors cursor-pointer"
          >
            Launch Your Storefront
          </button>
        </div>
      </div>

      {/* Copyright */}
      <div className="border-t border-slate-800/80 py-4 px-4 text-center text-slate-500 text-[11px]">
        © 2026 RONVEX Inc. All rights reserved. Precision engineered e-commerce & affiliate architecture.
      </div>
    </footer>
  );
};

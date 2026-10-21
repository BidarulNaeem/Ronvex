import React from 'react';
import { ArrowRight, Sparkles, Store, ShieldCheck } from 'lucide-react';

interface HeroBannerProps {
  onExplore: () => void;
  onOpenAffiliateModal: () => void;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({ onExplore, onOpenAffiliateModal }) => {
  return (
    <div className="relative overflow-hidden bg-[#071324] border-b border-slate-800">
      {/* Background ambient lighting */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-[#0066ff]/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 py-8 md:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Text Column */}
          <div className="lg:col-span-7 space-y-5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-950/60 border border-blue-500/30 text-xs font-medium text-[#38bdf8]">
              <Sparkles className="w-3.5 h-3.5 text-[#38bdf8]" />
              <span>Next-Gen E-Commerce & Creator Micro-Store Platform</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-[1.15]">
              YOUR BRAND. <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#38bdf8] to-[#0066ff]">
                YOUR VISION.
              </span>{' '}
              <br />
              YOUR FUTURE.
            </h1>

            <p className="text-slate-300 text-sm sm:text-base max-w-xl leading-relaxed">
              Shop authentic high-grade electronics directly from RONVEX, or launch your own branded affiliate mini-store in 60 seconds with custom pricing, zero inventory hassle, and automatic payouts.
            </p>

            <div className="flex flex-wrap gap-3 pt-2">
              <button
                onClick={onExplore}
                className="px-5 py-2.5 bg-[#0066ff] hover:bg-[#0052cc] text-white text-xs sm:text-sm font-semibold rounded-lg shadow-lg shadow-blue-500/25 flex items-center gap-2 transition-all cursor-pointer"
              >
                <span>Shop New Releases</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={onOpenAffiliateModal}
                className="px-5 py-2.5 bg-[#112240] hover:bg-[#1a335a] text-[#38bdf8] border border-blue-500/30 text-xs sm:text-sm font-semibold rounded-lg flex items-center gap-2 transition-all cursor-pointer"
              >
                <Store className="w-4 h-4" />
                <span>Become an Affiliate</span>
              </button>
            </div>

            {/* Micro value props strip */}
            <div className="pt-4 grid grid-cols-3 gap-4 border-t border-slate-800/80 text-xs text-slate-300">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#38bdf8] shrink-0" />
                <span>100% Genuine Tech</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
                <span>Cash on Delivery</span>
              </div>
              <div className="flex items-center gap-2">
                <Store className="w-4 h-4 text-[#38bdf8] shrink-0" />
                <span>Custom Mini-Stores</span>
              </div>
            </div>
          </div>

          {/* Right Showcase Image Column */}
          <div className="lg:col-span-5 relative">
            <div className="relative rounded-2xl overflow-hidden border border-slate-700/80 shadow-2xl bg-[#0c1a30] aspect-[16/10] group">
              <img
                src="/src/assets/images/ronvex_hero_showcase_1792559419089.jpg"
                alt="RONVEX Electronics Showcase"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#071324]/80 via-transparent to-transparent pointer-events-none" />
              
              <div className="absolute bottom-3 left-3 right-3 p-3 bg-[#0a192f]/90 backdrop-blur-md rounded-xl border border-slate-700/60 flex items-center justify-between text-xs">
                <div>
                  <span className="text-[10px] uppercase font-bold text-[#38bdf8] tracking-wider block">Official Flagship Line</span>
                  <span className="text-white font-semibold">Precision Audio & Wearables 2026</span>
                </div>
                <span className="font-mono text-emerald-400 font-bold">In Stock</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

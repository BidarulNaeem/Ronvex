import React, { useState } from 'react';
import { ShoppingBag, Search, User, ShieldCheck, Store, Truck, LogOut, ChevronDown } from 'lucide-react';
import type { AuthSession } from '../types/index.ts';

interface NavbarProps {
  currentView: string;
  onNavigate: (view: string, param?: string) => void;
  cartCount: number;
  onOpenCart: () => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  session: AuthSession | null;
  onOpenAuth: () => void;
  onLogout: () => void;
  onOpenAffiliateModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  onNavigate,
  cartCount,
  onOpenCart,
  searchQuery,
  onSearchChange,
  session,
  onOpenAuth,
  onLogout,
  onOpenAffiliateModal,
}) => {
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-[#0a192f] text-white shadow-md border-b border-[#1e293b]">
      {/* Top micro-bar */}
      <div className="bg-[#071324] text-xs text-slate-400 border-b border-slate-800/80 px-4 py-1.5">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-[#38bdf8] font-semibold">RONVEX</span>
            <span aria-hidden="true">·</span>
            <span>YOUR BRAND. YOUR VISION. YOUR FUTURE.</span>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => onNavigate('track-order')}
              className="hover:text-white transition-colors cursor-pointer"
            >
              Track Order
            </button>
            <span aria-hidden="true">·</span>
            <button
              onClick={() => onNavigate('storefront', 'naeem')}
              className="text-[#38bdf8] hover:underline cursor-pointer"
            >
              Featured Store: Naeem's Haven
            </button>
          </div>
        </div>
      </div>

      {/* Main navigation row */}
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-6">
        {/* Zone 1: Brand Wordmark */}
        <button
          onClick={() => onNavigate('home')}
          className="flex items-center gap-2.5 text-left group cursor-pointer shrink-0"
        >
          <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-[#0066ff] to-[#38bdf8] flex items-center justify-center font-bold text-lg text-white shadow-lg shadow-blue-500/20 group-hover:scale-105 transition-transform">
            R
          </div>
          <div>
            <span className="text-xl font-extrabold tracking-tight text-white block leading-none">
              RONVEX
            </span>
            <span className="text-[10px] uppercase tracking-widest text-[#38bdf8] font-semibold block mt-0.5">
              Direct & Affiliates
            </span>
          </div>
        </button>

        {/* Search bar (Daraz style efficiency) */}
        <div className="flex-1 max-w-xl hidden md:block">
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search gadgets, ANC audio, titanium smartwatches, power..."
              className="w-full bg-[#112240] text-slate-100 placeholder-slate-400 text-sm rounded-lg pl-10 pr-4 py-2 border border-slate-700/80 focus:outline-none focus:border-[#0066ff] focus:ring-1 focus:ring-[#0066ff] transition-all"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5" />
          </div>
        </div>

        {/* Zone 2: Navigation Links */}
        <nav className="hidden lg:flex items-center gap-5 text-xs font-semibold text-slate-300">
          <button
            onClick={() => onNavigate('home')}
            className={`whitespace-nowrap transition-colors py-1 cursor-pointer ${
              currentView === 'home' ? 'text-white border-b-2 border-[#0066ff]' : 'hover:text-white'
            }`}
          >
            Catalog
          </button>
          <button
            onClick={() => onNavigate('storefront', 'naeem')}
            className={`whitespace-nowrap flex items-center gap-1 transition-colors py-1 cursor-pointer ${
              currentView === 'storefront' ? 'text-[#38bdf8] border-b-2 border-[#38bdf8]' : 'hover:text-[#38bdf8]'
            }`}
          >
            <Store className="w-3.5 h-3.5" />
            Mini-Stores
          </button>
          <button
            onClick={() => onNavigate('track-order')}
            className={`whitespace-nowrap flex items-center gap-1 transition-colors py-1 cursor-pointer ${
              currentView === 'track-order' ? 'text-white border-b-2 border-[#0066ff]' : 'hover:text-white'
            }`}
          >
            <Truck className="w-3.5 h-3.5" />
            Track Order
          </button>
          <button
            onClick={onOpenAffiliateModal}
            className="whitespace-nowrap bg-blue-500/10 text-[#38bdf8] border border-blue-500/30 px-2.5 py-1 rounded hover:bg-blue-500/20 transition-all cursor-pointer font-medium"
          >
            Become an Affiliate
          </button>
        </nav>

        {/* Zone 3: Primary Action & User Status */}
        <div className="flex items-center gap-3 shrink-0">
          {/* Cart Button */}
          <button
            onClick={onOpenCart}
            aria-label="View shopping cart"
            className="relative p-2 text-slate-200 hover:text-white bg-[#112240] hover:bg-[#1e345b] border border-slate-700/60 rounded-lg transition-colors cursor-pointer flex items-center gap-2"
          >
            <ShoppingBag className="w-5 h-5 text-[#38bdf8]" />
            <span className="text-xs font-bold tabular-nums pr-0.5">{cartCount}</span>
            {cartCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-[#0066ff] text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center animate-pulse">
                {cartCount}
              </span>
            )}
          </button>

          {/* User / Portal Dropdown */}
          <div className="relative">
            {session ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 bg-[#112240] hover:bg-[#1a335a] border border-slate-700 px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer"
                >
                  <div className="w-5 h-5 rounded-full bg-[#0066ff] text-white flex items-center justify-center text-[10px] font-bold">
                    {session.user.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="max-w-[90px] truncate">{session.user.name}</span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>

                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-52 bg-[#0c1a30] border border-slate-700 rounded-lg shadow-xl py-1 z-50 text-xs">
                    <div className="px-3 py-2 border-b border-slate-800">
                      <p className="font-semibold text-white">{session.user.name}</p>
                      <p className="text-slate-400 text-[11px] truncate">{session.user.email}</p>
                      <span className="inline-block mt-1 text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-blue-900/60 text-blue-300">
                        {session.role}
                      </span>
                    </div>

                    {session.role === 'admin' && (
                      <button
                        onClick={() => {
                          setUserMenuOpen(false);
                          onNavigate('admin');
                        }}
                        className="w-full text-left px-3 py-2 text-slate-200 hover:bg-[#152744] flex items-center gap-2 cursor-pointer"
                      >
                        <ShieldCheck className="w-4 h-4 text-[#38bdf8]" />
                        Admin Dashboard
                      </button>
                    )}

                    {session.role === 'affiliate' && (
                      <button
                        onClick={() => {
                          setUserMenuOpen(false);
                          onNavigate('affiliate-dashboard');
                        }}
                        className="w-full text-left px-3 py-2 text-slate-200 hover:bg-[#152744] flex items-center gap-2 cursor-pointer"
                      >
                        <Store className="w-4 h-4 text-[#38bdf8]" />
                        Affiliate Dashboard
                      </button>
                    )}

                    <button
                      onClick={() => {
                        setUserMenuOpen(false);
                        onLogout();
                      }}
                      className="w-full text-left px-3 py-2 text-red-400 hover:bg-[#152744] flex items-center gap-2 cursor-pointer border-t border-slate-800"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={onOpenAuth}
                className="flex items-center gap-1.5 bg-[#0066ff] hover:bg-[#0052cc] text-white px-3.5 py-1.5 rounded-lg text-xs font-semibold shadow-md transition-colors cursor-pointer"
              >
                <User className="w-3.5 h-3.5" />
                <span>Portal Sign In</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Mobile search bar */}
      <div className="p-3 bg-[#071324] border-t border-slate-800 md:hidden">
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search audio, smartwatches, keyboards..."
            className="w-full bg-[#112240] text-slate-100 placeholder-slate-400 text-xs rounded-lg pl-9 pr-3 py-2 border border-slate-700/80 focus:outline-none focus:border-[#0066ff]"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
        </div>
      </div>
    </header>
  );
};

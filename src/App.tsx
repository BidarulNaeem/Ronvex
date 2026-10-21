import React, { useState, useEffect } from 'react';
import {
  api,
  getAuthSession,
  setAuthSession,
  getStoredCart,
  saveStoredCart,
  setStoredAttribution,
  type CartItem,
} from './lib/api.ts';
import type { Product, Order, AuthSession } from './types/index.ts';

// Components
import { Navbar } from './components/Navbar.tsx';
import { HeroBanner } from './components/HeroBanner.tsx';
import { CategoryChips } from './components/CategoryChips.tsx';
import { ProductCard } from './components/ProductCard.tsx';
import { ProductModal } from './components/ProductModal.tsx';
import { CartDrawer } from './components/CartDrawer.tsx';
import { CheckoutModal } from './components/CheckoutModal.tsx';
import { OrderConfirmationModal } from './components/OrderConfirmationModal.tsx';
import { OrderTrackingView } from './components/OrderTrackingView.tsx';
import { AffiliateApplyModal } from './components/AffiliateApplyModal.tsx';
import { AuthModal } from './components/AuthModal.tsx';
import { AffiliateDashboardView } from './components/AffiliateDashboardView.tsx';
import { AdminDashboardView } from './components/AdminDashboardView.tsx';
import { MiniStorefrontView } from './components/MiniStorefrontView.tsx';
import { StaticPages } from './components/StaticPages.tsx';
import { Footer } from './components/Footer.tsx';

export default function App() {
  const [currentView, setCurrentView] = useState<string>('home');
  const [viewParam, setViewParam] = useState<string>('');
  const [staticPage, setStaticPage] = useState<'about' | 'contact' | 'privacy' | 'terms' | 'return'>('about');

  // Products & Categories
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<{ id: string; name: string; slug: string; icon: string }[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [loadingProducts, setLoadingProducts] = useState<boolean>(true);

  // Cart
  const [cart, setCart] = useState<CartItem[]>(getStoredCart());
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);

  // Modals
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedProductCustomPrice, setSelectedProductCustomPrice] = useState<number | undefined>(undefined);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState<boolean>(false);
  const [confirmedOrder, setConfirmedOrder] = useState<Order | null>(null);
  const [isAuthOpen, setIsAuthOpen] = useState<boolean>(false);
  const [isApplyOpen, setIsApplyOpen] = useState<boolean>(false);

  // Authentication
  const [session, setSession] = useState<AuthSession | null>(getAuthSession());

  // URL hash / ref param initialization
  useEffect(() => {
    loadCatalog();

    // Check ref or product query params
    const params = new URLSearchParams(window.location.search);
    const ref = params.get('ref');
    if (ref) {
      setStoredAttribution(ref, ref);
      api.trackClick(ref);
    }

    // Check hash for direct storefront navigation (e.g. #store-naeem)
    const hash = window.location.hash;
    if (hash.startsWith('#store-')) {
      const slug = hash.replace('#store-', '');
      setCurrentView('storefront');
      setViewParam(slug);
    }
  }, []);

  // Save cart changes
  useEffect(() => {
    saveStoredCart(cart);
  }, [cart]);

  const loadCatalog = async () => {
    try {
      setLoadingProducts(true);
      const [prodRes, catRes] = await Promise.all([
        api.getProducts(),
        api.getCategories(),
      ]);
      setProducts(prodRes.products);
      setCategories(catRes.categories);

      // Check if URL specified a product slug
      const params = new URLSearchParams(window.location.search);
      const prodSlug = params.get('product');
      if (prodSlug) {
        const matched = prodRes.products.find((p) => p.slug === prodSlug);
        if (matched) setSelectedProduct(matched);
      }
    } catch (err) {
      console.error('Failed loading catalog:', err);
    } finally {
      setLoadingProducts(false);
    }
  };

  const handleNavigate = (view: string, param: string = '') => {
    setCurrentView(view);
    setViewParam(param);
    if (view === 'static') {
      setStaticPage(param as any);
    }
    if (view === 'storefront') {
      window.location.hash = `#store-${param}`;
    } else {
      if (window.location.hash.startsWith('#store-')) {
        history.replaceState(null, '', window.location.pathname + window.location.search);
      }
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Cart operations
  const handleAddToCart = (product: Product, quantity = 1, customPrice?: number) => {
    setCart((prev) => {
      const existingIdx = prev.findIndex((item) => item.product.id === product.id);
      if (existingIdx > -1) {
        const copy = [...prev];
        copy[existingIdx].quantity += quantity;
        if (customPrice !== undefined) copy[existingIdx].customSellingPrice = customPrice;
        return copy;
      }
      return [...prev, { product, quantity, customSellingPrice: customPrice }];
    });
    setIsCartOpen(true);
  };

  const handleUpdateCartQuantity = (productId: string, delta: number) => {
    setCart((prev) => {
      return prev
        .map((it) => {
          if (it.product.id === productId) {
            const nextQty = it.quantity + delta;
            return nextQty > 0 ? { ...it, quantity: nextQty } : null;
          }
          return it;
        })
        .filter(Boolean) as CartItem[];
    });
  };

  const handleRemoveFromCart = (productId: string) => {
    setCart((prev) => prev.filter((it) => it.product.id !== productId));
  };

  const handleQuickBuy = (product: Product, customPrice?: number) => {
    handleAddToCart(product, 1, customPrice);
    setIsCartOpen(false);
    setIsCheckoutOpen(true);
  };

  const handleOrderSuccess = (order: Order) => {
    setCart([]);
    setIsCheckoutOpen(false);
    setConfirmedOrder(order);
  };

  const handleLogout = () => {
    api.logout();
    setSession(null);
    if (currentView === 'admin' || currentView === 'affiliate-dashboard') {
      setCurrentView('home');
    }
  };

  // Filter products by category and search
  const filteredProducts = products.filter((p) => {
    const matchCategory =
      selectedCategory === 'all' || p.category.toLowerCase() === selectedCategory.toLowerCase();
    const matchQuery =
      !searchQuery.trim() ||
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCategory && matchQuery;
  });

  const cartTotalItems = cart.reduce((sum, it) => sum + it.quantity, 0);

  return (
    <div className="min-h-screen flex flex-col bg-[#f8fafc] text-[#0f172a]">
      {/* Navbar */}
      <Navbar
        currentView={currentView}
        onNavigate={handleNavigate}
        cartCount={cartTotalItems}
        onOpenCart={() => setIsCartOpen(true)}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        session={session}
        onOpenAuth={() => setIsAuthOpen(true)}
        onLogout={handleLogout}
        onOpenAffiliateModal={() => setIsApplyOpen(true)}
      />

      {/* Main View Router */}
      <main className="flex-1">
        {/* VIEW 1: HOME CATALOG */}
        {currentView === 'home' && (
          <div className="space-y-6">
            {/* Hero Showcase Banner */}
            <HeroBanner
              onExplore={() => {
                const el = document.getElementById('catalog-grid');
                el?.scrollIntoView({ behavior: 'smooth' });
              }}
              onOpenAffiliateModal={() => setIsApplyOpen(true)}
            />

            {/* Category horizontal filters */}
            <CategoryChips
              categories={categories}
              selectedCategory={selectedCategory}
              onSelectCategory={setSelectedCategory}
            />

            {/* Product Grid Section (Daraz inspired compact layout) */}
            <div id="catalog-grid" className="max-w-7xl mx-auto px-4 py-4 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <div>
                  <h2 className="text-lg font-bold text-slate-900 tracking-tight">
                    {selectedCategory === 'all' ? 'Featured Hardware & Latest Arrivals' : selectedCategory}
                  </h2>
                  <p className="text-xs text-slate-500">
                    Official warehouse stock with Cash on Delivery nationwide
                  </p>
                </div>
                <span className="text-xs font-semibold text-slate-500">
                  Showing {filteredProducts.length} items
                </span>
              </div>

              {loadingProducts ? (
                <div className="py-16 text-center">
                  <div className="w-8 h-8 border-3 border-[#0066ff] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                  <p className="text-xs text-slate-500">Loading catalog items...</p>
                </div>
              ) : filteredProducts.length === 0 ? (
                <div className="p-12 text-center bg-white rounded-xl border border-slate-200 space-y-3">
                  <p className="text-sm font-semibold text-slate-800">No products found matching your filter.</p>
                  <button
                    onClick={() => {
                      setSelectedCategory('all');
                      setSearchQuery('');
                    }}
                    className="text-xs font-bold text-[#0066ff] hover:underline cursor-pointer"
                  >
                    Reset Filters
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {filteredProducts.map((prod) => (
                    <ProductCard
                      key={prod.id}
                      product={prod}
                      onOpenDetail={(p) => {
                        setSelectedProduct(p);
                        setSelectedProductCustomPrice(undefined);
                      }}
                      onAddToCart={(p) => handleAddToCart(p, 1)}
                      onQuickBuy={(p) => handleQuickBuy(p)}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* VIEW 2: MINI STOREFRONT */}
        {currentView === 'storefront' && (
          <MiniStorefrontView
            slug={viewParam || 'naeem'}
            onOpenProductDetail={(p, customPrice) => {
              setSelectedProduct(p);
              setSelectedProductCustomPrice(customPrice);
            }}
            onAddToCart={(p, customPrice) => handleAddToCart(p, 1, customPrice)}
            onQuickBuy={(p, customPrice) => handleQuickBuy(p, customPrice)}
            onBackToCatalog={() => handleNavigate('home')}
          />
        )}

        {/* VIEW 3: TRACK ORDER */}
        {currentView === 'track-order' && (
          <OrderTrackingView
            initialOrderNumber={viewParam}
            onBack={() => handleNavigate('home')}
          />
        )}

        {/* VIEW 4: AFFILIATE DASHBOARD (Protected) */}
        {currentView === 'affiliate-dashboard' && (
          session?.role === 'affiliate' ? (
            <AffiliateDashboardView
              onNavigateToStore={(slug) => handleNavigate('storefront', slug)}
            />
          ) : (
            <div className="max-w-md mx-auto px-4 py-20 text-center space-y-4">
              <h2 className="text-lg font-bold text-slate-900">Affiliate Portal Access Required</h2>
              <p className="text-xs text-slate-500">
                Please sign in with your approved affiliate partner account to access your earnings dashboard.
              </p>
              <button
                onClick={() => setIsAuthOpen(true)}
                className="px-5 py-2.5 bg-[#0066ff] text-white text-xs font-bold rounded-lg cursor-pointer"
              >
                Sign In to Affiliate Portal
              </button>
            </div>
          )
        )}

        {/* VIEW 5: ADMIN DASHBOARD (Protected) */}
        {currentView === 'admin' && (
          session?.role === 'admin' ? (
            <AdminDashboardView onBackToStore={() => handleNavigate('home')} />
          ) : (
            <div className="max-w-md mx-auto px-4 py-20 text-center space-y-4">
              <h2 className="text-lg font-bold text-slate-900">Administrator Credentials Required</h2>
              <p className="text-xs text-slate-500">
                You must be authenticated as an authorized administrator to access platform management.
              </p>
              <button
                onClick={() => setIsAuthOpen(true)}
                className="px-5 py-2.5 bg-[#0066ff] text-white text-xs font-bold rounded-lg cursor-pointer"
              >
                Admin Sign In
              </button>
            </div>
          )
        )}

        {/* VIEW 6: STATIC PAGES */}
        {currentView === 'static' && (
          <StaticPages page={staticPage} onBack={() => handleNavigate('home')} />
        )}
      </main>

      {/* Footer */}
      <Footer
        onNavigate={handleNavigate}
        onOpenAffiliateModal={() => setIsApplyOpen(true)}
      />

      {/* MODALS */}
      {/* 1. Product Detail Modal */}
      <ProductModal
        product={selectedProduct}
        displayPrice={selectedProductCustomPrice}
        affiliateId={session?.role === 'affiliate' ? session.user.slug : null}
        onClose={() => setSelectedProduct(null)}
        onAddToCart={(p, qty, customPrice) => handleAddToCart(p, qty, customPrice)}
        onBuyNow={(p, qty, customPrice) => {
          handleAddToCart(p, qty, customPrice);
          setIsCheckoutOpen(true);
        }}
      />

      {/* 2. Cart Slideover Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cart}
        onUpdateQuantity={handleUpdateCartQuantity}
        onRemoveItem={handleRemoveFromCart}
        onProceedCheckout={() => setIsCheckoutOpen(true)}
      />

      {/* 3. Checkout Modal */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        items={cart}
        onOrderSuccess={handleOrderSuccess}
      />

      {/* 4. Order Confirmation Modal */}
      <OrderConfirmationModal
        order={confirmedOrder}
        onClose={() => setConfirmedOrder(null)}
        onTrackOrder={(orderNumber) => {
          setConfirmedOrder(null);
          handleNavigate('track-order', orderNumber);
        }}
      />

      {/* 5. Affiliate Registration Application Modal */}
      <AffiliateApplyModal
        isOpen={isApplyOpen}
        onClose={() => setIsApplyOpen(false)}
        onSuccess={() => {}}
      />

      {/* 6. Auth Modal */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onAuthSuccess={(newSession) => {
          setSession(newSession);
          if (newSession.role === 'admin') {
            setCurrentView('admin');
          } else if (newSession.role === 'affiliate') {
            setCurrentView('affiliate-dashboard');
          }
        }}
        onOpenApply={() => setIsApplyOpen(true)}
      />
    </div>
  );
}

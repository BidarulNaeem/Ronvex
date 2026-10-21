import type {
  Product,
  Order,
  StorefrontConfig,
  AffiliateProfile,
  AuthSession,
  DeliveryStatus,
  PayoutRequest,
  SavedPayoutMethod,
  FinancialLedgerEntry,
  PayoutSettings,
  AffiliateFinancials,
  PayoutMethodType,
  PayoutAccountDetails,
} from '../types/index.ts';

const TOKEN_KEY = 'ronvex_auth_session';
const ATTRIBUTION_KEY = 'ronvex_affiliate_attribution';
const CART_KEY = 'ronvex_cart';

export interface CartItem {
  product: Product;
  quantity: number;
  customSellingPrice?: number; // From affiliate mini-store
  affiliateId?: string | null;
}

// Session Helpers
export function getAuthSession(): AuthSession | null {
  try {
    const raw = localStorage.getItem(TOKEN_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function setAuthSession(session: AuthSession | null) {
  if (session) {
    localStorage.setItem(TOKEN_KEY, JSON.stringify(session));
  } else {
    localStorage.removeItem(TOKEN_KEY);
  }
}

// Affiliate Attribution
export interface AttributionData {
  affiliateId: string;
  affiliateSlug: string;
  timestamp: number;
}

export function getStoredAttribution(): AttributionData | null {
  try {
    const raw = localStorage.getItem(ATTRIBUTION_KEY);
    if (!raw) return null;
    const data: AttributionData = JSON.parse(raw);
    // 30-day attribution window
    const THIRTY_DAYS = 30 * 24 * 60 * 60 * 1000;
    if (Date.now() - data.timestamp > THIRTY_DAYS) {
      localStorage.removeItem(ATTRIBUTION_KEY);
      return null;
    }
    return data;
  } catch {
    return null;
  }
}

export function setStoredAttribution(affiliateId: string, affiliateSlug: string) {
  const data: AttributionData = {
    affiliateId,
    affiliateSlug,
    timestamp: Date.now(),
  };
  localStorage.setItem(ATTRIBUTION_KEY, JSON.stringify(data));
}

// Cart Helpers
export function getStoredCart(): CartItem[] {
  try {
    const raw = localStorage.getItem(CART_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveStoredCart(cart: CartItem[]) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
}

// HTTP API wrapper
async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const session = getAuthSession();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (session?.token) {
    headers['Authorization'] = `Bearer ${session.token}`;
  }

  const res = await fetch(endpoint, {
    ...options,
    headers,
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.error || `Request failed with status ${res.status}`);
  }

  return data as T;
}

export const api = {
  // Auth
  async login(email: string, password: string, role: 'admin' | 'affiliate'): Promise<AuthSession> {
    const data = await request<AuthSession>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password, role }),
    });
    setAuthSession(data);
    return data;
  },

  logout() {
    setAuthSession(null);
  },

  async applyAffiliate(input: {
    fullName: string;
    email: string;
    mobile: string;
    address: string;
    businessDetails?: string;
    desiredSlug: string;
    password?: string;
  }) {
    return request<{ message: string; application: any }>('/api/affiliate/apply', {
      method: 'POST',
      body: JSON.stringify(input),
    });
  },

  // Products
  async getProducts(params?: { category?: string; query?: string; status?: string }) {
    const qs = new URLSearchParams();
    if (params?.category) qs.set('category', params.category);
    if (params?.query) qs.set('query', params.query);
    if (params?.status) qs.set('status', params.status);
    return request<{ products: Product[] }>(`/api/products?${qs.toString()}`);
  },

  async getProduct(idOrSlug: string) {
    return request<{ product: Product }>(`/api/products/${idOrSlug}`);
  },

  async getCategories() {
    return request<{ categories: { id: string; name: string; slug: string; icon: string }[] }>('/api/categories');
  },

  // Mini-Storefront
  async getStorefront(slug: string) {
    return request<{
      storefront: StorefrontConfig;
      affiliate: AffiliateProfile;
      productsWithPricing: (Product & { customSellingPrice: number; isStoreFeatured?: boolean })[];
    }>(`/api/storefront/${slug}`);
  },

  async trackClick(affiliateIdOrSlug: string, productId?: string) {
    return request<{ success: boolean }>('/api/affiliate/track-click', {
      method: 'POST',
      body: JSON.stringify({
        affiliateIdOrSlug,
        productId,
        referrer: typeof document !== 'undefined' ? document.referrer : '',
      }),
    });
  },

  // Affiliate Dashboard
  async getAffiliateDashboard() {
    return request<{
      affiliate: AffiliateProfile;
      storefront: StorefrontConfig;
      stats: {
        totalClicks: number;
        totalOrders: number;
        deliveredOrders: number;
        pendingEarnings: number;
        confirmedEarnings: number;
        paidEarnings: number;
        totalGrossEarnings: number;
      };
      recentOrders: Order[];
      earningsList: any[];
      clicks: any[];
    }>('/api/affiliate/dashboard');
  },

  async updateAffiliateStorefront(updates: {
    storeName?: string;
    bio?: string;
    tagline?: string;
    themeAccent?: string;
    isPublished?: boolean;
    customProducts?: { productId: string; customSellingPrice: number; isFeatured?: boolean }[];
  }) {
    return request<{ success: boolean; storefront: StorefrontConfig }>('/api/affiliate/storefront', {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  },

  // Orders
  async createOrder(payload: {
    customer: Order['customer'];
    items: { productId: string; quantity: number }[];
    affiliateId?: string | null;
    paymentMethod: Order['paymentMethod'];
  }) {
    return request<{ success: boolean; message: string; order: Order }>('/api/orders', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async lookupOrder(orderNumber: string, contact: string) {
    const qs = new URLSearchParams({ orderNumber, contact });
    return request<{ order: Order }>(`/api/orders/lookup?${qs.toString()}`);
  },

  // Admin API
  async getAdminOverview() {
    return request<{
      totalRevenue: number;
      netStoreRevenue: number;
      affiliateEarningsConfirmed: number;
      totalOrders: number;
      totalProducts: number;
      totalAffiliates: number;
      pendingApplications: number;
      deliveryBreakdown: Record<DeliveryStatus, number>;
      recentOrders: Order[];
    }>('/api/admin/overview');
  },

  async getAdminOrders(status?: string) {
    const qs = status ? `?status=${status}` : '';
    return request<{ orders: Order[] }>(`/api/admin/orders${qs}`);
  },

  async updateDeliveryStatus(orderId: string, status: DeliveryStatus, note: string) {
    return request<{ success: boolean; order: Order }>(`/api/admin/orders/${orderId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status, note }),
    });
  },

  async getAdminAffiliates() {
    return request<{
      applications: any[];
      affiliates: AffiliateProfile[];
    }>('/api/admin/affiliates');
  },

  async reviewApplication(applicationId: string, action: 'approve' | 'reject', reason?: string) {
    return request<{ success: boolean; message: string; affiliate?: AffiliateProfile }>(
      `/api/admin/affiliates/applications/${applicationId}`,
      {
        method: 'PUT',
        body: JSON.stringify({ action, reason }),
      }
    );
  },

  async setAffiliateStatus(affiliateId: string, status: 'active' | 'suspended') {
    return request<{ success: boolean; message: string }>(`/api/admin/affiliates/${affiliateId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  },

  async createProduct(productData: Partial<Product>) {
    return request<{ success: boolean; product: Product }>('/api/admin/products', {
      method: 'POST',
      body: JSON.stringify(productData),
    });
  },

  async updateProduct(id: string, updates: Partial<Product>) {
    return request<{ success: boolean; product: Product }>(`/api/admin/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  },

  async deleteProduct(id: string) {
    return request<{ success: boolean }>(`/api/admin/products/${id}`, {
      method: 'DELETE',
    });
  },

  async getAuditLogs() {
    return request<{ logs: any[] }>('/api/admin/audit-logs');
  },

  async resetSeedData() {
    return request<{ success: boolean; message: string }>('/api/admin/reset-seed', {
      method: 'POST',
    });
  },

  // Category Management
  async createCategory(name: string, icon: string = 'Zap') {
    return request<{ success: boolean; category: any }>('/api/admin/categories', {
      method: 'POST',
      body: JSON.stringify({ name, icon }),
    });
  },

  async updateCategory(id: string, updates: { name?: string; icon?: string }) {
    return request<{ success: boolean; category: any }>(`/api/admin/categories/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  },

  async deleteCategory(id: string) {
    return request<{ success: boolean }>(`/api/admin/categories/${id}`, {
      method: 'DELETE',
    });
  },

  // Image Upload
  async uploadProductImage(dataUrl: string) {
    return request<{ success: boolean; url: string }>('/api/admin/upload-image', {
      method: 'POST',
      body: JSON.stringify({ dataUrl }),
    });
  },

  // Payouts
  async getPayouts(affiliateId?: string) {
    const qs = affiliateId ? `?affiliateId=${affiliateId}` : '';
    return request<{ payouts: any[] }>(`/api/admin/payouts${qs}`);
  },

  async recordPayout(affiliateId: string, amount: number, paymentReference?: string) {
    return request<{ success: boolean; payout: any }>('/api/admin/payouts', {
      method: 'POST',
      body: JSON.stringify({ affiliateId, amount, paymentReference }),
    });
  },

  // Customer Multi-Order History
  async getCustomerOrderHistory(contact: string) {
    const qs = new URLSearchParams({ contact });
    return request<{ orders: Order[] }>(`/api/orders/history?${qs.toString()}`);
  },

  // Mini-Store Individual Product
  async getStorefrontProduct(slug: string, productSlug: string) {
    return request<{
      storefront: StorefrontConfig;
      affiliate: AffiliateProfile;
      product: Product & { customSellingPrice: number; isStoreFeatured?: boolean };
    }>(`/api/storefront/${slug}/${productSlug}`);
  },
};

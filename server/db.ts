import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import type {
  Product,
  Category,
  PayoutRecord,
  AffiliateApplication,
  AffiliateProfile,
  StorefrontConfig,
  Order,
  AffiliateEarning,
  AffiliateClick,
  AuditLog,
  DeliveryStatus,
  PayoutRequest,
  SavedPayoutMethod,
  FinancialLedgerEntry,
  PayoutSettings,
  AffiliateFinancials,
  PayoutMethodType,
  PayoutAccountDetails,
} from '../src/types/index.ts';
import { calculateWednesdayBatch } from '../src/lib/dhakaTime.ts';

export const DATA_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'ronvex_db.json');

export interface DatabaseSchema {
  products: Product[];
  categories: Category[];
  applications: AffiliateApplication[];
  affiliates: AffiliateProfile[];
  storefronts: StorefrontConfig[];
  orders: Order[];
  earnings: AffiliateEarning[];
  payouts: PayoutRecord[];
  payoutRequests: PayoutRequest[];
  savedPayoutMethods: SavedPayoutMethod[];
  financialLedger: FinancialLedgerEntry[];
  payoutSettings: PayoutSettings;
  clicks: AffiliateClick[];
  auditLogs: AuditLog[];
  adminUsers: { id: string; email: string; passwordHash: string; name: string }[];
  affiliateCredentials: { affiliateId: string; passwordHash: string }[];
}

function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password).digest('hex');
}

// Initial seed data
const initialData: DatabaseSchema = {
  products: [
    {
      id: 'prod-001',
      name: 'AeroFlow Pro ANC Wireless Headphones',
      slug: 'aeroflow-pro-anc-headphones',
      description: 'Studio-grade hybrid active noise cancelling headphones with custom 40mm beryllium drivers, 55-hour battery life, and ultra-plush memory foam earcups.',
      images: ['/src/assets/images/ronvex_headphones_1792559433004.jpg'],
      category: 'Audio & Sound',
      sku: 'RNV-AUD-001',
      stock: 45,
      basePrice: 4200,   // Admin cost floor: ৳4,200
      minPrice: 4200,    // Min allowed selling price: ৳4,200
      maxPrice: 5800,    // Max allowed selling price: ৳5,800
      originalPrice: 6200, // Suggested retail MSRP: ৳6,200
      status: 'active',
      featured: true,
      affiliateAvailable: true,
      createdAt: '2026-03-01T10:00:00.000Z',
      updatedAt: '2026-03-01T10:00:00.000Z',
    },
    {
      id: 'prod-002',
      name: 'ChronoPro Titanium Smartwatch',
      slug: 'chronopro-titanium-smartwatch',
      description: 'Aerospace-grade titanium chassis with vivid 1.43-inch AMOLED display, dual-frequency GPS, health sensor suite, and 14-day endurance battery.',
      images: ['/src/assets/images/ronvex_smartwatch_1792559446981.jpg'],
      category: 'Smart Wearables',
      sku: 'RNV-WCH-002',
      stock: 32,
      basePrice: 5500,
      minPrice: 5500,
      maxPrice: 7500,
      originalPrice: 7990,
      status: 'active',
      featured: true,
      affiliateAvailable: true,
      createdAt: '2026-03-02T10:00:00.000Z',
      updatedAt: '2026-03-02T10:00:00.000Z',
    },
    {
      id: 'prod-003',
      name: 'StealthGlide Wireless Mechanical Keyboard',
      slug: 'stealthglide-wireless-mechanical-keyboard',
      description: 'Ultra-low-profile CNC aluminum frame, hot-swappable linear switches, per-key electric blue illumination, and multi-device Bluetooth 5.3 connection.',
      images: ['/src/assets/images/ronvex_keyboard_1792559458949.jpg'],
      category: 'Computer Accessories',
      sku: 'RNV-KBD-003',
      stock: 28,
      basePrice: 3800,
      minPrice: 3800,
      maxPrice: 5200,
      originalPrice: 5600,
      status: 'active',
      featured: true,
      affiliateAvailable: true,
      createdAt: '2026-03-03T10:00:00.000Z',
      updatedAt: '2026-03-03T10:00:00.000Z',
    },
    {
      id: 'prod-004',
      name: 'MagVolt Ultra-Slim 10000mAh Magnetic Power Bank',
      slug: 'magvolt-magnetic-power-bank',
      description: 'Next-generation high-density 10,000mAh battery in a 12mm sleek anodized shell with 15W Qi2 wireless snap-on charging and 30W USB-C PD output.',
      images: ['/src/assets/images/ronvex_powerbank_1792559472764.jpg'],
      category: 'Power & Charging',
      sku: 'RNV-PWR-004',
      stock: 60,
      basePrice: 1800,
      minPrice: 1800,
      maxPrice: 2800,
      originalPrice: 3100,
      status: 'active',
      featured: true,
      affiliateAvailable: true,
      createdAt: '2026-03-04T10:00:00.000Z',
      updatedAt: '2026-03-04T10:00:00.000Z',
    },
  ],
  categories: [
    { id: 'cat-1', name: 'Audio & Sound', slug: 'audio-sound', icon: 'Headphones' },
    { id: 'cat-2', name: 'Smart Wearables', slug: 'smart-wearables', icon: 'Watch' },
    { id: 'cat-3', name: 'Computer Accessories', slug: 'computer-accessories', icon: 'Keyboard' },
    { id: 'cat-4', name: 'Power & Charging', slug: 'power-charging', icon: 'Zap' },
    { id: 'cat-5', name: 'Smart Home', slug: 'smart-home', icon: 'Home' },
  ],
  applications: [
    {
      id: 'app-naeem',
      fullName: 'Naeem Ahmed',
      email: 'affiliate@ronvex.com',
      mobile: '+8801712345678',
      address: 'Dhanmondi 27, Dhaka 1209, Bangladesh',
      businessDetails: 'Tech content creator & gadget reviewer on YouTube (120k subscribers).',
      desiredSlug: 'naeem',
      status: 'approved',
      appliedAt: '2026-03-01T08:00:00.000Z',
      reviewedAt: '2026-03-01T09:00:00.000Z',
      reviewedBy: 'Admin System',
    },
    {
      id: 'app-tariq',
      fullName: 'Tariqul Islam',
      email: 'tariqul@techgadgets.bd',
      mobile: '+8801819876543',
      address: 'Agrabad C/A, Chattogram, Bangladesh',
      businessDetails: 'Local electronics retail consultant and influencer.',
      desiredSlug: 'tariq-tech',
      status: 'pending',
      appliedAt: '2026-03-10T14:20:00.000Z',
    },
  ],
  affiliates: [
    {
      id: 'aff-naeem-01',
      applicationId: 'app-naeem',
      fullName: 'Naeem Ahmed',
      email: 'affiliate@ronvex.com',
      mobile: '+8801712345678',
      slug: 'naeem',
      storeName: "Naeem's Tech Haven",
      bio: "Curated premium audio gear and everyday electronics personally vetted by Naeem.",
      status: 'active',
      createdAt: '2026-03-01T09:00:00.000Z',
    },
  ],
  storefronts: [
    {
      id: 'sf-naeem-01',
      affiliateId: 'aff-naeem-01',
      storeName: "Naeem's Tech Haven",
      storeSlug: 'naeem',
      bio: "Hand-picked high performance gadgets curated for tech enthusiasts and creators.",
      tagline: 'Precision Crafted Tech for Modern Creators',
      themeAccent: '#0066ff',
      isPublished: true,
      customProducts: [
        {
          productId: 'prod-001',
          customSellingPrice: 5100, // Base is 4200, affiliate gross earning: ৳900 per unit
          isFeatured: true,
        },
        {
          productId: 'prod-002',
          customSellingPrice: 6800, // Base is 5500, affiliate gross earning: ৳1300 per unit
          isFeatured: true,
        },
        {
          productId: 'prod-004',
          customSellingPrice: 2450, // Base is 1800, affiliate gross earning: ৳650 per unit
          isFeatured: false,
        },
      ],
      updatedAt: '2026-03-01T10:00:00.000Z',
    },
  ],
  orders: [
    {
      id: 'ord-001',
      orderNumber: 'RNV-2026-89412',
      customer: {
        fullName: 'Kamal Hossain',
        email: 'kamal.hossain@gmail.com',
        mobile: '+8801912445566',
        address: 'House 14, Road 5, Sector 4, Uttara',
        city: 'Dhaka',
        note: 'Please call before delivery',
      },
      items: [
        {
          productId: 'prod-001',
          productName: 'AeroFlow Pro ANC Wireless Headphones',
          quantity: 1,
          basePriceSnapshot: 4200,
          sellingPriceSnapshot: 5100,
          affiliateId: 'aff-naeem-01',
          image: '/src/assets/images/ronvex_headphones_1792559433004.jpg',
          subtotal: 5100,
        },
      ],
      totalAmount: 5100,
      affiliateId: 'aff-naeem-01',
      affiliateSlug: 'naeem',
      paymentMethod: 'cod',
      paymentStatus: 'paid',
      deliveryStatus: 'delivered',
      statusHistory: [
        { status: 'pending', timestamp: '2026-03-05T11:00:00.000Z', actor: 'Customer' },
        { status: 'confirmed', timestamp: '2026-03-05T12:00:00.000Z', actor: 'Admin' },
        { status: 'processing', timestamp: '2026-03-05T14:30:00.000Z', actor: 'Admin' },
        { status: 'shipped', timestamp: '2026-03-06T09:15:00.000Z', actor: 'Admin' },
        { status: 'delivered', timestamp: '2026-03-07T16:40:00.000Z', actor: 'Admin' },
      ],
      createdAt: '2026-03-05T11:00:00.000Z',
      updatedAt: '2026-03-07T16:40:00.000Z',
      deliveredAt: '2026-03-07T16:40:00.000Z',
    },
    {
      id: 'ord-002',
      orderNumber: 'RNV-2026-90124',
      customer: {
        fullName: 'Sabrina Rahman',
        email: 'sabrina.r@yahoo.com',
        mobile: '+8801733445566',
        address: 'Flat 4B, Green Road',
        city: 'Dhaka',
      },
      items: [
        {
          productId: 'prod-002',
          productName: 'ChronoPro Titanium Smartwatch',
          quantity: 1,
          basePriceSnapshot: 5500,
          sellingPriceSnapshot: 6800,
          affiliateId: 'aff-naeem-01',
          image: '/src/assets/images/ronvex_smartwatch_1792559446981.jpg',
          subtotal: 6800,
        },
      ],
      totalAmount: 6800,
      affiliateId: 'aff-naeem-01',
      affiliateSlug: 'naeem',
      paymentMethod: 'bkash',
      paymentStatus: 'paid',
      deliveryStatus: 'shipped',
      statusHistory: [
        { status: 'pending', timestamp: '2026-03-12T10:00:00.000Z', actor: 'Customer' },
        { status: 'confirmed', timestamp: '2026-03-12T11:00:00.000Z', actor: 'Admin' },
        { status: 'shipped', timestamp: '2026-03-13T10:30:00.000Z', actor: 'Admin' },
      ],
      createdAt: '2026-03-12T10:00:00.000Z',
      updatedAt: '2026-03-13T10:30:00.000Z',
    },
    {
      id: 'ord-003',
      orderNumber: 'RNV-2026-91338',
      customer: {
        fullName: 'Tanvir Mahmud',
        email: 'tanvir.m@outlook.com',
        mobile: '+8801688990011',
        address: 'House 8, Road 2, Block C, Mirpur 1',
        city: 'Dhaka',
      },
      items: [
        {
          productId: 'prod-003',
          productName: 'StealthGlide Wireless Mechanical Keyboard',
          quantity: 1,
          basePriceSnapshot: 3800,
          sellingPriceSnapshot: 3800,
          affiliateId: null,
          image: '/src/assets/images/ronvex_keyboard_1792559458949.jpg',
          subtotal: 3800,
        },
      ],
      totalAmount: 3800,
      affiliateId: null, // Direct order, zero affiliate earnings
      paymentMethod: 'cod',
      paymentStatus: 'pending',
      deliveryStatus: 'processing',
      statusHistory: [
        { status: 'pending', timestamp: '2026-03-14T15:20:00.000Z', actor: 'Customer' },
        { status: 'confirmed', timestamp: '2026-03-14T16:00:00.000Z', actor: 'Admin' },
        { status: 'processing', timestamp: '2026-03-15T09:00:00.000Z', actor: 'Admin' },
      ],
      createdAt: '2026-03-14T15:20:00.000Z',
      updatedAt: '2026-03-15T09:00:00.000Z',
    },
  ],
  earnings: [
    {
      id: 'earn-001',
      affiliateId: 'aff-naeem-01',
      orderId: 'ord-001',
      orderNumber: 'RNV-2026-89412',
      grossAmount: 900, // (5100 - 4200) * 1
      status: 'confirmed',
      createdAt: '2026-03-07T16:40:00.000Z',
      confirmedAt: '2026-03-07T16:40:00.000Z',
    },
  ],
  payouts: [],
  payoutRequests: [],
  savedPayoutMethods: [
    {
      id: 'spm-naeem-01',
      affiliateId: 'aff-naeem-01',
      methodType: 'bkash',
      title: 'Personal bKash (01712445566)',
      details: {
        methodType: 'bkash',
        accountNumber: '01712445566',
        accountType: 'personal',
      },
      isDefault: true,
      createdAt: '2026-03-01T10:00:00.000Z',
      updatedAt: '2026-03-01T10:00:00.000Z',
    },
  ],
  financialLedger: [
    {
      id: 'fl-001',
      affiliateId: 'aff-naeem-01',
      affiliateName: 'Naeem Ahmed',
      entryType: 'EARNING_CONFIRMED',
      amount: 900,
      availableBalanceAfter: 900,
      referenceType: 'order',
      referenceId: 'ord-001',
      referenceNumber: 'RNV-2026-89412',
      description: 'Confirmed gross profit from delivered order (AeroFlow Pro ANC)',
      actor: 'Admin',
      timestamp: '2026-03-07T16:40:00.000Z',
    },
  ],
  payoutSettings: {
    minimumPayoutAmount: 500,
    payoutDayOfWeek: 3, // Wednesday
    cutoffDayOfWeek: 2, // Tuesday
    cutoffHour: 23,
    cutoffMinute: 59,
    timezone: 'Asia/Dhaka',
    updatedAt: '2026-03-01T00:00:00.000Z',
    updatedBy: 'System',
  },
  clicks: [
    {
      id: 'clk-01',
      affiliateId: 'aff-naeem-01',
      productId: 'prod-001',
      referrer: 'https://youtube.com',
      timestamp: '2026-03-05T09:15:00.000Z',
    },
    {
      id: 'clk-02',
      affiliateId: 'aff-naeem-01',
      productId: 'prod-002',
      referrer: 'https://facebook.com',
      timestamp: '2026-03-12T08:30:00.000Z',
    },
    {
      id: 'clk-03',
      affiliateId: 'aff-naeem-01',
      referrer: 'https://instagram.com',
      timestamp: '2026-03-15T12:00:00.000Z',
    },
  ],
  auditLogs: [
    {
      id: 'log-001',
      actor: 'Admin',
      action: 'APPROVE_AFFILIATE',
      target: 'aff-naeem-01',
      details: { email: 'affiliate@ronvex.com', slug: 'naeem' },
      timestamp: '2026-03-01T09:00:00.000Z',
    },
    {
      id: 'log-002',
      actor: 'Admin',
      action: 'DELIVERY_STATUS_UPDATE',
      target: 'ord-001',
      details: { from: 'shipped', to: 'delivered', generatedEarning: 900 },
      timestamp: '2026-03-07T16:40:00.000Z',
    },
  ],
  adminUsers: [
    {
      id: 'usr-admin-01',
      email: 'admin@ronvex.com',
      passwordHash: hashPassword('admin123'),
      name: 'RONVEX Super Admin',
    },
  ],
  affiliateCredentials: [
    {
      affiliateId: 'aff-naeem-01',
      passwordHash: hashPassword('affiliate123'),
    },
  ],
};

class DatabaseManager {
  private data: DatabaseSchema;

  constructor() {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }

    if (fs.existsSync(DB_FILE)) {
      try {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        this.data = JSON.parse(raw);
        // Guarantee all arrays exist
        this.data.products = this.data.products || [];
        this.data.categories = this.data.categories || [];
        this.data.applications = this.data.applications || [];
        this.data.affiliates = this.data.affiliates || [];
        this.data.storefronts = this.data.storefronts || [];
        this.data.orders = this.data.orders || [];
        this.data.earnings = this.data.earnings || [];
        this.data.payouts = this.data.payouts || [];
        this.data.payoutRequests = this.data.payoutRequests || [];
        this.data.savedPayoutMethods = this.data.savedPayoutMethods || [];
        this.data.financialLedger = this.data.financialLedger || [];
        this.data.payoutSettings = this.data.payoutSettings || initialData.payoutSettings;
        this.data.clicks = this.data.clicks || [];
        this.data.auditLogs = this.data.auditLogs || [];
        this.data.adminUsers = this.data.adminUsers || [];
        this.data.affiliateCredentials = this.data.affiliateCredentials || [];
      } catch (err) {
        console.error('Failed reading existing db file, resetting to initial seed:', err);
        this.data = JSON.parse(JSON.stringify(initialData));
        this.persist();
      }
    } else {
      this.data = JSON.parse(JSON.stringify(initialData));
      this.persist();
    }
  }

  private persist() {
    try {
      const tempPath = `${DB_FILE}.tmp`;
      fs.writeFileSync(tempPath, JSON.stringify(this.data, null, 2), 'utf-8');
      fs.renameSync(tempPath, DB_FILE);
    } catch (err) {
      console.error('Error persisting database:', err);
    }
  }

  // --- Products ---
  getProducts(filter?: { category?: string; query?: string; status?: string }): Product[] {
    let result = this.data.products;
    if (filter?.status) {
      result = result.filter(p => p.status === filter.status);
    }
    if (filter?.category && filter.category !== 'all') {
      result = result.filter(p => p.category.toLowerCase() === filter.category!.toLowerCase());
    }
    if (filter?.query) {
      const q = filter.query.toLowerCase().trim();
      result = result.filter(
        p => p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q)
      );
    }
    return result;
  }

  getProductByIdOrSlug(idOrSlug: string): Product | undefined {
    return this.data.products.find(p => p.id === idOrSlug || p.slug === idOrSlug);
  }

  createProduct(product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>, actor: string): Product {
    const id = `prod-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`;
    const now = new Date().toISOString();
    const newProduct: Product = {
      ...product,
      id,
      createdAt: now,
      updatedAt: now,
    };
    this.data.products.push(newProduct);
    this.addAuditLog(actor, 'CREATE_PRODUCT', id, { name: product.name, sku: product.sku });
    this.persist();
    return newProduct;
  }

  updateProduct(id: string, updates: Partial<Product>, actor: string): Product | null {
    const idx = this.data.products.findIndex(p => p.id === id);
    if (idx === -1) return null;
    const existing = this.data.products[idx];
    const updated: Product = {
      ...existing,
      ...updates,
      id: existing.id,
      createdAt: existing.createdAt,
      updatedAt: new Date().toISOString(),
    };
    this.data.products[idx] = updated;
    this.addAuditLog(actor, 'UPDATE_PRODUCT', id, { updates });
    this.persist();
    return updated;
  }

  deleteProduct(id: string, actor: string): boolean {
    const idx = this.data.products.findIndex(p => p.id === id);
    if (idx === -1) return false;
    this.data.products.splice(idx, 1);
    this.addAuditLog(actor, 'DELETE_PRODUCT', id, {});
    this.persist();
    return true;
  }

  getCategories(): Category[] {
    return this.data.categories;
  }

  createCategory(name: string, icon: string, actor: string): Category {
    const slug = name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-');
    const id = `cat-${Date.now().toString(36)}`;
    const newCat: Category = {
      id,
      name: name.trim(),
      slug,
      icon: icon || 'Zap',
    };
    this.data.categories.push(newCat);
    this.addAuditLog(actor, 'CREATE_CATEGORY', id, { name });
    this.persist();
    return newCat;
  }

  updateCategory(id: string, updates: Partial<Category>, actor: string): Category | null {
    const cat = this.data.categories.find(c => c.id === id);
    if (!cat) return null;
    if (updates.name) {
      cat.name = updates.name.trim();
      cat.slug = updates.name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-');
    }
    if (updates.icon) cat.icon = updates.icon;
    this.addAuditLog(actor, 'UPDATE_CATEGORY', id, { updates });
    this.persist();
    return cat;
  }

  deleteCategory(id: string, actor: string): boolean {
    const idx = this.data.categories.findIndex(c => c.id === id);
    if (idx === -1) return false;
    const cat = this.data.categories[idx];
    this.data.categories.splice(idx, 1);
    this.addAuditLog(actor, 'DELETE_CATEGORY', id, { name: cat.name });
    this.persist();
    return true;
  }

  // --- Affiliates & Applications ---
  submitAffiliateApplication(input: {
    fullName: string;
    email: string;
    mobile: string;
    address: string;
    businessDetails?: string;
    desiredSlug: string;
    password?: string;
  }): { application: AffiliateApplication; error?: string } {
    // Check if email or slug already registered
    const emailLower = input.email.toLowerCase().trim();
    const slugClean = input.desiredSlug.toLowerCase().trim().replace(/[^a-z0-9-]/g, '-');

    if (!slugClean || slugClean.length < 3) {
      return { application: null as any, error: 'Store URL slug must be at least 3 characters (letters, numbers, hyphens).' };
    }

    const existingApp = this.data.applications.find(a => a.email.toLowerCase() === emailLower);
    if (existingApp && (existingApp.status === 'pending' || existingApp.status === 'approved')) {
      return { application: null as any, error: 'An application with this email already exists.' };
    }

    const existingAffiliate = this.data.affiliates.find(a => a.slug === slugClean || a.email.toLowerCase() === emailLower);
    if (existingAffiliate) {
      return { application: null as any, error: 'This store slug or email is already taken. Please choose another.' };
    }

    const id = `app-${Date.now().toString(36)}`;
    const app: AffiliateApplication = {
      id,
      fullName: input.fullName.trim(),
      email: emailLower,
      mobile: input.mobile.trim(),
      address: input.address.trim(),
      businessDetails: input.businessDetails?.trim(),
      desiredSlug: slugClean,
      status: 'pending',
      appliedAt: new Date().toISOString(),
    };

    this.data.applications.push(app);

    // Save temporary credentials for when approved
    if (input.password) {
      (app as any)._tempPasswordHash = hashPassword(input.password);
    }

    this.addAuditLog('System', 'AFFILIATE_APPLICATION_SUBMITTED', id, { email: emailLower, slug: slugClean });
    this.persist();
    return { application: app };
  }

  getApplications(): AffiliateApplication[] {
    return this.data.applications;
  }

  getAffiliates(): AffiliateProfile[] {
    return this.data.affiliates;
  }

  getAffiliateById(id: string): AffiliateProfile | undefined {
    return this.data.affiliates.find(a => a.id === id);
  }

  getAffiliateBySlug(slug: string): AffiliateProfile | undefined {
    return this.data.affiliates.find(a => a.slug.toLowerCase() === slug.toLowerCase());
  }

  approveApplication(appId: string, actor: string): { success: boolean; affiliate?: AffiliateProfile; error?: string } {
    const app = this.data.applications.find(a => a.id === appId);
    if (!app) return { success: false, error: 'Application not found' };
    if (app.status === 'approved') return { success: false, error: 'Application already approved' };

    app.status = 'approved';
    app.reviewedAt = new Date().toISOString();
    app.reviewedBy = actor;

    const affiliateId = `aff-${Date.now().toString(36)}`;
    const newAffiliate: AffiliateProfile = {
      id: affiliateId,
      applicationId: app.id,
      fullName: app.fullName,
      email: app.email,
      mobile: app.mobile,
      slug: app.desiredSlug,
      storeName: `${app.fullName}'s Store`,
      bio: `Welcome to ${app.fullName}'s official RONVEX partner storefront.`,
      status: 'active',
      createdAt: new Date().toISOString(),
    };

    this.data.affiliates.push(newAffiliate);

    // Register credentials
    const pwHash = (app as any)._tempPasswordHash || hashPassword('affiliate123');
    this.data.affiliateCredentials.push({
      affiliateId,
      passwordHash: pwHash,
    });

    // Create initial default storefront
    const sf: StorefrontConfig = {
      id: `sf-${affiliateId}`,
      affiliateId,
      storeName: newAffiliate.storeName,
      storeSlug: newAffiliate.slug,
      bio: newAffiliate.bio || '',
      tagline: 'Authentic Gear Curated For You',
      themeAccent: '#0066ff',
      isPublished: true,
      customProducts: this.data.products.slice(0, 3).map(p => ({
        productId: p.id,
        customSellingPrice: p.minPrice + Math.round((p.maxPrice - p.minPrice) * 0.4),
        isFeatured: true,
      })),
      updatedAt: new Date().toISOString(),
    };
    this.data.storefronts.push(sf);

    this.addAuditLog(actor, 'APPROVE_AFFILIATE', affiliateId, { applicationId: appId, email: app.email });
    this.persist();
    return { success: true, affiliate: newAffiliate };
  }

  rejectApplication(appId: string, reason: string, actor: string): boolean {
    const app = this.data.applications.find(a => a.id === appId);
    if (!app) return false;
    app.status = 'rejected';
    app.rejectionReason = reason;
    app.reviewedAt = new Date().toISOString();
    app.reviewedBy = actor;
    this.addAuditLog(actor, 'REJECT_AFFILIATE', appId, { reason });
    this.persist();
    return true;
  }

  setAffiliateStatus(affiliateId: string, status: 'active' | 'suspended', actor: string): boolean {
    const aff = this.data.affiliates.find(a => a.id === affiliateId);
    if (!aff) return false;
    aff.status = status;
    this.addAuditLog(actor, 'UPDATE_AFFILIATE_STATUS', affiliateId, { status });
    this.persist();
    return true;
  }

  // --- Storefront ---
  getStorefrontBySlug(slug: string): { storefront: StorefrontConfig; affiliate: AffiliateProfile; productsWithPricing: any[] } | null {
    const affiliate = this.data.affiliates.find(a => a.slug.toLowerCase() === slug.toLowerCase());
    if (!affiliate || affiliate.status !== 'active') return null;

    const sf = this.data.storefronts.find(s => s.affiliateId === affiliate.id);
    if (!sf || !sf.isPublished) return null;

    // Attach full product objects and ensure prices are strictly validated against current product rules
    const productsWithPricing = sf.customProducts.map(cp => {
      const prod = this.data.products.find(p => p.id === cp.productId);
      if (!prod || prod.status !== 'active') return null;
      // Clamp price to current product min and max bounds defensively
      const verifiedPrice = Math.max(prod.minPrice, Math.min(prod.maxPrice, cp.customSellingPrice));
      return {
        ...prod,
        customSellingPrice: verifiedPrice,
        isStoreFeatured: !!cp.isFeatured,
      };
    }).filter(Boolean);

    return {
      storefront: sf,
      affiliate,
      productsWithPricing,
    };
  }

  getStorefrontByAffiliateId(affiliateId: string): StorefrontConfig | undefined {
    return this.data.storefronts.find(s => s.affiliateId === affiliateId);
  }

  updateStorefront(
    affiliateId: string,
    updates: {
      storeName?: string;
      bio?: string;
      tagline?: string;
      themeAccent?: string;
      isPublished?: boolean;
      customProducts?: { productId: string; customSellingPrice: number; isFeatured?: boolean }[];
    }
  ): { success: boolean; storefront?: StorefrontConfig; error?: string } {
    const affiliate = this.data.affiliates.find(a => a.id === affiliateId);
    if (!affiliate) return { success: false, error: 'Affiliate not found' };
    if (affiliate.status !== 'active') return { success: false, error: 'Affiliate account is suspended' };

    let sf = this.data.storefronts.find(s => s.affiliateId === affiliateId);
    if (!sf) {
      sf = {
        id: `sf-${affiliateId}`,
        affiliateId,
        storeName: affiliate.storeName,
        storeSlug: affiliate.slug,
        bio: affiliate.bio || '',
        tagline: 'Authentic Gear Curated For You',
        themeAccent: '#0066ff',
        isPublished: true,
        customProducts: [],
        updatedAt: new Date().toISOString(),
      };
      this.data.storefronts.push(sf);
    }

    if (updates.storeName !== undefined) sf.storeName = updates.storeName.trim();
    if (updates.bio !== undefined) sf.bio = updates.bio.trim();
    if (updates.tagline !== undefined) sf.tagline = updates.tagline.trim();
    if (updates.themeAccent !== undefined) sf.themeAccent = updates.themeAccent;
    if (updates.isPublished !== undefined) sf.isPublished = updates.isPublished;

    // Validate each custom product price strictly on server
    if (updates.customProducts) {
      const validated: { productId: string; customSellingPrice: number; isFeatured?: boolean }[] = [];
      for (const item of updates.customProducts) {
        const prod = this.data.products.find(p => p.id === item.productId);
        if (!prod) continue;
        if (!prod.affiliateAvailable) continue;

        const price = Number(item.customSellingPrice);
        if (isNaN(price) || price < prod.minPrice || price > prod.maxPrice) {
          return {
            success: false,
            error: `Price for "${prod.name}" (৳${price}) must be between ৳${prod.minPrice} and ৳${prod.maxPrice}.`,
          };
        }
        validated.push({
          productId: prod.id,
          customSellingPrice: price,
          isFeatured: !!item.isFeatured,
        });
      }
      sf.customProducts = validated;
    }

    sf.updatedAt = new Date().toISOString();
    this.addAuditLog(affiliate.email, 'UPDATE_STOREFRONT', sf.id, { storeName: sf.storeName });
    this.persist();
    return { success: true, storefront: sf };
  }

  // --- Orders & Pricing ---
  createOrder(orderInput: {
    customer: Order['customer'];
    items: { productId: string; quantity: number; requestedPrice?: number }[];
    affiliateId?: string | null;
    paymentMethod: Order['paymentMethod'];
  }): { success: boolean; order?: Order; error?: string } {
    if (!orderInput.items || orderInput.items.length === 0) {
      return { success: false, error: 'Order must contain at least one item.' };
    }

    // Verify affiliate if provided
    let verifiedAffiliateId: string | null = null;
    let verifiedAffiliateSlug: string | null = null;
    let affiliateStorefront: StorefrontConfig | undefined;

    if (orderInput.affiliateId) {
      const aff = this.data.affiliates.find(
        a => a.id === orderInput.affiliateId || a.slug.toLowerCase() === orderInput.affiliateId?.toLowerCase()
      );
      if (aff && aff.status === 'active') {
        verifiedAffiliateId = aff.id;
        verifiedAffiliateSlug = aff.slug;
        affiliateStorefront = this.data.storefronts.find(s => s.affiliateId === aff.id);
      }
    }

    const orderItems: Order['items'] = [];
    let calculatedTotal = 0;

    for (const reqItem of orderInput.items) {
      const product = this.data.products.find(p => p.id === reqItem.productId);
      if (!product || product.status !== 'active') {
        return { success: false, error: `Product not available or out of stock.` };
      }
      if (reqItem.quantity <= 0) {
        return { success: false, error: 'Item quantity must be greater than zero.' };
      }
      if (product.stock < reqItem.quantity) {
        return { success: false, error: `Insufficient stock for "${product.name}". Available: ${product.stock}` };
      }

      // Determine selling price snapshot on the server
      let sellingPrice = product.basePrice;

      if (verifiedAffiliateId && affiliateStorefront) {
        // Look up the affiliate's configured custom selling price
        const customEntry = affiliateStorefront.customProducts.find(cp => cp.productId === product.id);
        if (customEntry) {
          // Strictly validate within current product limits
          sellingPrice = Math.max(product.minPrice, Math.min(product.maxPrice, customEntry.customSellingPrice));
        } else {
          // If not customized, default to product min price
          sellingPrice = product.minPrice;
        }
      } else {
        // Direct customer order: standard base price
        sellingPrice = product.basePrice;
      }

      const itemSubtotal = sellingPrice * reqItem.quantity;
      calculatedTotal += itemSubtotal;

      // Decrement stock
      product.stock -= reqItem.quantity;

      // Immutable snapshots
      orderItems.push({
        productId: product.id,
        productName: product.name,
        quantity: reqItem.quantity,
        basePriceSnapshot: product.basePrice,
        sellingPriceSnapshot: sellingPrice,
        affiliateId: verifiedAffiliateId,
        image: product.images[0] || '',
        subtotal: itemSubtotal,
      });
    }

    const orderId = `ord-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`;
    const randomSuffix = Math.floor(10000 + Math.random() * 90000);
    const orderNumber = `RNV-2026-${randomSuffix}`;
    const now = new Date().toISOString();

    const newOrder: Order = {
      id: orderId,
      orderNumber,
      customer: orderInput.customer,
      items: orderItems,
      totalAmount: calculatedTotal,
      affiliateId: verifiedAffiliateId,
      affiliateSlug: verifiedAffiliateSlug,
      paymentMethod: orderInput.paymentMethod,
      paymentStatus: orderInput.paymentMethod === 'cod' ? 'pending' : 'paid',
      deliveryStatus: 'pending',
      statusHistory: [
        {
          status: 'pending',
          timestamp: now,
          actor: 'Customer',
          note: 'Order submitted successfully',
        },
      ],
      createdAt: now,
      updatedAt: now,
    };

    this.data.orders.unshift(newOrder);

    this.addAuditLog(orderInput.customer.email, 'CREATE_ORDER', orderId, {
      orderNumber,
      totalAmount: calculatedTotal,
      affiliateId: verifiedAffiliateId,
    });

    this.persist();
    return { success: true, order: newOrder };
  }

  updateDeliveryStatus(
    orderId: string,
    newStatus: DeliveryStatus,
    note: string,
    actor: string
  ): { success: boolean; order?: Order; error?: string } {
    const order = this.data.orders.find(o => o.id === orderId);
    if (!order) return { success: false, error: 'Order not found' };

    const oldStatus = order.deliveryStatus;
    if (oldStatus === newStatus) return { success: true, order };

    order.deliveryStatus = newStatus;
    order.updatedAt = new Date().toISOString();

    order.statusHistory.push({
      status: newStatus,
      timestamp: new Date().toISOString(),
      note: note || `Status changed from ${oldStatus} to ${newStatus}`,
      actor,
    });

    // BUSINESS LOGIC: When marked as DELIVERED
    if (newStatus === 'delivered') {
      order.deliveredAt = new Date().toISOString();
      if (order.paymentMethod === 'cod') {
        order.paymentStatus = 'paid';
      }

      // Calculate affiliate gross earning idempotently
      if (order.affiliateId) {
        // Calculate eligible gross earnings: (Affiliate Selling Price - Admin Base Price) * qty
        let totalAffiliateGross = 0;
        for (const item of order.items) {
          if (item.affiliateId) {
            const margin = Math.max(0, item.sellingPriceSnapshot - item.basePriceSnapshot);
            totalAffiliateGross += margin * item.quantity;
          }
        }

        if (totalAffiliateGross > 0) {
          const existingEarning = this.data.earnings.find(e => e.orderId === order.id);
          if (existingEarning) {
            existingEarning.status = 'confirmed';
            existingEarning.grossAmount = totalAffiliateGross;
            existingEarning.confirmedAt = new Date().toISOString();
          } else {
            const earning: AffiliateEarning = {
              id: `earn-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`,
              affiliateId: order.affiliateId,
              orderId: order.id,
              orderNumber: order.orderNumber,
              grossAmount: totalAffiliateGross,
              status: 'confirmed',
              createdAt: new Date().toISOString(),
              confirmedAt: new Date().toISOString(),
            };
            this.data.earnings.push(earning);
          }
        }
      }
    }

    // BUSINESS LOGIC: If CANCELLED or RETURNED, reverse earnings idempotently
    if (newStatus === 'cancelled' || newStatus === 'returned') {
      const existingEarning = this.data.earnings.find(e => e.orderId === order.id);
      if (existingEarning && existingEarning.status === 'confirmed') {
        existingEarning.status = 'reversed';
        existingEarning.reversedAt = new Date().toISOString();
        existingEarning.reversalReason = `Order status transitioned to ${newStatus}`;
      }
    }

    // STOCK INVENTORY REPLENISHMENT: If cancelled or returned from active status, restore stock
    if ((newStatus === 'cancelled' || newStatus === 'returned') && oldStatus !== 'cancelled' && oldStatus !== 'returned') {
      for (const item of order.items) {
        const prod = this.data.products.find(p => p.id === item.productId);
        if (prod) {
          prod.stock += item.quantity;
        }
      }
    } else if ((oldStatus === 'cancelled' || oldStatus === 'returned') && newStatus !== 'cancelled' && newStatus !== 'returned') {
      for (const item of order.items) {
        const prod = this.data.products.find(p => p.id === item.productId);
        if (prod) {
          prod.stock = Math.max(0, prod.stock - item.quantity);
        }
      }
    }

    this.addAuditLog(actor, 'UPDATE_DELIVERY_STATUS', orderId, {
      from: oldStatus,
      to: newStatus,
      orderNumber: order.orderNumber,
    });

    this.persist();
    return { success: true, order };
  }

  getOrders(filter?: { affiliateId?: string; status?: string }): Order[] {
    let result = this.data.orders;
    if (filter?.affiliateId) {
      result = result.filter(o => o.affiliateId === filter.affiliateId);
    }
    if (filter?.status && filter.status !== 'all') {
      result = result.filter(o => o.deliveryStatus === filter.status);
    }
    return result;
  }

  getOrderById(id: string): Order | undefined {
    return this.data.orders.find(o => o.id === id || o.orderNumber === id);
  }

  lookupOrder(orderNumber: string, queryPhoneOrEmail: string): Order | undefined {
    const cleanNum = orderNumber.trim().toUpperCase();
    const cleanQuery = queryPhoneOrEmail.trim().toLowerCase();
    return this.data.orders.find(o => {
      const matchNum = o.orderNumber.toUpperCase() === cleanNum;
      const matchContact =
        o.customer.email.toLowerCase() === cleanQuery ||
        o.customer.mobile.replace(/\s+/g, '') === cleanQuery.replace(/\s+/g, '');
      return matchNum && matchContact;
    });
  }

  getCustomerOrders(queryPhoneOrEmail: string): Order[] {
    const cleanQuery = queryPhoneOrEmail.trim().toLowerCase();
    if (!cleanQuery) return [];
    return this.data.orders.filter(o => {
      return (
        o.customer.email.toLowerCase() === cleanQuery ||
        o.customer.mobile.replace(/\s+/g, '') === cleanQuery.replace(/\s+/g, '')
      );
    });
  }

  // --- Financial & Manual Payout System ---

  getAffiliateFinancials(affiliateId: string): AffiliateFinancials {
    const affiliate = this.data.affiliates.find(a => a.id === affiliateId);
    if (!affiliate) {
      throw new Error(`Affiliate ${affiliateId} not found.`);
    }

    // 1. Lifetime Confirmed Earnings (Orders marked DELIVERED with confirmed gross profit)
    const confirmedEarnings = this.data.earnings.filter(
      e => e.affiliateId === affiliateId && (e.status === 'confirmed' || e.status === 'paid')
    );
    const lifetimeConfirmedGross = confirmedEarnings.reduce((sum, e) => sum + e.grossAmount, 0);

    // 2. Pending Order Earnings (In-transit or pending fulfillment, strictly NOT withdrawable)
    const activeAttributedOrders = this.data.orders.filter(
      o => o.affiliateId === affiliateId &&
      o.deliveryStatus !== 'delivered' &&
      o.deliveryStatus !== 'cancelled' &&
      o.deliveryStatus !== 'returned'
    );
    const pendingOrderEarnings = activeAttributedOrders.reduce((sum, order) => {
      let orderGross = 0;
      for (const item of order.items) {
        if (item.affiliateId === affiliateId) {
          orderGross += Math.max(0, item.sellingPriceSnapshot - item.basePriceSnapshot) * item.quantity;
        }
      }
      return sum + orderGross;
    }, 0);

    // 3. Payout Requests by this affiliate
    const requests = (this.data.payoutRequests || []).filter(r => r.affiliateId === affiliateId);

    // Reserved in-flight requests (Pending verification, Approved, or in Processing)
    const inFlightRequests = requests.filter(r =>
      r.status === 'pending' || r.status === 'approved' || r.status === 'processing'
    );
    const awaitingProcessingAmount = inFlightRequests.reduce((sum, r) => sum + r.amount, 0);

    // Total Amount Paid (Completed manual payouts with TrxID)
    const paidRequests = requests.filter(r => r.status === 'paid');
    const totalPaidAmount = paidRequests.reduce((sum, r) => sum + r.amount, 0);

    // 4. Genuinely Available Balance (Cannot be overdrawn or double-spent)
    const availableBalance = Math.max(0, lifetimeConfirmedGross - totalPaidAmount - awaitingProcessingAmount);

    // 5. Asia/Dhaka Wednesday Scheduling info
    const cutoffNotice = calculateWednesdayBatch(new Date(), this.data.payoutSettings);

    return {
      availableBalance,
      pendingOrderEarnings,
      awaitingProcessingAmount,
      totalPaidAmount,
      lifetimeConfirmedGross,
      nextScheduledWednesday: cutoffNotice.targetWednesdayBatch,
      cutoffNotice: {
        nextWednesdayDate: cutoffNotice.humanReadableBatch,
        cutoffDateTimeFormatted: cutoffNotice.cutoffFormatted,
        isBeforeCutoff: cutoffNotice.isCutoffEligible,
        daysRemaining: cutoffNotice.daysRemaining,
        timezone: cutoffNotice.timezone,
      },
    };
  }

  createPayoutRequest(input: {
    affiliateId: string;
    amount: number;
    methodType: PayoutMethodType;
    accountDetails: PayoutAccountDetails;
    saveMethod?: boolean;
    savedMethodTitle?: string;
    actor: string;
  }): { success: boolean; request?: PayoutRequest; error?: string } {
    const affiliate = this.data.affiliates.find(a => a.id === input.affiliateId);
    if (!affiliate) {
      return { success: false, error: 'Affiliate profile not found.' };
    }

    if (affiliate.status !== 'active') {
      return { success: false, error: 'Affiliate account is currently suspended. Payouts are disabled.' };
    }

    const minAmount = this.data.payoutSettings.minimumPayoutAmount || 500;
    const requestedAmount = Math.floor(Number(input.amount));

    if (isNaN(requestedAmount) || requestedAmount < minAmount) {
      return {
        success: false,
        error: `Minimum payout request amount is ৳${minAmount.toLocaleString()}.`,
      };
    }

    // Server-Authoritative Balance Check
    const financials = this.getAffiliateFinancials(affiliate.id);
    if (requestedAmount > financials.availableBalance) {
      return {
        success: false,
        error: `Requested amount (৳${requestedAmount.toLocaleString()}) exceeds your genuinely available balance (৳${financials.availableBalance.toLocaleString()}).`,
      };
    }

    // Validate Account Details
    if (!input.methodType || !['bkash', 'nagad', 'bank'].includes(input.methodType)) {
      return { success: false, error: 'Invalid payment method selected. Must be bKash, Nagad, or Bank Transfer.' };
    }

    const details = input.accountDetails;
    if (input.methodType === 'bkash' || input.methodType === 'nagad') {
      const accNum = (details as any)?.accountNumber?.trim() || '';
      if (!accNum || !/^01[3-9]\d{8}$/.test(accNum.replace(/\s+/g, ''))) {
        return {
          success: false,
          error: `Please provide a valid 11-digit Bangladeshi ${input.methodType.toUpperCase()} mobile number (e.g. 017XXXXXXXX).`,
        };
      }
    } else if (input.methodType === 'bank') {
      const bankDetails = details as any;
      if (!bankDetails?.accountHolderName?.trim() ||
          !bankDetails?.bankName?.trim() ||
          !bankDetails?.branchName?.trim() ||
          !bankDetails?.accountNumber?.trim()) {
        return {
          success: false,
          error: 'Please fill in Account Holder Name, Bank Name, Branch, and Bank Account Number.',
        };
      }
    }

    // Determine Scheduled Wednesday Batch in Asia/Dhaka
    const now = new Date();
    const batchInfo = calculateWednesdayBatch(now, this.data.payoutSettings);

    const requestId = `prq-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`;
    const randomSuffix = Math.floor(10000 + Math.random() * 90000);
    const requestNumber = `RNV-PAY-2026-${randomSuffix}`;

    const newRequest: PayoutRequest = {
      id: requestId,
      requestNumber,
      affiliateId: affiliate.id,
      affiliateName: affiliate.fullName,
      affiliateEmail: affiliate.email,
      affiliateSlug: affiliate.slug,
      affiliateMobile: affiliate.mobile,
      amount: requestedAmount,
      methodType: input.methodType,
      accountDetails: input.accountDetails,
      status: 'pending',
      targetWednesdayBatch: batchInfo.targetWednesdayBatch,
      isCutoffEligible: batchInfo.isCutoffEligible,
      submittedAt: now.toISOString(),
    };

    this.data.payoutRequests = this.data.payoutRequests || [];
    this.data.payoutRequests.unshift(newRequest);

    // Save Payout Method if requested
    if (input.saveMethod) {
      this.savePayoutMethod({
        affiliateId: affiliate.id,
        methodType: input.methodType,
        title: input.savedMethodTitle || `${input.methodType.toUpperCase()} - ${(input.accountDetails as any)?.accountNumber?.slice(-4) || 'Account'}`,
        details: input.accountDetails,
        isDefault: false,
      });
    }

    // Record Financial Ledger: Reserve the requested funds
    const balanceAfter = financials.availableBalance - requestedAmount;
    this.data.financialLedger = this.data.financialLedger || [];
    this.data.financialLedger.unshift({
      id: `fl-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`,
      affiliateId: affiliate.id,
      affiliateName: affiliate.fullName,
      entryType: 'PAYOUT_REQUESTED_RESERVE',
      amount: -requestedAmount,
      availableBalanceAfter: balanceAfter,
      referenceType: 'payout_request',
      referenceId: newRequest.id,
      referenceNumber: newRequest.requestNumber,
      description: `Reserved ৳${requestedAmount.toLocaleString()} for ${input.methodType.toUpperCase()} payout request`,
      actor: input.actor || affiliate.fullName,
      timestamp: now.toISOString(),
    });

    this.addAuditLog(input.actor || affiliate.email, 'AFFILIATE_PAYOUT_REQUESTED', newRequest.id, {
      amount: requestedAmount,
      method: input.methodType,
      requestNumber,
      targetBatch: batchInfo.targetWednesdayBatch,
      isCutoffEligible: batchInfo.isCutoffEligible,
    });

    this.persist();
    return { success: true, request: newRequest };
  }

  getAffiliatePayoutRequests(affiliateId: string): PayoutRequest[] {
    this.data.payoutRequests = this.data.payoutRequests || [];
    return this.data.payoutRequests.filter(r => r.affiliateId === affiliateId);
  }

  getAdminPayoutRequests(filter?: {
    status?: string;
    batch?: string;
    affiliateId?: string;
  }): PayoutRequest[] {
    let requests = this.data.payoutRequests || [];
    if (filter?.affiliateId) {
      requests = requests.filter(r => r.affiliateId === filter.affiliateId);
    }
    if (filter?.status && filter.status !== 'all') {
      requests = requests.filter(r => r.status === filter.status);
    }
    if (filter?.batch && filter.batch !== 'all') {
      requests = requests.filter(r => r.targetWednesdayBatch === filter.batch);
    }
    return requests;
  }

  approvePayoutRequest(requestId: string, adminActor: string, adminNote?: string): { success: boolean; request?: PayoutRequest; error?: string } {
    const req = (this.data.payoutRequests || []).find(r => r.id === requestId);
    if (!req) return { success: false, error: 'Payout request not found.' };

    if (req.status !== 'pending') {
      return { success: false, error: `Cannot approve request with current status: ${req.status}.` };
    }

    req.status = 'approved';
    req.reviewedAt = new Date().toISOString();
    req.reviewedBy = adminActor;
    if (adminNote) req.adminNote = adminNote;

    this.addAuditLog(adminActor, 'APPROVE_PAYOUT_REQUEST', req.id, {
      requestNumber: req.requestNumber,
      amount: req.amount,
      affiliateName: req.affiliateName,
    });

    this.persist();
    return { success: true, request: req };
  }

  setPayoutProcessing(requestId: string, adminActor: string, adminNote?: string): { success: boolean; request?: PayoutRequest; error?: string } {
    const req = (this.data.payoutRequests || []).find(r => r.id === requestId);
    if (!req) return { success: false, error: 'Payout request not found.' };

    if (req.status !== 'pending' && req.status !== 'approved') {
      return { success: false, error: `Cannot set request to processing from status: ${req.status}.` };
    }

    req.status = 'processing';
    req.processedAt = new Date().toISOString();
    if (adminNote) req.adminNote = adminNote;

    this.addAuditLog(adminActor, 'PROCESS_PAYOUT_REQUEST', req.id, {
      requestNumber: req.requestNumber,
      amount: req.amount,
      affiliateName: req.affiliateName,
    });

    this.persist();
    return { success: true, request: req };
  }

  rejectPayoutRequest(requestId: string, reason: string, adminActor: string): { success: boolean; request?: PayoutRequest; error?: string } {
    const req = (this.data.payoutRequests || []).find(r => r.id === requestId);
    if (!req) return { success: false, error: 'Payout request not found.' };

    if (req.status === 'paid' || req.status === 'rejected' || req.status === 'failed') {
      return { success: false, error: `Cannot reject request that is already ${req.status}.` };
    }

    if (!reason || !reason.trim()) {
      return { success: false, error: 'A clear rejection reason must be provided.' };
    }

    req.status = 'rejected';
    req.rejectionReason = reason.trim();
    req.reviewedAt = new Date().toISOString();
    req.reviewedBy = adminActor;

    // RELEASE RESERVED FUNDS EXACTLY ONCE
    const currentFin = this.getAffiliateFinancials(req.affiliateId);
    this.data.financialLedger = this.data.financialLedger || [];
    this.data.financialLedger.unshift({
      id: `fl-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`,
      affiliateId: req.affiliateId,
      affiliateName: req.affiliateName,
      entryType: 'PAYOUT_RESERVE_RELEASED',
      amount: req.amount,
      availableBalanceAfter: currentFin.availableBalance, // now includes the released funds
      referenceType: 'payout_request',
      referenceId: req.id,
      referenceNumber: req.requestNumber,
      description: `Released ৳${req.amount.toLocaleString()} back to balance. Rejection reason: ${reason.trim()}`,
      actor: adminActor,
      timestamp: new Date().toISOString(),
    });

    this.addAuditLog(adminActor, 'REJECT_PAYOUT_REQUEST', req.id, {
      requestNumber: req.requestNumber,
      amount: req.amount,
      reason: reason.trim(),
    });

    this.persist();
    return { success: true, request: req };
  }

  markPayoutPaid(input: {
    requestId: string;
    transactionReference: string;
    adminActor: string;
    paidAt?: string;
    adminNote?: string;
  }): { success: boolean; request?: PayoutRequest; error?: string } {
    const req = (this.data.payoutRequests || []).find(r => r.id === input.requestId);
    if (!req) return { success: false, error: 'Payout request not found.' };

    if (req.status === 'paid') {
      return { success: false, error: 'This payout request has already been marked as Paid.' };
    }

    if (req.status === 'rejected' || req.status === 'failed') {
      return { success: false, error: `Cannot mark a ${req.status} request as Paid.` };
    }

    if (!input.transactionReference || !input.transactionReference.trim()) {
      return {
        success: false,
        error: 'A valid payment reference or transaction ID (e.g. bKash TrxID or Bank UTR) is required.',
      };
    }

    const paidTimestamp = input.paidAt || new Date().toISOString();
    const trxRef = input.transactionReference.trim();

    req.status = 'paid';
    req.transactionReference = trxRef;
    req.paidAt = paidTimestamp;
    req.paidBy = input.adminActor;
    if (input.adminNote) req.adminNote = input.adminNote;

    // Record legacy PayoutRecord for backward compatibility
    this.data.payouts = this.data.payouts || [];
    this.data.payouts.unshift({
      id: `pay-${Date.now().toString(36)}`,
      affiliateId: req.affiliateId,
      affiliateName: req.affiliateName,
      amount: req.amount,
      paymentReference: trxRef,
      paidAt: paidTimestamp,
      paidBy: input.adminActor,
    });

    // Record completed deduction in financial ledger
    const fin = this.getAffiliateFinancials(req.affiliateId);
    this.data.financialLedger = this.data.financialLedger || [];
    this.data.financialLedger.unshift({
      id: `fl-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`,
      affiliateId: req.affiliateId,
      affiliateName: req.affiliateName,
      entryType: 'PAYOUT_COMPLETED_DEDUCTION',
      amount: -req.amount,
      availableBalanceAfter: fin.availableBalance,
      referenceType: 'payout_request',
      referenceId: req.id,
      referenceNumber: req.requestNumber,
      description: `Completed manual payout of ৳${req.amount.toLocaleString()} via ${req.methodType.toUpperCase()} (Ref: ${trxRef})`,
      actor: input.adminActor,
      timestamp: paidTimestamp,
    });

    this.addAuditLog(input.adminActor, 'MARK_PAYOUT_PAID', req.id, {
      requestNumber: req.requestNumber,
      amount: req.amount,
      reference: trxRef,
      method: req.methodType,
    });

    this.persist();
    return { success: true, request: req };
  }

  markPayoutFailed(requestId: string, reason: string, adminActor: string): { success: boolean; request?: PayoutRequest; error?: string } {
    const req = (this.data.payoutRequests || []).find(r => r.id === requestId);
    if (!req) return { success: false, error: 'Payout request not found.' };

    if (req.status === 'paid' || req.status === 'failed') {
      return { success: false, error: `Cannot fail request that is already ${req.status}.` };
    }

    req.status = 'failed';
    req.failureReason = reason || 'Payment transfer failed';
    req.reviewedAt = new Date().toISOString();
    req.reviewedBy = adminActor;

    // RELEASE RESERVED FUNDS
    const currentFin = this.getAffiliateFinancials(req.affiliateId);
    this.data.financialLedger = this.data.financialLedger || [];
    this.data.financialLedger.unshift({
      id: `fl-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`,
      affiliateId: req.affiliateId,
      affiliateName: req.affiliateName,
      entryType: 'PAYOUT_RESERVE_RELEASED',
      amount: req.amount,
      availableBalanceAfter: currentFin.availableBalance,
      referenceType: 'payout_request',
      referenceId: req.id,
      referenceNumber: req.requestNumber,
      description: `Released ৳${req.amount.toLocaleString()} back to balance due to payout transfer failure: ${reason}`,
      actor: adminActor,
      timestamp: new Date().toISOString(),
    });

    this.addAuditLog(adminActor, 'MARK_PAYOUT_FAILED', req.id, {
      requestNumber: req.requestNumber,
      amount: req.amount,
      reason,
    });

    this.persist();
    return { success: true, request: req };
  }

  // --- Saved Payout Methods ---
  getSavedPayoutMethods(affiliateId: string): SavedPayoutMethod[] {
    this.data.savedPayoutMethods = this.data.savedPayoutMethods || [];
    return this.data.savedPayoutMethods.filter(m => m.affiliateId === affiliateId);
  }

  savePayoutMethod(input: {
    affiliateId: string;
    methodType: PayoutMethodType;
    title: string;
    details: PayoutAccountDetails;
    isDefault?: boolean;
  }): SavedPayoutMethod {
    this.data.savedPayoutMethods = this.data.savedPayoutMethods || [];

    // If setting as default, unset others
    if (input.isDefault) {
      this.data.savedPayoutMethods
        .filter(m => m.affiliateId === input.affiliateId)
        .forEach(m => (m.isDefault = false));
    }

    const id = `spm-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`;
    const newMethod: SavedPayoutMethod = {
      id,
      affiliateId: input.affiliateId,
      methodType: input.methodType,
      title: input.title.trim(),
      details: input.details,
      isDefault: !!input.isDefault,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.data.savedPayoutMethods.push(newMethod);
    this.persist();
    return newMethod;
  }

  deleteSavedPayoutMethod(affiliateId: string, methodId: string): boolean {
    this.data.savedPayoutMethods = this.data.savedPayoutMethods || [];
    const idx = this.data.savedPayoutMethods.findIndex(m => m.id === methodId && m.affiliateId === affiliateId);
    if (idx === -1) return false;
    this.data.savedPayoutMethods.splice(idx, 1);
    this.persist();
    return true;
  }

  // --- Payout Settings & Ledger ---
  getPayoutSettings(): PayoutSettings {
    return this.data.payoutSettings;
  }

  updatePayoutSettings(updates: Partial<PayoutSettings>, adminActor: string): PayoutSettings {
    this.data.payoutSettings = {
      ...this.data.payoutSettings,
      ...updates,
      updatedAt: new Date().toISOString(),
      updatedBy: adminActor,
    };
    this.addAuditLog(adminActor, 'UPDATE_PAYOUT_SETTINGS', 'payoutSettings', updates);
    this.persist();
    return this.data.payoutSettings;
  }

  getFinancialLedger(filter?: { affiliateId?: string }): FinancialLedgerEntry[] {
    let ledger = this.data.financialLedger || [];
    if (filter?.affiliateId) {
      ledger = ledger.filter(l => l.affiliateId === filter.affiliateId);
    }
    return ledger;
  }

  getPayouts(affiliateId?: string): PayoutRecord[] {
    this.data.payouts = this.data.payouts || [];
    if (affiliateId) {
      return this.data.payouts.filter(p => p.affiliateId === affiliateId);
    }
    return this.data.payouts;
  }

  // --- Affiliate Analytics & Clicks ---
  recordClick(affiliateIdOrSlug: string, productId?: string, referrer?: string): boolean {
    const aff = this.data.affiliates.find(
      a => a.id === affiliateIdOrSlug || a.slug.toLowerCase() === affiliateIdOrSlug.toLowerCase()
    );
    if (!aff) return false;

    this.data.clicks.push({
      id: `clk-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`,
      affiliateId: aff.id,
      productId,
      referrer: referrer || 'Direct / Storefront',
      timestamp: new Date().toISOString(),
    });
    this.persist();
    return true;
  }

  getAffiliateDashboardData(affiliateId: string) {
    const affiliate = this.data.affiliates.find(a => a.id === affiliateId);
    if (!affiliate) return null;

    const storefront = this.data.storefronts.find(s => s.affiliateId === affiliateId);
    const orders = this.data.orders.filter(o => o.affiliateId === affiliateId);
    const earnings = this.data.earnings.filter(e => e.affiliateId === affiliateId);
    const clicks = this.data.clicks.filter(c => c.affiliateId === affiliateId);

    // Earnings breakdown
    const pendingEarnings = orders
      .filter(o => o.deliveryStatus !== 'delivered' && o.deliveryStatus !== 'cancelled' && o.deliveryStatus !== 'returned')
      .reduce((sum, o) => {
        const orderGross = o.items.reduce((s, item) => {
          if (item.affiliateId === affiliateId) {
            return s + Math.max(0, item.sellingPriceSnapshot - item.basePriceSnapshot) * item.quantity;
          }
          return s;
        }, 0);
        return sum + orderGross;
      }, 0);

    const confirmedEarnings = earnings
      .filter(e => e.status === 'confirmed')
      .reduce((sum, e) => sum + e.grossAmount, 0);

    const financials = this.getAffiliateFinancials(affiliateId);
    const payoutRequests = this.getAffiliatePayoutRequests(affiliateId);
    const savedPayoutMethods = this.getSavedPayoutMethods(affiliateId);

    return {
      affiliate,
      storefront,
      financials,
      payoutRequests,
      savedPayoutMethods,
      stats: {
        totalClicks: clicks.length,
        totalOrders: orders.length,
        deliveredOrders: orders.filter(o => o.deliveryStatus === 'delivered').length,
        pendingEarnings: financials.pendingOrderEarnings,
        confirmedEarnings: financials.lifetimeConfirmedGross,
        paidEarnings: financials.totalPaidAmount,
        availableBalance: financials.availableBalance,
        awaitingProcessingAmount: financials.awaitingProcessingAmount,
        totalGrossEarnings: financials.lifetimeConfirmedGross,
      },
      recentOrders: orders.slice(0, 20),
      earningsList: earnings,
      clicks: clicks.slice(-30),
    };
  }

  getAdminOverview() {
    const totalOrders = this.data.orders.length;
    const deliveredOrders = this.data.orders.filter(o => o.deliveryStatus === 'delivered');
    const totalRevenue = deliveredOrders.reduce((sum, o) => sum + o.totalAmount, 0);
    const grossProfit = deliveredOrders.reduce((sum, o) => {
      const orderBaseCost = o.items.reduce((s, item) => s + item.basePriceSnapshot * item.quantity, 0);
      return sum + (o.totalAmount - orderBaseCost);
    }, 0);
    const affiliateEarningsConfirmed = this.data.earnings
      .filter(e => e.status === 'confirmed' || e.status === 'paid')
      .reduce((sum, e) => sum + e.grossAmount, 0);

    const netStoreRevenue = grossProfit - affiliateEarningsConfirmed;

    const deliveryBreakdown = {
      pending: this.data.orders.filter(o => o.deliveryStatus === 'pending').length,
      confirmed: this.data.orders.filter(o => o.deliveryStatus === 'confirmed').length,
      processing: this.data.orders.filter(o => o.deliveryStatus === 'processing').length,
      shipped: this.data.orders.filter(o => o.deliveryStatus === 'shipped').length,
      delivered: deliveredOrders.length,
      cancelled: this.data.orders.filter(o => o.deliveryStatus === 'cancelled').length,
      returned: this.data.orders.filter(o => o.deliveryStatus === 'returned').length,
    };

    const lowStockProducts = this.data.products.filter(p => p.stock < 15);
    const totalInventoryValue = this.data.products.reduce((s, p) => s + p.basePrice * p.stock, 0);

    // Sales by category
    const salesByCategory: Record<string, number> = {};
    deliveredOrders.forEach(o => {
      o.items.forEach(it => {
        const prod = this.data.products.find(p => p.id === it.productId);
        const cat = prod?.category || 'General';
        salesByCategory[cat] = (salesByCategory[cat] || 0) + it.subtotal;
      });
    });

    return {
      totalRevenue,
      netStoreRevenue,
      affiliateEarningsConfirmed,
      totalOrders,
      totalProducts: this.data.products.length,
      totalAffiliates: this.data.affiliates.length,
      pendingApplications: this.data.applications.filter(a => a.status === 'pending').length,
      lowStockProducts,
      totalInventoryValue,
      salesByCategory,
      deliveryBreakdown,
      recentOrders: this.data.orders.slice(0, 10),
    };
  }

  getAuditLogs(): AuditLog[] {
    return this.data.auditLogs.slice(-100).reverse();
  }

  private addAuditLog(actor: string, action: string, target: string, details: Record<string, any>) {
    this.data.auditLogs.push({
      id: `log-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`,
      actor,
      action,
      target,
      details,
      timestamp: new Date().toISOString(),
    });
  }

  // --- Auth Verification ---
  verifyAdmin(email: string, password: string):{ user: { id: string; email: string; name: string } } | null {
    const admin = this.data.adminUsers.find(a => a.email.toLowerCase() === email.toLowerCase());
    if (!admin) return null;
    if (admin.passwordHash === hashPassword(password)) {
      return { user: { id: admin.id, email: admin.email, name: admin.name } };
    }
    return null;
  }

  verifyAffiliate(email: string, password: string): { affiliate: AffiliateProfile } | { error: string } {
    const aff = this.data.affiliates.find(a => a.email.toLowerCase() === email.toLowerCase());
    if (!aff) {
      // Check if application is pending or rejected
      const app = this.data.applications.find(a => a.email.toLowerCase() === email.toLowerCase());
      if (app) {
        if (app.status === 'pending') {
          return { error: 'Your affiliate application is currently pending admin review. You will receive access once approved.' };
        }
        if (app.status === 'rejected') {
          return { error: `Your affiliate application was rejected. Reason: ${app.rejectionReason || 'Criteria not met'}` };
        }
      }
      return { error: 'Invalid email or password.' };
    }

    if (aff.status === 'suspended') {
      return { error: 'Your affiliate account has been suspended by an administrator. Please contact support.' };
    }

    const cred = this.data.affiliateCredentials.find(c => c.affiliateId === aff.id);
    if (!cred || cred.passwordHash === hashPassword(password)) {
      return { affiliate: aff };
    }

    return { error: 'Invalid email or password.' };
  }

  resetToDefaultSeed(): boolean {
    this.data = JSON.parse(JSON.stringify(initialData));
    this.persist();
    return true;
  }
}

export const db = new DatabaseManager();

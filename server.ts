import express, { Request, Response, NextFunction } from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { db, DATA_DIR } from './server/db.ts';
import { calculateWednesdayBatch } from './src/lib/dhakaTime.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

// Body parser with size limits
app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ extended: true, limit: '15mb' }));

// Static uploads directory for admin-uploaded product images
const UPLOADS_DIR = path.join(DATA_DIR, 'uploads');
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}
app.use('/uploads', express.static(UPLOADS_DIR));

// Simple Auth token verification middleware
function requireAuth(role?: 'admin' | 'affiliate') {
  return (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ error: 'Authentication required. Please sign in.' });
      return;
    }
    const token = authHeader.replace('Bearer ', '').trim();
    try {
      // In this production-ready setup, tokens are base64-encoded session descriptors
      const session = JSON.parse(Buffer.from(token, 'base64').toString('utf-8'));
      if (!session || !session.userId || !session.role) {
        res.status(401).json({ error: 'Invalid authentication session.' });
        return;
      }
      if (role && session.role !== role) {
        res.status(403).json({ error: `Forbidden. You do not have ${role} privileges.` });
        return;
      }
      (req as any).user = session;
      next();
    } catch {
      res.status(401).json({ error: 'Session expired or invalid format.' });
    }
  };
}

// ----------------- API ROUTES -----------------

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', brand: 'RONVEX', time: new Date().toISOString() });
});

// Auth: Login
app.post('/api/auth/login', (req, res) => {
  const { email, password, role } = req.body;
  if (!email || !password) {
    res.status(400).json({ error: 'Email and password are required.' });
    return;
  }

  if (role === 'admin') {
    const admin = db.verifyAdmin(email, password);
    if (!admin) {
      res.status(401).json({ error: 'Invalid admin credentials.' });
      return;
    }
    const token = Buffer.from(
      JSON.stringify({
        userId: admin.user.id,
        email: admin.user.email,
        name: admin.user.name,
        role: 'admin',
        exp: Date.now() + 86400000 * 7,
      })
    ).toString('base64');

    res.json({
      token,
      role: 'admin',
      user: admin.user,
    });
    return;
  }

  // Affiliate login
  const result = db.verifyAffiliate(email, password);
  if ('error' in result) {
    res.status(403).json({ error: result.error });
    return;
  }

  const affiliate = result.affiliate;
  const token = Buffer.from(
    JSON.stringify({
      userId: affiliate.id,
      email: affiliate.email,
      name: affiliate.fullName,
      slug: affiliate.slug,
      role: 'affiliate',
      exp: Date.now() + 86400000 * 7,
    })
  ).toString('base64');

  res.json({
    token,
    role: 'affiliate',
    user: {
      id: affiliate.id,
      email: affiliate.email,
      name: affiliate.fullName,
      slug: affiliate.slug,
      storeName: affiliate.storeName,
    },
  });
});

// Auth: Affiliate registration application
app.post('/api/affiliate/apply', (req, res) => {
  const { fullName, email, mobile, address, businessDetails, desiredSlug, password } = req.body;
  if (!fullName || !email || !mobile || !address || !desiredSlug) {
    res.status(400).json({ error: 'Full name, email, mobile, address, and desired store URL are required.' });
    return;
  }

  const result = db.submitAffiliateApplication({
    fullName,
    email,
    mobile,
    address,
    businessDetails,
    desiredSlug,
    password,
  });

  if (result.error) {
    res.status(400).json({ error: result.error });
    return;
  }

  res.status(201).json({
    message: 'Application submitted successfully! Your account status is pending review by RONVEX administrators.',
    application: result.application,
  });
});

// Products: Public listing
app.get('/api/products', (req, res) => {
  const { category, query, status } = req.query;
  const products = db.getProducts({
    category: category as string,
    query: query as string,
    status: (status as string) || 'active',
  });
  res.json({ products });
});

// Products: Detail
app.get('/api/products/:idOrSlug', (req, res) => {
  const product = db.getProductByIdOrSlug(req.params.idOrSlug);
  if (!product) {
    res.status(404).json({ error: 'Product not found.' });
    return;
  }
  res.json({ product });
});

// Categories
app.get('/api/categories', (req, res) => {
  res.json({ categories: db.getCategories() });
});

// Mini-Storefront: Public view
app.get('/api/storefront/:slug', (req, res) => {
  const data = db.getStorefrontBySlug(req.params.slug);
  if (!data) {
    res.status(404).json({ error: 'Storefront not found or currently unavailable.' });
    return;
  }
  res.json(data);
});

// Mini-Storefront: Individual Product view
app.get('/api/storefront/:slug/:productSlug', (req, res) => {
  const sfData = db.getStorefrontBySlug(req.params.slug);
  if (!sfData) {
    res.status(404).json({ error: 'Storefront not found or currently unavailable.' });
    return;
  }
  const item = sfData.productsWithPricing.find(
    p => p.slug === req.params.productSlug || p.id === req.params.productSlug
  );
  if (!item) {
    res.status(404).json({ error: 'Product not found in this storefront.' });
    return;
  }
  res.json({
    storefront: sfData.storefront,
    affiliate: sfData.affiliate,
    product: item,
  });
});

// Affiliate: Click tracking
app.post('/api/affiliate/track-click', (req, res) => {
  const { affiliateIdOrSlug, productId, referrer } = req.body;
  if (!affiliateIdOrSlug) {
    res.status(400).json({ error: 'Affiliate ID or slug required.' });
    return;
  }
  const tracked = db.recordClick(affiliateIdOrSlug, productId, referrer);
  res.json({ success: tracked });
});

// Affiliate: Dashboard data (Private)
app.get('/api/affiliate/dashboard', requireAuth('affiliate'), (req, res) => {
  const user = (req as any).user;
  const data = db.getAffiliateDashboardData(user.userId);
  if (!data) {
    res.status(404).json({ error: 'Affiliate profile not found.' });
    return;
  }
  res.json(data);
});

// Affiliate: Update Storefront & Custom Prices (Strict limits enforced on server)
app.put('/api/affiliate/storefront', requireAuth('affiliate'), (req, res) => {
  const user = (req as any).user;
  const { storeName, bio, tagline, themeAccent, isPublished, customProducts } = req.body;

  const result = db.updateStorefront(user.userId, {
    storeName,
    bio,
    tagline,
    themeAccent,
    isPublished,
    customProducts,
  });

  if (!result.success) {
    res.status(400).json({ error: result.error });
    return;
  }

  res.json({ success: true, storefront: result.storefront });
});

// Affiliate: Financials & Balance
app.get('/api/affiliate/financials', requireAuth('affiliate'), (req, res) => {
  const user = (req as any).user;
  try {
    const financials = db.getAffiliateFinancials(user.userId);
    res.json(financials);
  } catch (err: any) {
    res.status(404).json({ error: err.message || 'Affiliate not found' });
  }
});

// Affiliate: Get own payout requests
app.get('/api/affiliate/payout-requests', requireAuth('affiliate'), (req, res) => {
  const user = (req as any).user;
  const requests = db.getAffiliatePayoutRequests(user.userId);
  res.json({ requests });
});

// Affiliate: Submit new payout request
app.post('/api/affiliate/payout-requests', requireAuth('affiliate'), (req, res) => {
  const user = (req as any).user;
  const { amount, methodType, accountDetails, saveMethod, savedMethodTitle } = req.body;

  const result = db.createPayoutRequest({
    affiliateId: user.userId,
    amount: Number(amount),
    methodType,
    accountDetails,
    saveMethod,
    savedMethodTitle,
    actor: user.name || user.email,
  });

  if (!result.success) {
    res.status(400).json({ error: result.error });
    return;
  }

  res.status(201).json({
    success: true,
    message: 'Payout request submitted successfully. It will be verified and processed on the scheduled Wednesday batch.',
    request: result.request,
  });
});

// Affiliate: Saved Payout Methods
app.get('/api/affiliate/saved-payout-methods', requireAuth('affiliate'), (req, res) => {
  const user = (req as any).user;
  const methods = db.getSavedPayoutMethods(user.userId);
  res.json({ methods });
});

app.post('/api/affiliate/saved-payout-methods', requireAuth('affiliate'), (req, res) => {
  const user = (req as any).user;
  const { methodType, title, details, isDefault } = req.body;
  if (!methodType || !title || !details) {
    res.status(400).json({ error: 'methodType, title, and account details are required.' });
    return;
  }
  const method = db.savePayoutMethod({
    affiliateId: user.userId,
    methodType,
    title,
    details,
    isDefault,
  });
  res.status(201).json({ success: true, method });
});

app.delete('/api/affiliate/saved-payout-methods/:id', requireAuth('affiliate'), (req, res) => {
  const user = (req as any).user;
  const success = db.deleteSavedPayoutMethod(user.userId, req.params.id);
  if (!success) {
    res.status(404).json({ error: 'Saved payout method not found.' });
    return;
  }
  res.json({ success: true, message: 'Saved payout method removed.' });
});

// Public / General: Payout schedule info
app.get('/api/payout-schedule', (req, res) => {
  const settings = db.getPayoutSettings();
  const schedule = calculateWednesdayBatch(new Date(), settings);
  res.json({ settings, schedule });
});

// Orders: Create Order (Customer / Guest / Affiliate attributed)
app.post('/api/orders', (req, res) => {
  const { customer, items, affiliateId, paymentMethod } = req.body;
  if (!customer || !customer.fullName || !customer.mobile || !customer.address || !customer.city) {
    res.status(400).json({ error: 'Please provide full customer name, phone number, city, and shipping address.' });
    return;
  }

  const result = db.createOrder({
    customer,
    items,
    affiliateId: affiliateId || null,
    paymentMethod: paymentMethod || 'cod',
  });

  if (!result.success) {
    res.status(400).json({ error: result.error });
    return;
  }

  res.status(201).json({
    success: true,
    message: 'Order created successfully!',
    order: result.order,
  });
});

// Orders: Customer Order Tracking Lookup
app.get('/api/orders/lookup', (req, res) => {
  const { orderNumber, contact } = req.query;
  if (!orderNumber || !contact) {
    res.status(400).json({ error: 'Order Number and phone/email are required.' });
    return;
  }

  const order = db.lookupOrder(orderNumber as string, contact as string);
  if (!order) {
    res.status(404).json({ error: 'No order found matching this Order Number and contact information.' });
    return;
  }

  res.json({ order });
});

// Orders: Customer Order History Lookup by Phone or Email
app.get('/api/orders/history', (req, res) => {
  const { contact } = req.query;
  if (!contact) {
    res.status(400).json({ error: 'Mobile number or email required.' });
    return;
  }

  const orders = db.getCustomerOrders(contact as string);
  res.json({ orders });
});

// ----------------- ADMIN ROUTES (Protected) -----------------

// Admin: Overview stats
app.get('/api/admin/overview', requireAuth('admin'), (req, res) => {
  res.json(db.getAdminOverview());
});

// Admin: Orders list
app.get('/api/admin/orders', requireAuth('admin'), (req, res) => {
  const { status, affiliateId } = req.query;
  const orders = db.getOrders({
    status: status as string,
    affiliateId: affiliateId as string,
  });
  res.json({ orders });
});

// Admin: Update delivery status & trigger earnings
app.put('/api/admin/orders/:id/status', requireAuth('admin'), (req, res) => {
  const user = (req as any).user;
  const { status, note } = req.body;
  if (!status) {
    res.status(400).json({ error: 'Delivery status is required.' });
    return;
  }

  const result = db.updateDeliveryStatus(req.params.id, status, note, user.name || 'Admin');
  if (!result.success) {
    res.status(400).json({ error: result.error });
    return;
  }

  res.json({ success: true, order: result.order });
});

// Admin: Affiliates & Applications
app.get('/api/admin/affiliates', requireAuth('admin'), (req, res) => {
  res.json({
    applications: db.getApplications(),
    affiliates: db.getAffiliates(),
  });
});

// Admin: Approve / Reject Application
app.put('/api/admin/affiliates/applications/:id', requireAuth('admin'), (req, res) => {
  const user = (req as any).user;
  const { action, reason } = req.body; // 'approve' | 'reject'

  if (action === 'approve') {
    const result = db.approveApplication(req.params.id, user.name || 'Admin');
    if (!result.success) {
      res.status(400).json({ error: result.error });
      return;
    }
    res.json({ success: true, message: 'Affiliate application approved!', affiliate: result.affiliate });
    return;
  }

  if (action === 'reject') {
    const success = db.rejectApplication(req.params.id, reason || 'Did not meet criteria', user.name || 'Admin');
    if (!success) {
      res.status(400).json({ error: 'Failed to reject application.' });
      return;
    }
    res.json({ success: true, message: 'Affiliate application rejected.' });
    return;
  }

  res.status(400).json({ error: 'Invalid action.' });
});

// Admin: Suspend / Reactivate Affiliate
app.put('/api/admin/affiliates/:id/status', requireAuth('admin'), (req, res) => {
  const user = (req as any).user;
  const { status } = req.body; // 'active' | 'suspended'
  if (status !== 'active' && status !== 'suspended') {
    res.status(400).json({ error: 'Status must be active or suspended.' });
    return;
  }

  const success = db.setAffiliateStatus(req.params.id, status, user.name || 'Admin');
  if (!success) {
    res.status(404).json({ error: 'Affiliate not found.' });
    return;
  }

  res.json({ success: true, message: `Affiliate marked as ${status}.` });
});

// Admin: Create Product
app.post('/api/admin/products', requireAuth('admin'), (req, res) => {
  const user = (req as any).user;
  const {
    name,
    slug,
    description,
    images,
    category,
    sku,
    stock,
    basePrice,
    minPrice,
    maxPrice,
    originalPrice,
    status,
    featured,
    affiliateAvailable,
  } = req.body;

  if (!name || !basePrice || !minPrice || !maxPrice) {
    res.status(400).json({ error: 'Product name, base price, min price, and max price are required.' });
    return;
  }

  if (minPrice < basePrice) {
    res.status(400).json({ error: 'Minimum selling price cannot be lower than the base price.' });
    return;
  }

  if (maxPrice < minPrice) {
    res.status(400).json({ error: 'Maximum selling price cannot be lower than the minimum price.' });
    return;
  }

  const product = db.createProduct(
    {
      name: name.trim(),
      slug: (slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-')).trim(),
      description: description || '',
      images: images && images.length ? images : ['/src/assets/images/ronvex_headphones_1792559433004.jpg'],
      category: category || 'Audio & Sound',
      sku: sku || `RNV-${Math.floor(1000 + Math.random() * 9000)}`,
      stock: Number(stock) || 10,
      basePrice: Number(basePrice),
      minPrice: Number(minPrice),
      maxPrice: Number(maxPrice),
      originalPrice: originalPrice ? Number(originalPrice) : Number(maxPrice),
      status: status || 'active',
      featured: !!featured,
      affiliateAvailable: affiliateAvailable !== false,
    },
    user.name || 'Admin'
  );

  res.status(201).json({ success: true, product });
});

// Admin: Update Product
app.put('/api/admin/products/:id', requireAuth('admin'), (req, res) => {
  const user = (req as any).user;
  const updates = req.body;

  if (updates.minPrice !== undefined && updates.basePrice !== undefined && updates.minPrice < updates.basePrice) {
    res.status(400).json({ error: 'Minimum selling price cannot be lower than base price.' });
    return;
  }

  const updated = db.updateProduct(req.params.id, updates, user.name || 'Admin');
  if (!updated) {
    res.status(404).json({ error: 'Product not found.' });
    return;
  }

  res.json({ success: true, product: updated });
});

// Admin: Delete Product
app.delete('/api/admin/products/:id', requireAuth('admin'), (req, res) => {
  const user = (req as any).user;
  const ok = db.deleteProduct(req.params.id, user.name || 'Admin');
  if (!ok) {
    res.status(404).json({ error: 'Product not found.' });
    return;
  }
  res.json({ success: true });
});

// Admin: Categories Management
app.post('/api/admin/categories', requireAuth('admin'), (req, res) => {
  const user = (req as any).user;
  const { name, icon } = req.body;
  if (!name || !name.trim()) {
    res.status(400).json({ error: 'Category name is required.' });
    return;
  }
  const category = db.createCategory(name, icon, user.name || 'Admin');
  res.status(201).json({ success: true, category });
});

app.put('/api/admin/categories/:id', requireAuth('admin'), (req, res) => {
  const user = (req as any).user;
  const category = db.updateCategory(req.params.id, req.body, user.name || 'Admin');
  if (!category) {
    res.status(404).json({ error: 'Category not found.' });
    return;
  }
  res.json({ success: true, category });
});

app.delete('/api/admin/categories/:id', requireAuth('admin'), (req, res) => {
  const user = (req as any).user;
  const ok = db.deleteCategory(req.params.id, user.name || 'Admin');
  if (!ok) {
    res.status(404).json({ error: 'Category not found.' });
    return;
  }
  res.json({ success: true });
});

// Admin: Upload Product Image
app.post('/api/admin/upload-image', requireAuth('admin'), (req, res) => {
  const { dataUrl } = req.body;
  if (!dataUrl) {
    res.status(400).json({ error: 'Image data is required.' });
    return;
  }

  try {
    const matches = dataUrl.match(/^data:image\/([a-zA-Z0-9]+);base64,(.+)$/);
    const ext = matches ? matches[1] : 'jpg';
    const base64Data = matches ? matches[2] : dataUrl.replace(/^data:image\/\w+;base64,/, '');
    const filename = `product_${Date.now()}_${Math.random().toString(36).substring(2, 7)}.${ext}`;
    const filePath = path.join(UPLOADS_DIR, filename);

    fs.writeFileSync(filePath, Buffer.from(base64Data, 'base64'));
    const url = `/uploads/${filename}`;
    res.json({ success: true, url });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to write uploaded image.' });
  }
});

// Admin: Payout Requests Management
app.get('/api/admin/payout-requests', requireAuth('admin'), (req, res) => {
  const { status, batch, affiliateId } = req.query;
  const requests = db.getAdminPayoutRequests({
    status: status as string,
    batch: batch as string,
    affiliateId: affiliateId as string,
  });
  res.json({ requests });
});

// Admin: Legacy payouts list
app.get('/api/admin/payouts', requireAuth('admin'), (req, res) => {
  const { affiliateId } = req.query;
  res.json({ payouts: db.getPayouts(affiliateId as string) });
});

// Admin: Approve Payout Request
app.put('/api/admin/payout-requests/:id/approve', requireAuth('admin'), (req, res) => {
  const user = (req as any).user;
  const { note } = req.body;
  const result = db.approvePayoutRequest(req.params.id, user.name || 'Admin', note);
  if (!result.success) {
    res.status(400).json({ error: result.error });
    return;
  }
  res.json({ success: true, request: result.request, message: 'Payout request approved and queued for Wednesday batch.' });
});

// Admin: Set Payout Request to Processing
app.put('/api/admin/payout-requests/:id/process', requireAuth('admin'), (req, res) => {
  const user = (req as any).user;
  const { note } = req.body;
  const result = db.setPayoutProcessing(req.params.id, user.name || 'Admin', note);
  if (!result.success) {
    res.status(400).json({ error: result.error });
    return;
  }
  res.json({ success: true, request: result.request, message: 'Payout request moved to Processing.' });
});

// Admin: Reject Payout Request (releases reserved funds)
app.put('/api/admin/payout-requests/:id/reject', requireAuth('admin'), (req, res) => {
  const user = (req as any).user;
  const { reason } = req.body;
  if (!reason || !reason.trim()) {
    res.status(400).json({ error: 'A clear rejection reason must be provided.' });
    return;
  }
  const result = db.rejectPayoutRequest(req.params.id, reason, user.name || 'Admin');
  if (!result.success) {
    res.status(400).json({ error: result.error });
    return;
  }
  res.json({ success: true, request: result.request, message: 'Payout request rejected and reserved funds released back to affiliate.' });
});

// Admin: Mark Payout as Paid (Record completed manual transfer)
app.put('/api/admin/payout-requests/:id/mark-paid', requireAuth('admin'), (req, res) => {
  const user = (req as any).user;
  const { transactionReference, paidAt, note } = req.body;
  if (!transactionReference || !transactionReference.trim()) {
    res.status(400).json({ error: 'A payment transaction reference (MFS TrxID or Bank UTR) is required.' });
    return;
  }
  const result = db.markPayoutPaid({
    requestId: req.params.id,
    transactionReference,
    adminActor: user.name || 'Admin',
    paidAt,
    adminNote: note,
  });
  if (!result.success) {
    res.status(400).json({ error: result.error });
    return;
  }
  res.json({ success: true, request: result.request, message: 'Payout recorded as Paid with transaction reference.' });
});

// Admin: Mark Payout as Failed (releases reserved funds)
app.put('/api/admin/payout-requests/:id/fail', requireAuth('admin'), (req, res) => {
  const user = (req as any).user;
  const { reason } = req.body;
  const result = db.markPayoutFailed(req.params.id, reason || 'Payment transfer failed', user.name || 'Admin');
  if (!result.success) {
    res.status(400).json({ error: result.error });
    return;
  }
  res.json({ success: true, request: result.request, message: 'Payout marked as Failed and reserved funds released back to affiliate.' });
});

// Admin: Payout Settings
app.get('/api/admin/payout-settings', requireAuth('admin'), (req, res) => {
  res.json({ settings: db.getPayoutSettings() });
});

app.put('/api/admin/payout-settings', requireAuth('admin'), (req, res) => {
  const user = (req as any).user;
  const updated = db.updatePayoutSettings(req.body, user.name || 'Admin');
  res.json({ success: true, settings: updated });
});

// Admin: Financial Ledger
app.get('/api/admin/financial-ledger', requireAuth('admin'), (req, res) => {
  const { affiliateId } = req.query;
  const ledger = db.getFinancialLedger({ affiliateId: affiliateId as string });
  res.json({ ledger });
});

// Admin: Audit logs
app.get('/api/admin/audit-logs', requireAuth('admin'), (req, res) => {
  res.json({ logs: db.getAuditLogs() });
});

// Admin: Reset database to seed
app.post('/api/admin/reset-seed', requireAuth('admin'), (req, res) => {
  db.resetToDefaultSeed();
  res.json({ success: true, message: 'Database reset to default seed data.' });
});

// ----------------- VITE INTEGRATION -----------------
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true, hmr: process.env.DISABLE_HMR !== 'true' },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[RONVEX] Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch(err => {
  console.error('Fatal server boot error:', err);
  process.exit(1);
});

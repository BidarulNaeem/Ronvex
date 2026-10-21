-- ====================================================================
-- RONVEX E-Commerce & Affiliate Mini-Store Platform
-- PostgreSQL / Supabase Production Schema & RLS Security Policies
-- ====================================================================

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Profiles (Admin, Affiliate, Customer)
CREATE TYPE user_role AS ENUM ('admin', 'affiliate', 'customer');
CREATE TYPE affiliate_status AS ENUM ('pending', 'approved', 'rejected', 'suspended');
CREATE TYPE delivery_status AS ENUM ('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'returned');
CREATE TYPE payment_method AS ENUM ('cod', 'bkash', 'nagad', 'card');
CREATE TYPE payment_status AS ENUM ('pending', 'paid', 'refunded');

CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    mobile TEXT,
    role user_role DEFAULT 'customer' NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 3. Affiliate Applications
CREATE TABLE affiliate_applications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    full_name TEXT NOT NULL,
    email TEXT NOT NULL,
    mobile TEXT NOT NULL,
    address TEXT NOT NULL,
    business_details TEXT,
    desired_slug TEXT UNIQUE NOT NULL,
    status affiliate_status DEFAULT 'pending' NOT NULL,
    rejection_reason TEXT,
    applied_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    reviewed_at TIMESTAMPTZ,
    reviewed_by UUID REFERENCES auth.users(id)
);

-- 4. Affiliate Profiles
CREATE TABLE affiliate_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
    application_id UUID REFERENCES affiliate_applications(id),
    slug TEXT UNIQUE NOT NULL,
    store_name TEXT NOT NULL,
    bio TEXT,
    avatar_url TEXT,
    status affiliate_status DEFAULT 'approved' NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 5. Categories
CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    icon TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 6. Products
CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    sku TEXT UNIQUE NOT NULL,
    stock INTEGER DEFAULT 0 NOT NULL,
    base_price NUMERIC(10, 2) NOT NULL CHECK (base_price >= 0),
    min_price NUMERIC(10, 2) NOT NULL CHECK (min_price >= base_price),
    max_price NUMERIC(10, 2) NOT NULL CHECK (max_price >= min_price),
    original_price NUMERIC(10, 2),
    status TEXT DEFAULT 'active' CHECK (status IN ('draft', 'active', 'inactive')),
    featured BOOLEAN DEFAULT FALSE,
    affiliate_available BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 7. Product Images
CREATE TABLE product_images (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 8. Affiliate Storefronts
CREATE TABLE affiliate_storefronts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    affiliate_id UUID UNIQUE REFERENCES affiliate_profiles(id) ON DELETE CASCADE,
    store_name TEXT NOT NULL,
    store_slug TEXT UNIQUE NOT NULL,
    bio TEXT,
    tagline TEXT,
    theme_accent TEXT DEFAULT '#0066ff',
    is_published BOOLEAN DEFAULT TRUE,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 9. Affiliate Storefront Products (Custom Selling Price within admin bounds)
CREATE TABLE affiliate_storefront_products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    storefront_id UUID REFERENCES affiliate_storefronts(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    custom_selling_price NUMERIC(10, 2) NOT NULL,
    is_featured BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    UNIQUE(storefront_id, product_id)
);

-- 10. Orders & Customer Checkout
CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_number TEXT UNIQUE NOT NULL,
    customer_name TEXT NOT NULL,
    customer_email TEXT NOT NULL,
    customer_mobile TEXT NOT NULL,
    customer_address TEXT NOT NULL,
    customer_city TEXT NOT NULL,
    customer_note TEXT,
    total_amount NUMERIC(10, 2) NOT NULL,
    affiliate_id UUID REFERENCES affiliate_profiles(id) ON DELETE SET NULL,
    payment_method payment_method DEFAULT 'cod' NOT NULL,
    payment_status payment_status DEFAULT 'pending' NOT NULL,
    delivery_status delivery_status DEFAULT 'pending' NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    delivered_at TIMESTAMPTZ
);

-- 11. Order Items (Immutable Snapshots)
CREATE TABLE order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id) ON DELETE SET NULL,
    product_name TEXT NOT NULL,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    base_price_snapshot NUMERIC(10, 2) NOT NULL,
    selling_price_snapshot NUMERIC(10, 2) NOT NULL,
    affiliate_id UUID REFERENCES affiliate_profiles(id) ON DELETE SET NULL,
    subtotal NUMERIC(10, 2) NOT NULL
);

-- 12. Affiliate Earnings (Earning = Selling Price - Base Price)
CREATE TABLE affiliate_earnings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    affiliate_id UUID REFERENCES affiliate_profiles(id) ON DELETE CASCADE,
    order_id UUID UNIQUE REFERENCES orders(id) ON DELETE CASCADE,
    gross_amount NUMERIC(10, 2) NOT NULL,
    status TEXT DEFAULT 'confirmed' CHECK (status IN ('pending', 'confirmed', 'paid', 'reversed')),
    reversal_reason TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    confirmed_at TIMESTAMPTZ,
    reversed_at TIMESTAMPTZ
);

-- 13. Affiliate Clicks Tracking
CREATE TABLE affiliate_clicks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    affiliate_id UUID REFERENCES affiliate_profiles(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id) ON DELETE SET NULL,
    referrer TEXT,
    ip_hash TEXT,
    timestamp TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 14. Audit Logs
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    actor_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    actor_name TEXT NOT NULL,
    action TEXT NOT NULL,
    target_resource TEXT NOT NULL,
    details JSONB,
    timestamp TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ====================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ====================================================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE affiliate_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE affiliate_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE affiliate_storefronts ENABLE ROW LEVEL SECURITY;
ALTER TABLE affiliate_storefront_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE affiliate_earnings ENABLE ROW LEVEL SECURITY;
ALTER TABLE affiliate_clicks ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Helper function: Is Admin
CREATE OR REPLACE FUNCTION is_admin() RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
$$ LANGUAGE sql SECURITY DEFINER;

-- Public can view active products
CREATE POLICY "Public can view active products" ON products
  FOR SELECT USING (status = 'active');

-- Admins full access to products
CREATE POLICY "Admins full access products" ON products
  FOR ALL USING (is_admin());

-- Public can view published storefronts
CREATE POLICY "Public view published storefronts" ON affiliate_storefronts
  FOR SELECT USING (is_published = true);

-- Affiliates can manage their own storefront
CREATE POLICY "Affiliates manage own storefront" ON affiliate_storefronts
  FOR ALL USING (
    affiliate_id IN (SELECT id FROM affiliate_profiles WHERE user_id = auth.uid())
  );

-- Affiliates can only view their own earnings
CREATE POLICY "Affiliates view own earnings" ON affiliate_earnings
  FOR SELECT USING (
    affiliate_id IN (SELECT id FROM affiliate_profiles WHERE user_id = auth.uid()) OR is_admin()
  );

-- Affiliates can only view their own attributed orders
CREATE POLICY "Affiliates view attributed orders" ON orders
  FOR SELECT USING (
    affiliate_id IN (SELECT id FROM affiliate_profiles WHERE user_id = auth.uid()) OR is_admin()
  );

-- Admin can manage all orders and status
CREATE POLICY "Admin manage all orders" ON orders
  FOR ALL USING (is_admin());

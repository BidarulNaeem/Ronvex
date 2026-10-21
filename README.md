# RONVEX — Complete E-Commerce & Creator Affiliate Mini-Store Platform

> **Brand Tagline:** *YOUR BRAND. YOUR VISION. YOUR FUTURE.*  
> **Brand Palette:** Deep Navy Blue (`#0a192f`), Electric Blue (`#0066ff`), White  
> **Design Tone:** Modern, sleek consumer electronics shopping platform inspired by Daraz efficiency with decentralized creator micro-stores.

---

## Architecture Overview

RONVEX combines direct direct-to-consumer (D2C) e-commerce with automated affiliate mini-stores.

- **Full-Stack Runtime:** Node.js + Express backend integrated with Vite React 19 SPA (`server.ts`).
- **Database & Persistence:** Built-in atomic persistent database (`server/db.ts` saved to `data/ronvex_db.json`) plus production-ready PostgreSQL / Supabase schema with complete Row Level Security (RLS) policies in `supabase_schema.sql`.
- **Role-Based Access Control (RBAC):**
  - **Admin:** Super administrator dashboard for order delivery workflows, product base price & min/max allowed price rules, affiliate application reviews, and audit logs.
  - **Affiliate:** Dedicated partner dashboard with custom price editor within admin limits, real-time profit margin calculator, live storefront at `/store/[slug]`, click tracking, and earnings reports.
  - **Customer:** Direct product browsing, contiguous purchase modules, cart slide-over, Cash on Delivery / mobile banking checkout, order confirmation, and live order lookup (`RNV-2026-XXXXX`).

---

## Affiliate Pricing & Earning Formula

The system enforces strict server-side validation:

$$\text{Affiliate Gross Earning} = (\text{Affiliate Selling Price} - \text{Admin Base Price}) \times \text{Quantity}$$

- **Admin Base Price:** Wholesale floor cost set by admin (e.g. ৳4,200).
- **Price Limits:** Admin sets `minPrice` (e.g. ৳4,200) and `maxPrice` (e.g. ৳5,800).
- **Affiliate Custom Price:** Set by the affiliate within the allowed bounds (e.g. ৳5,100).
- **Delivered Order Trigger:** When marked as **Delivered** in the admin panel, the system calculates and locks the affiliate earning snapshot exactly once.
- **Reversal Safety:** If an order transitions to **Cancelled** or **Returned**, earnings are immediately marked as reversed in the audit trail.

---

## Quick Testing Credentials

| Role | Email | Password | Details |
| :--- | :--- | :--- | :--- |
| **Super Admin** | `admin@ronvex.com` | `admin123` | Full access to order status, catalog pricing limits, and approvals |
| **Approved Affiliate** | `affiliate@ronvex.com` | `affiliate123` | Active partner "Naeem Ahmed" (`/store/naeem`) |
| **Pending Applicant** | `applicant@ronvex.com` | `password123` | Test pending state |

---

## Acceptance Test Workflows

1. **Direct Customer Shopping:**
   - Browse catalog by categories: Audio & Sound, Smart Wearables, Computer Accessories, Power & Charging.
   - Click any product to open the contiguous purchase module with full specs and quantity selectors.
   - Add to bag or click **Buy Now** to open the checkout form with Cash on Delivery or bKash/Nagad/Card.
   - Complete checkout to receive a unique tracking number (e.g., `RNV-2026-89412`).
   - Track live progress in **Track Order**.

2. **Affiliate Application & Approval:**
   - Click **Become an Affiliate** in the header or footer.
   - Fill in full name, mobile, mailing address, desired URL slug (e.g. `yourname`), and content channel info.
   - Application is submitted with status `pending`.
   - Log in as Admin (`admin@ronvex.com` / `admin123`) $\to$ **Affiliates & Approvals** $\to$ click **Approve**.
   - The applicant is automatically provisioned with a live mini-store at `/store/yourname`!

3. **Affiliate Mini-Store & Custom Pricing:**
   - Log in as Affiliate (`affiliate@ronvex.com` / `affiliate123`).
   - In **Mini-Storefront Customizer**, edit your store tagline and customize selling prices.
   - Notice the live profit margin per order indicator (e.g. `+৳900 / order`).
   - Click **Save & Publish Store**.
   - Open `/store/naeem` or click **Open Public Storefront** to see your branded shop.
   - Purchases through this link automatically attribute gross earnings to you!

4. **Delivery & Earning Workflow:**
   - Admin goes to **Orders & Delivery**.
   - Changes order status from `shipped` to `delivered`.
   - The system validates and registers the affiliate gross earning snapshot idempotently.
   - The affiliate dashboard immediately reflects the updated **Confirmed Earnings**.

---

## Deployment & Setup

```bash
# 1. Install dependencies
npm install

# 2. Run local development server
npm run dev

# 3. Build for production
npm run build

# 4. Start production server
npm start
```

export type UserRole = 'admin' | 'affiliate' | 'customer';

export interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string;
}

export interface PayoutRecord {
  id: string;
  affiliateId: string;
  affiliateName: string;
  amount: number;
  paymentReference: string;
  paidAt: string;
  paidBy: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  images: string[];
  category: string;
  sku: string;
  stock: number;
  basePrice: number; // Admin cost / floor
  minPrice: number;  // Minimum allowed affiliate selling price
  maxPrice: number;  // Maximum allowed affiliate selling price
  originalPrice?: number; // Retail MSRP / discount anchor
  status: 'draft' | 'active' | 'inactive';
  featured: boolean;
  affiliateAvailable: boolean;
  createdAt: string;
  updatedAt: string;
}

export type AffiliateStatus = 'pending' | 'approved' | 'rejected' | 'suspended';

export interface AffiliateApplication {
  id: string;
  fullName: string;
  email: string;
  mobile: string;
  address: string;
  businessDetails?: string;
  desiredSlug: string;
  status: AffiliateStatus;
  rejectionReason?: string;
  appliedAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
}

export interface AffiliateProfile {
  id: string;
  applicationId: string;
  fullName: string;
  email: string;
  mobile: string;
  slug: string; // e.g. "naeem" -> /store/naeem
  storeName: string;
  bio?: string;
  avatarUrl?: string;
  bannerUrl?: string;
  status: 'active' | 'suspended';
  createdAt: string;
}

export interface StorefrontCustomProduct {
  productId: string;
  customSellingPrice: number; // Must be between product.minPrice and product.maxPrice
  isFeatured?: boolean;
}

export interface StorefrontConfig {
  id: string;
  affiliateId: string;
  storeName: string;
  storeSlug: string;
  bio: string;
  tagline?: string;
  themeAccent?: string;
  isPublished: boolean;
  customProducts: StorefrontCustomProduct[];
  updatedAt: string;
}

export interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  basePriceSnapshot: number;    // Immutable admin base price snapshot
  sellingPriceSnapshot: number; // Immutable customer paid price snapshot
  affiliateId: string | null;   // Snapshot of attributing affiliate
  image?: string;
  subtotal: number;
}

export type DeliveryStatus = 
  | 'pending'
  | 'confirmed'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'cancelled'
  | 'returned';

export type PaymentMethod = 'cod' | 'bkash' | 'nagad' | 'card';
export type PaymentStatus = 'pending' | 'paid' | 'refunded';

export interface CustomerInfo {
  fullName: string;
  email: string;
  mobile: string;
  address: string;
  city: string;
  note?: string;
}

export interface Order {
  id: string;
  orderNumber: string; // e.g. RNV-2026-7842
  customer: CustomerInfo;
  items: OrderItem[];
  totalAmount: number;
  affiliateId: string | null;
  affiliateSlug?: string | null;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  deliveryStatus: DeliveryStatus;
  statusHistory: {
    status: DeliveryStatus;
    timestamp: string;
    note?: string;
    actor: string;
  }[];
  createdAt: string;
  updatedAt: string;
  deliveredAt?: string;
}

export interface AffiliateEarning {
  id: string;
  affiliateId: string;
  orderId: string;
  orderNumber: string;
  grossAmount: number; // (sellingPriceSnapshot - basePriceSnapshot) * qty
  status: 'pending' | 'confirmed' | 'paid' | 'reversed';
  createdAt: string;
  confirmedAt?: string;
  reversedAt?: string;
  reversalReason?: string;
}

export interface AffiliateClick {
  id: string;
  affiliateId: string;
  productId?: string;
  referrer: string;
  timestamp: string;
  ipHash?: string;
}

export interface AuditLog {
  id: string;
  actor: string;
  action: string;
  target: string;
  details: Record<string, any>;
  timestamp: string;
}

export interface AuthSession {
  token: string;
  role: UserRole;
  user: {
    id: string;
    email: string;
    name: string;
    slug?: string;
    status?: AffiliateStatus;
  };
}

// ====================================================================
// AFFILIATE MANUAL PAYOUT SYSTEM DOMAIN TYPES
// ====================================================================

export type PayoutMethodType = 'bkash' | 'nagad' | 'bank';

export type PayoutStatus =
  | 'pending'     // Newly submitted by affiliate, awaiting admin review
  | 'approved'    // Reviewed & queued for upcoming Wednesday batch
  | 'processing'  // Admin currently executing manual transfer
  | 'paid'        // Successfully paid and recorded with transaction reference
  | 'rejected'    // Rejected by admin with reason (funds released back)
  | 'failed';     // Transfer failed / bounced (funds released back)

export interface BkashAccountDetails {
  accountNumber: string; // 11-digit mobile number
  accountType: 'personal' | 'merchant' | 'agent';
}

export interface NagadAccountDetails {
  accountNumber: string; // 11-digit mobile number
  accountType: 'personal' | 'merchant';
}

export interface BankAccountDetails {
  accountHolderName: string;
  bankName: string;
  branchName: string;
  accountNumber: string;
  routingNumber?: string;
}

export type PayoutAccountDetails =
  | ({ methodType: 'bkash' } & BkashAccountDetails)
  | ({ methodType: 'nagad' } & NagadAccountDetails)
  | ({ methodType: 'bank' } & BankAccountDetails);

export interface SavedPayoutMethod {
  id: string;
  affiliateId: string;
  methodType: PayoutMethodType;
  title: string;
  details: PayoutAccountDetails;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PayoutRequest {
  id: string;
  requestNumber: string; // e.g. RNV-PAY-2026-8941
  affiliateId: string;
  affiliateName: string;
  affiliateEmail: string;
  affiliateSlug: string;
  affiliateMobile: string;
  amount: number; // in BDT, minimum ৳500
  methodType: PayoutMethodType;
  accountDetails: PayoutAccountDetails;
  status: PayoutStatus;
  targetWednesdayBatch: string; // YYYY-MM-DD representing Wednesday payout day in Asia/Dhaka
  isCutoffEligible: boolean;   // true if submitted before cutoff for target batch
  submittedAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
  rejectionReason?: string;
  failureReason?: string;
  processedAt?: string;
  paidAt?: string;
  paidBy?: string;
  transactionReference?: string; // MFS TrxID or Bank UTR required when status === 'paid'
  adminNote?: string;
}

export type LedgerEntryType =
  | 'EARNING_CONFIRMED'          // + Confirmed gross profit from delivered order
  | 'PAYOUT_REQUESTED_RESERVE'   // - Reserved from available balance upon payout request
  | 'PAYOUT_RESERVE_RELEASED'    // + Released back to available balance on reject/fail
  | 'PAYOUT_COMPLETED_DEDUCTION' // Final deduction confirming completed payment
  | 'EARNING_REVERSED';          // - Reversed earnings when order is returned/cancelled

export interface FinancialLedgerEntry {
  id: string;
  affiliateId: string;
  affiliateName: string;
  entryType: LedgerEntryType;
  amount: number;
  availableBalanceAfter: number;
  referenceType: 'order' | 'payout_request';
  referenceId: string;
  referenceNumber: string; // Order Number or Payout Request Number
  description: string;
  actor: string;
  timestamp: string;
}

export interface PayoutSettings {
  minimumPayoutAmount: number; // default: 500
  payoutDayOfWeek: number;    // default: 3 (Wednesday, 0=Sun, 1=Mon, ..., 6=Sat)
  cutoffDayOfWeek: number;    // default: 2 (Tuesday)
  cutoffHour: number;         // default: 23 (23:59 Asia/Dhaka)
  cutoffMinute: number;       // default: 59
  timezone: string;           // 'Asia/Dhaka'
  updatedAt: string;
  updatedBy: string;
}

export interface AffiliateFinancials {
  availableBalance: number;       // Genuinely withdrawable right now
  pendingOrderEarnings: number;   // In-transit / fulfillment orders not yet delivered
  awaitingProcessingAmount: number; // In flight requests: pending + approved + processing
  totalPaidAmount: number;        // Sum of all paid requests
  lifetimeConfirmedGross: number; // Lifetime gross earnings from delivered orders
  nextScheduledWednesday: string; // ISO date or formatted date in Asia/Dhaka
  cutoffNotice: {
    nextWednesdayDate: string;
    cutoffDateTimeFormatted: string;
    isBeforeCutoff: boolean;
    daysRemaining: number;
    timezone: string;
  };
}


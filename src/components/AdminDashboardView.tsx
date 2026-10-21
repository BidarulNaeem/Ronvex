import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Package,
  ShoppingBag,
  Users,
  DollarSign,
  TrendingUp,
  Truck,
  CheckCircle2,
  XCircle,
  Plus,
  Edit2,
  Trash2,
  AlertCircle,
  RotateCcw,
  FileText,
  Save,
  X,
  UploadCloud,
  FolderPlus,
  CreditCard,
} from 'lucide-react';
import { api } from '../lib/api.ts';
import type { Order, Product, DeliveryStatus, AffiliateProfile, AffiliateApplication } from '../types/index.ts';

interface AdminDashboardViewProps {
  onBackToStore: () => void;
}

export const AdminDashboardView: React.FC<AdminDashboardViewProps> = ({ onBackToStore }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'orders' | 'products' | 'categories' | 'affiliates' | 'payouts' | 'audit'>('overview');
  const [overview, setOverview] = useState<any>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [payouts, setPayouts] = useState<any[]>([]);
  const [affiliatesData, setAffiliatesData] = useState<{ applications: AffiliateApplication[]; affiliates: AffiliateProfile[] }>({
    applications: [],
    affiliates: [],
  });
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Modals state
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [newStatus, setNewStatus] = useState<DeliveryStatus>('delivered');
  const [statusNote, setStatusNote] = useState('');

  // Product edit/create state
  const [editingProduct, setEditingProduct] = useState<Partial<Product> | null>(null);
  const [isCreatingProduct, setIsCreatingProduct] = useState(false);

  // Category modal state
  const [editingCategory, setEditingCategory] = useState<{ id?: string; name: string; icon: string } | null>(null);

  // Payout modal state
  const [payoutModal, setPayoutModal] = useState<{ affiliateId: string; affiliateName: string; maxAmount: number; amount: number; reference: string } | null>(null);

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    try {
      setLoading(true);
      const [ov, ords, prods, cats, affs, logs, pays] = await Promise.all([
        api.getAdminOverview(),
        api.getAdminOrders(),
        api.getProducts({ status: '' }),
        api.getCategories(),
        api.getAdminAffiliates(),
        api.getAuditLogs(),
        api.getPayouts(),
      ]);
      setOverview(ov);
      setOrders(ords.orders);
      setProducts(prods.products);
      setCategories(cats.categories);
      setAffiliatesData(affs);
      setAuditLogs(logs.logs);
      setPayouts(pays.payouts || []);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to fetch admin data.');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateDeliveryStatus = async () => {
    if (!selectedOrder) return;
    try {
      setErrorMsg('');
      const res = await api.updateDeliveryStatus(selectedOrder.id, newStatus, statusNote);
      if (res.success) {
        setSuccessMsg(`Order ${selectedOrder.orderNumber} updated to ${newStatus}. Earning calculations updated.`);
        setSelectedOrder(null);
        setStatusNote('');
        loadAllData();
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to update order status.');
    }
  };

  const handleApproveApplication = async (appId: string) => {
    try {
      setErrorMsg('');
      const res = await api.reviewApplication(appId, 'approve');
      if (res.success) {
        setSuccessMsg(`Affiliate approved! Personal mini-store /store/${res.affiliate?.slug} has been provisioned.`);
        loadAllData();
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to approve application.');
    }
  };

  const handleRejectApplication = async (appId: string) => {
    const reason = window.prompt('Enter rejection reason:') || 'Criteria not met';
    try {
      setErrorMsg('');
      const res = await api.reviewApplication(appId, 'reject', reason);
      if (res.success) {
        setSuccessMsg('Affiliate application rejected.');
        loadAllData();
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to reject application.');
    }
  };

  const handleToggleAffiliateStatus = async (affiliateId: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'active' ? 'suspended' : 'active';
    try {
      setErrorMsg('');
      const res = await api.setAffiliateStatus(affiliateId, nextStatus);
      if (res.success) {
        setSuccessMsg(`Affiliate ${nextStatus === 'suspended' ? 'suspended' : 'reactivated'}.`);
        loadAllData();
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to change affiliate status.');
    }
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;

    try {
      setErrorMsg('');
      if (isCreatingProduct) {
        const res = await api.createProduct(editingProduct);
        if (res.success) {
          setSuccessMsg(`Product "${res.product.name}" added to catalog.`);
          setIsCreatingProduct(false);
          setEditingProduct(null);
          loadAllData();
        }
      } else if (editingProduct.id) {
        const res = await api.updateProduct(editingProduct.id, editingProduct);
        if (res.success) {
          setSuccessMsg(`Product "${res.product.name}" updated successfully.`);
          setEditingProduct(null);
          loadAllData();
        }
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to save product.');
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    try {
      const res = await api.deleteProduct(id);
      if (res.success) {
        setSuccessMsg('Product removed.');
        loadAllData();
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to delete product.');
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 8 * 1024 * 1024) {
      setErrorMsg('Image size should be under 8MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = async () => {
      try {
        setUploadingImage(true);
        setErrorMsg('');
        const base64 = reader.result as string;
        const res = await api.uploadProductImage(base64);
        if (res.success && res.url) {
          setEditingProduct(prev => prev ? {
            ...prev,
            images: [res.url, ...(prev.images || [])],
          } : null);
          setSuccessMsg('Product image uploaded successfully!');
        }
      } catch (err: any) {
        setErrorMsg(err.message || 'Image upload failed.');
      } finally {
        setUploadingImage(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCategory || !editingCategory.name.trim()) return;

    try {
      setErrorMsg('');
      if (editingCategory.id) {
        await api.updateCategory(editingCategory.id, {
          name: editingCategory.name.trim(),
          icon: editingCategory.icon || 'Zap',
        });
        setSuccessMsg(`Category "${editingCategory.name}" updated.`);
      } else {
        await api.createCategory(editingCategory.name.trim(), editingCategory.icon || 'Zap');
        setSuccessMsg(`Category "${editingCategory.name}" created.`);
      }
      setEditingCategory(null);
      loadAllData();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to save category.');
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (!window.confirm('Delete this category?')) return;
    try {
      setErrorMsg('');
      await api.deleteCategory(id);
      setSuccessMsg('Category deleted.');
      loadAllData();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to delete category.');
    }
  };

  const handleProcessPayout = async () => {
    if (!payoutModal) return;
    try {
      setErrorMsg('');
      const res = await api.recordPayout(
        payoutModal.affiliateId,
        payoutModal.amount,
        payoutModal.reference
      );
      if (res.success) {
        setSuccessMsg(`Payout of ৳${payoutModal.amount.toLocaleString()} settled for ${payoutModal.affiliateName}.`);
        setPayoutModal(null);
        loadAllData();
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to record payout.');
    }
  };

  const handleResetSeed = async () => {
    if (!window.confirm('Reset database to clean default seed data?')) return;
    try {
      await api.resetSeedData();
      setSuccessMsg('Database reset to clean demo seed state.');
      loadAllData();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to reset seed.');
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <div className="w-8 h-8 border-3 border-[#0066ff] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-xs text-slate-500 font-medium">Loading administrative dashboard...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
      {/* Top Header Bar */}
      <div className="bg-[#0a192f] text-white p-6 rounded-2xl border border-slate-800 shadow-md flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#38bdf8] bg-blue-950 px-2 py-0.5 rounded border border-blue-500/30">
              Super Admin Console
            </span>
            <span className="text-xs text-emerald-400 font-medium">Authenticated</span>
          </div>
          <h1 className="text-2xl font-black tracking-tight mt-1">RONVEX Platform Management</h1>
          <p className="text-xs text-slate-300">
            Control product price bounds, approve affiliate applications, and orchestrate delivery status & earnings.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleResetSeed}
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Reset to initial test seed data"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Demo Seed</span>
          </button>

          <button
            onClick={onBackToStore}
            className="px-3.5 py-1.5 rounded-lg bg-[#0066ff] hover:bg-[#0052cc] text-white text-xs font-semibold transition-colors cursor-pointer"
          >
            Go to Storefront
          </button>
        </div>
      </div>

      {/* Alerts */}
      {successMsg && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-700 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successMsg}</span>
          </div>
          <button onClick={() => setSuccessMsg('')} className="text-emerald-500 hover:text-emerald-800 cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {errorMsg && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            <span>{errorMsg}</span>
          </div>
          <button onClick={() => setErrorMsg('')} className="text-red-500 hover:text-red-800 cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto no-scrollbar">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2 text-xs font-bold rounded-lg transition-colors cursor-pointer flex items-center gap-2 ${
            activeTab === 'overview'
              ? 'bg-[#0066ff] text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 bg-slate-100'
          }`}
        >
          <TrendingUp className="w-3.5 h-3.5" />
          <span>Overview</span>
        </button>

        <button
          onClick={() => setActiveTab('orders')}
          className={`px-4 py-2 text-xs font-bold rounded-lg transition-colors cursor-pointer flex items-center gap-2 ${
            activeTab === 'orders'
              ? 'bg-[#0066ff] text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 bg-slate-100'
          }`}
        >
          <Truck className="w-3.5 h-3.5" />
          <span>Orders & Delivery ({orders.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('products')}
          className={`px-4 py-2 text-xs font-bold rounded-lg transition-colors cursor-pointer flex items-center gap-2 ${
            activeTab === 'products'
              ? 'bg-[#0066ff] text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 bg-slate-100'
          }`}
        >
          <Package className="w-3.5 h-3.5" />
          <span>Product Catalog ({products.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('categories')}
          className={`px-4 py-2 text-xs font-bold rounded-lg transition-colors cursor-pointer flex items-center gap-2 ${
            activeTab === 'categories'
              ? 'bg-[#0066ff] text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 bg-slate-100'
          }`}
        >
          <FolderPlus className="w-3.5 h-3.5" />
          <span>Categories ({categories.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('affiliates')}
          className={`px-4 py-2 text-xs font-bold rounded-lg transition-colors cursor-pointer flex items-center gap-2 ${
            activeTab === 'affiliates'
              ? 'bg-[#0066ff] text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 bg-slate-100'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>
            Affiliates & Approvals (
            {affiliatesData.applications.filter((a) => a.status === 'pending').length} Pending)
          </span>
        </button>

        <button
          onClick={() => setActiveTab('payouts')}
          className={`px-4 py-2 text-xs font-bold rounded-lg transition-colors cursor-pointer flex items-center gap-2 ${
            activeTab === 'payouts'
              ? 'bg-[#0066ff] text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 bg-slate-100'
          }`}
        >
          <CreditCard className="w-3.5 h-3.5" />
          <span>Settlements & Payouts ({payouts.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('audit')}
          className={`px-4 py-2 text-xs font-bold rounded-lg transition-colors cursor-pointer flex items-center gap-2 ${
            activeTab === 'audit'
              ? 'bg-[#0066ff] text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 bg-slate-100'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>Audit Logs ({auditLogs.length})</span>
        </button>
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeTab === 'overview' && overview && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-2xs space-y-1">
              <span className="text-xs font-semibold text-slate-500">Delivered Gross Volume</span>
              <p className="text-2xl font-black text-slate-900 font-mono tabular-nums">
                ৳{overview.totalRevenue.toLocaleString()}
              </p>
              <span className="text-[11px] text-emerald-600 font-medium">Successfully completed</span>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-2xs space-y-1">
              <span className="text-xs font-semibold text-slate-500">Affiliate Commission</span>
              <p className="text-2xl font-black text-blue-600 font-mono tabular-nums">
                ৳{overview.affiliateEarningsConfirmed.toLocaleString()}
              </p>
              <span className="text-[11px] text-slate-400">Total earned by partners</span>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-2xs space-y-1">
              <span className="text-xs font-semibold text-slate-500">Total Orders</span>
              <p className="text-2xl font-black text-slate-900 font-mono tabular-nums">
                {overview.totalOrders}
              </p>
              <span className="text-[11px] text-slate-400">Across direct & stores</span>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-2xs space-y-1">
              <span className="text-xs font-semibold text-slate-500">Pending Affiliate Apps</span>
              <p className="text-2xl font-black text-amber-600 font-mono tabular-nums">
                {overview.pendingApplications}
              </p>
              <span className="text-[11px] text-amber-600 font-medium">Action required</span>
            </div>
          </div>

          {/* Delivery Status Pipeline Bar */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Order Fulfillment Pipeline
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-7 gap-2 text-center text-xs">
              {Object.entries(overview.deliveryBreakdown).map(([status, count]) => (
                <div key={status} className="p-3 rounded-lg border border-slate-200 bg-slate-50">
                  <span className="text-[11px] uppercase font-semibold text-slate-500 block">{status}</span>
                  <span className="text-lg font-black font-mono text-slate-900 tabular-nums">{count as number}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Inventory Valuation & Category Sales */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Low Stock Warning */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4 text-amber-500" />
                  <span>Stock Alerts & Inventory Health</span>
                </h3>
                <span className="text-xs font-mono font-bold text-slate-600">
                  Total Valuation: ৳{(overview.totalInventoryValue || 0).toLocaleString()}
                </span>
              </div>

              {overview.lowStockProducts && overview.lowStockProducts.length > 0 ? (
                <div className="space-y-2">
                  {overview.lowStockProducts.map((p: any) => (
                    <div key={p.id} className="flex items-center justify-between p-2.5 rounded-lg border border-amber-200 bg-amber-50/40 text-xs">
                      <div>
                        <span className="font-semibold text-slate-900">{p.name}</span>
                        <span className="text-[11px] text-slate-500 block font-mono">SKU: {p.sku}</span>
                      </div>
                      <div className="text-right">
                        <span className="font-mono font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded">
                          {p.stock} units left
                        </span>
                        <button
                          onClick={() => {
                            setEditingProduct(p);
                            setIsCreatingProduct(false);
                          }}
                          className="text-[11px] text-[#0066ff] hover:underline block mt-0.5 cursor-pointer font-semibold"
                        >
                          Restock
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-6 text-center text-xs text-slate-500 bg-slate-50 rounded-xl">
                  All catalog items have healthy inventory levels (15+ units).
                </div>
              )}
            </div>

            {/* Sales Volume by Category */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-3">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Delivered Sales by Category
              </h3>
              <div className="space-y-2 text-xs">
                {overview.salesByCategory && Object.keys(overview.salesByCategory).length > 0 ? (
                  Object.entries(overview.salesByCategory).map(([cat, vol]) => (
                    <div key={cat} className="flex items-center justify-between p-2.5 rounded-lg border border-slate-100 bg-slate-50">
                      <span className="font-semibold text-slate-800">{cat}</span>
                      <span className="font-mono font-bold text-slate-900 tabular-nums">৳{(vol as number).toLocaleString()}</span>
                    </div>
                  ))
                ) : (
                  <div className="p-6 text-center text-xs text-slate-500 bg-slate-50 rounded-xl">
                    No delivered category volume recorded yet.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: ORDERS & DELIVERY WORKFLOW */}
      {activeTab === 'orders' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900">Order & Delivery Management</h2>
              <p className="text-xs text-slate-500">
                Updating delivery status to <strong>Delivered</strong> immediately confirms eligible affiliate gross earnings exactly once. Marking as Cancelled or Returned reverses earnings.
              </p>
            </div>
          </div>

          <div className="border border-slate-200 rounded-xl overflow-x-auto">
            <table className="w-full text-left text-xs whitespace-nowrap">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                <tr>
                  <th className="p-3">Order #</th>
                  <th className="p-3">Customer</th>
                  <th className="p-3">Attributed Affiliate</th>
                  <th className="p-3">Items & Snapshot Pricing</th>
                  <th className="p-3">Total Payable</th>
                  <th className="p-3">Payment</th>
                  <th className="p-3">Delivery Status</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {orders.map((ord) => {
                  return (
                    <tr key={ord.id} className="hover:bg-slate-50">
                      <td className="p-3 font-mono font-bold text-slate-900">{ord.orderNumber}</td>
                      <td className="p-3">
                        <div className="font-medium text-slate-900">{ord.customer.fullName}</div>
                        <div className="text-[11px] text-slate-500">{ord.customer.mobile} · {ord.customer.city}</div>
                      </td>
                      <td className="p-3">
                        {ord.affiliateSlug ? (
                          <span className="font-mono text-blue-600 font-semibold">/store/{ord.affiliateSlug}</span>
                        ) : (
                          <span className="text-slate-400">Direct Purchase</span>
                        )}
                      </td>
                      <td className="p-3">
                        <div className="space-y-1">
                          {ord.items.map((item, i) => (
                            <div key={i} className="text-[11px] text-slate-700">
                              <span>{item.productName} (x{item.quantity})</span>
                              <span className="text-slate-400 ml-1">
                                [Base: ৳{item.basePriceSnapshot} | Sold: ৳{item.sellingPriceSnapshot}]
                              </span>
                            </div>
                          ))}
                        </div>
                      </td>
                      <td className="p-3 font-mono font-bold text-slate-900 tabular-nums">
                        ৳{ord.totalAmount.toLocaleString()}
                      </td>
                      <td className="p-3">
                        <span className="uppercase text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-700">
                          {ord.paymentMethod} · {ord.paymentStatus}
                        </span>
                      </td>
                      <td className="p-3">
                        <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                          ord.deliveryStatus === 'delivered' ? 'bg-emerald-100 text-emerald-800' :
                          ord.deliveryStatus === 'cancelled' || ord.deliveryStatus === 'returned' ? 'bg-red-100 text-red-800' :
                          'bg-blue-100 text-blue-800'
                        }`}>
                          {ord.deliveryStatus}
                        </span>
                      </td>
                      <td className="p-3 text-right">
                        <button
                          onClick={() => {
                            setSelectedOrder(ord);
                            setNewStatus(ord.deliveryStatus);
                            setStatusNote('');
                          }}
                          className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs rounded transition-colors cursor-pointer"
                        >
                          Update Status
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: PRODUCTS & PRICE BOUNDS */}
      {activeTab === 'products' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900">Product Catalog & Affiliate Price Rules</h2>
              <p className="text-xs text-slate-500">
                Configure base wholesale cost and strictly limit the affiliate selling range (Min Price & Max Price).
              </p>
            </div>
            <button
              onClick={() => {
                setEditingProduct({
                  name: '',
                  category: 'Audio & Sound',
                  sku: `RNV-${Math.floor(1000 + Math.random() * 9000)}`,
                  stock: 20,
                  basePrice: 2000,
                  minPrice: 2000,
                  maxPrice: 3000,
                  originalPrice: 3200,
                  status: 'active',
                  featured: false,
                  affiliateAvailable: true,
                  images: ['/src/assets/images/ronvex_headphones_1792559433004.jpg'],
                });
                setIsCreatingProduct(true);
              }}
              className="px-3 py-1.5 bg-[#0066ff] hover:bg-[#0052cc] text-white text-xs font-bold rounded-lg flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Product</span>
            </button>
          </div>

          <div className="border border-slate-200 rounded-xl overflow-x-auto">
            <table className="w-full text-left text-xs whitespace-nowrap">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                <tr>
                  <th className="p-3">Product</th>
                  <th className="p-3">Category</th>
                  <th className="p-3">Stock</th>
                  <th className="p-3">Admin Base Price</th>
                  <th className="p-3">Min Affiliate Price</th>
                  <th className="p-3">Max Affiliate Price</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {products.map((prod) => (
                  <tr key={prod.id} className="hover:bg-slate-50">
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <img
                          src={prod.images[0]}
                          alt={prod.name}
                          className="w-9 h-9 rounded object-cover bg-slate-100"
                          referrerPolicy="no-referrer"
                        />
                        <div>
                          <p className="font-semibold text-slate-900 max-w-[200px] truncate">{prod.name}</p>
                          <p className="text-[11px] text-slate-500 font-mono">{prod.sku}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-3 text-slate-600">{prod.category}</td>
                    <td className="p-3 font-mono tabular-nums font-semibold">{prod.stock}</td>
                    <td className="p-3 font-mono font-bold text-slate-900 tabular-nums">
                      ৳{prod.basePrice.toLocaleString()}
                    </td>
                    <td className="p-3 font-mono text-slate-700 tabular-nums">
                      ৳{prod.minPrice.toLocaleString()}
                    </td>
                    <td className="p-3 font-mono text-slate-700 tabular-nums">
                      ৳{prod.maxPrice.toLocaleString()}
                    </td>
                    <td className="p-3">
                      <span className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded ${
                        prod.status === 'active' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'
                      }`}>
                        {prod.status}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => {
                            setEditingProduct({ ...prod });
                            setIsCreatingProduct(false);
                          }}
                          className="p-1.5 text-slate-600 hover:text-[#0066ff] hover:bg-slate-100 rounded cursor-pointer"
                          title="Edit"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(prod.id)}
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded cursor-pointer"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3.5: CATEGORIES */}
      {activeTab === 'categories' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900">Product Categories Management</h2>
              <p className="text-xs text-slate-500">
                Organize your catalog by creating, renaming, or pruning hardware categories.
              </p>
            </div>
            <button
              onClick={() => setEditingCategory({ name: '', icon: 'Zap' })}
              className="px-3 py-1.5 bg-[#0066ff] hover:bg-[#0052cc] text-white text-xs font-bold rounded-lg flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Category</span>
            </button>
          </div>

          <div className="border border-slate-200 rounded-xl overflow-x-auto">
            <table className="w-full text-left text-xs whitespace-nowrap">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                <tr>
                  <th className="p-3">Category Name</th>
                  <th className="p-3">URL Slug</th>
                  <th className="p-3">Icon Key</th>
                  <th className="p-3">Active Products</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {categories.map((cat) => {
                  const productCount = products.filter(p => p.category.toLowerCase() === cat.name.toLowerCase()).length;
                  return (
                    <tr key={cat.id} className="hover:bg-slate-50">
                      <td className="p-3 font-semibold text-slate-900">{cat.name}</td>
                      <td className="p-3 font-mono text-slate-500">/{cat.slug}</td>
                      <td className="p-3 text-slate-600">{cat.icon}</td>
                      <td className="p-3 font-mono font-bold text-slate-700">{productCount} items</td>
                      <td className="p-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setEditingCategory(cat)}
                            className="p-1.5 text-slate-600 hover:text-[#0066ff] hover:bg-slate-100 rounded cursor-pointer"
                            title="Edit"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteCategory(cat.id)}
                            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded cursor-pointer"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: AFFILIATES & APPLICATIONS */}
      {activeTab === 'affiliates' && (
        <div className="space-y-6">
          {/* Applications Pending Section */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
            <h2 className="text-base font-bold text-slate-900">Pending Affiliate Applications</h2>
            <p className="text-xs text-slate-500">
              Review applicant identity, channel details, and requested URL slug. Approving automatically creates their account and mini-storefront.
            </p>

            {affiliatesData.applications.filter((a) => a.status === 'pending').length === 0 ? (
              <div className="p-8 text-center text-slate-500 text-xs bg-slate-50 rounded-xl">
                No pending affiliate applications at this time.
              </div>
            ) : (
              <div className="border border-slate-200 rounded-xl overflow-x-auto">
                <table className="w-full text-left text-xs whitespace-nowrap">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                    <tr>
                      <th className="p-3">Applicant Name</th>
                      <th className="p-3">Email & Mobile</th>
                      <th className="p-3">Desired Store URL</th>
                      <th className="p-3">Business / Channels</th>
                      <th className="p-3">Date Applied</th>
                      <th className="p-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {affiliatesData.applications
                      .filter((a) => a.status === 'pending')
                      .map((app) => (
                        <tr key={app.id} className="hover:bg-slate-50">
                          <td className="p-3 font-semibold text-slate-900">{app.fullName}</td>
                          <td className="p-3 text-slate-600">
                            <div>{app.email}</div>
                            <div className="text-[11px] text-slate-400">{app.mobile}</div>
                          </td>
                          <td className="p-3 font-mono font-bold text-blue-600">/store/{app.desiredSlug}</td>
                          <td className="p-3 text-slate-600 max-w-[240px] truncate" title={app.businessDetails}>
                            {app.businessDetails || 'None provided'}
                          </td>
                          <td className="p-3 text-slate-500">{new Date(app.appliedAt).toLocaleDateString()}</td>
                          <td className="p-3 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => handleApproveApplication(app.id)}
                                className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded cursor-pointer"
                              >
                                Approve
                              </button>
                              <button
                                onClick={() => handleRejectApplication(app.id)}
                                className="px-2.5 py-1 bg-red-50 hover:bg-red-100 text-red-700 font-semibold rounded cursor-pointer"
                              >
                                Reject
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Active Affiliates Section */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
            <h2 className="text-base font-bold text-slate-900">Approved Affiliate Partners</h2>
            <div className="border border-slate-200 rounded-xl overflow-x-auto">
              <table className="w-full text-left text-xs whitespace-nowrap">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                  <tr>
                    <th className="p-3">Partner Name</th>
                    <th className="p-3">Store Name</th>
                    <th className="p-3">Store URL</th>
                    <th className="p-3">Status</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {affiliatesData.affiliates.map((aff) => (
                    <tr key={aff.id} className="hover:bg-slate-50">
                      <td className="p-3 font-semibold text-slate-900">{aff.fullName}</td>
                      <td className="p-3 text-slate-700">{aff.storeName}</td>
                      <td className="p-3 font-mono text-blue-600">/store/{aff.slug}</td>
                      <td className="p-3">
                        <span className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded ${
                          aff.status === 'active' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {aff.status}
                        </span>
                      </td>
                      <td className="p-3 text-right">
                        <button
                          onClick={() => handleToggleAffiliateStatus(aff.id, aff.status)}
                          className={`px-2.5 py-1 font-semibold rounded cursor-pointer ${
                            aff.status === 'active'
                              ? 'bg-amber-50 hover:bg-amber-100 text-amber-700'
                              : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700'
                          }`}
                        >
                          {aff.status === 'active' ? 'Suspend' : 'Reactivate'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: AUDIT LOGS */}
      {activeTab === 'audit' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
          <h2 className="text-base font-bold text-slate-900">System Audit Trail</h2>
          <p className="text-xs text-slate-500">
            Immutable log of all administrative status changes, affiliate approvals, and pricing actions.
          </p>
          <div className="border border-slate-200 rounded-xl overflow-x-auto">
            <table className="w-full text-left text-xs whitespace-nowrap">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                <tr>
                  <th className="p-3">Timestamp</th>
                  <th className="p-3">Actor</th>
                  <th className="p-3">Action</th>
                  <th className="p-3">Target</th>
                  <th className="p-3">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 font-mono text-[11px]">
                {auditLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50">
                    <td className="p-3 text-slate-500">{new Date(log.timestamp).toLocaleString()}</td>
                    <td className="p-3 text-slate-900 font-semibold">{log.actor}</td>
                    <td className="p-3 text-[#0066ff]">{log.action}</td>
                    <td className="p-3 text-slate-700">{log.target}</td>
                    <td className="p-3 text-slate-500 max-w-xs truncate">{JSON.stringify(log.details)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* UPDATE DELIVERY STATUS MODAL */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Update Delivery Status</h3>
                <span className="text-xs font-mono font-semibold text-slate-500">{selectedOrder.orderNumber}</span>
              </div>
              <button onClick={() => setSelectedOrder(null)} className="text-slate-400 hover:text-slate-700 cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">New Delivery Status</label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value as DeliveryStatus)}
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-300 bg-white focus:outline-none focus:border-[#0066ff]"
                >
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="processing">Processing</option>
                  <option value="shipped">Shipped</option>
                  <option value="delivered">Delivered (Confirms Affiliate Earning)</option>
                  <option value="cancelled">Cancelled (Reverses Earning)</option>
                  <option value="returned">Returned (Reverses Earning)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Status Note / Reason</label>
                <input
                  type="text"
                  value={statusNote}
                  onChange={(e) => setStatusNote(e.target.value)}
                  placeholder="e.g. Courier Parcel Tracking ID: SA-90214"
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:outline-none focus:border-[#0066ff]"
                />
              </div>

              {newStatus === 'delivered' && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-800">
                  <strong>Earning Trigger:</strong> Marking this order as <strong>Delivered</strong> will automatically calculate and lock the eligible affiliate earnings snapshot.
                </div>
              )}

              {(newStatus === 'cancelled' || newStatus === 'returned') && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-800">
                  <strong>Reversal Trigger:</strong> Marking this order as <strong>{newStatus}</strong> will reverse any attributed earnings.
                </div>
              )}
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <button
                onClick={() => setSelectedOrder(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateDeliveryStatus}
                className="px-4 py-2 bg-[#0066ff] hover:bg-[#0052cc] text-white text-xs font-bold rounded-lg cursor-pointer"
              >
                Confirm Update
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PRODUCT CREATE / EDIT MODAL */}
      {editingProduct && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full shadow-2xl border border-slate-200 overflow-hidden p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="text-sm font-bold text-slate-900">
                {isCreatingProduct ? 'Create New Catalog Product' : `Edit Product: ${editingProduct.name}`}
              </h3>
              <button onClick={() => setEditingProduct(null)} className="text-slate-400 hover:text-slate-700 cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Product Title</label>
                <input
                  type="text"
                  required
                  value={editingProduct.name || ''}
                  onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                  className="w-full p-2.5 rounded-lg border border-slate-300 focus:outline-none focus:border-[#0066ff]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Category</label>
                  <select
                    value={editingProduct.category || 'Audio & Sound'}
                    onChange={(e) => setEditingProduct({ ...editingProduct, category: e.target.value })}
                    className="w-full p-2.5 rounded-lg border border-slate-300 bg-white focus:outline-none"
                  >
                    <option value="Audio & Sound">Audio & Sound</option>
                    <option value="Smart Wearables">Smart Wearables</option>
                    <option value="Computer Accessories">Computer Accessories</option>
                    <option value="Power & Charging">Power & Charging</option>
                    <option value="Smart Home">Smart Home</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">SKU</label>
                  <input
                    type="text"
                    required
                    value={editingProduct.sku || ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct, sku: e.target.value })}
                    className="w-full p-2.5 rounded-lg border border-slate-300 focus:outline-none font-mono"
                  />
                </div>
              </div>

              {/* Strict Pricing Rules */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                <span className="font-bold text-slate-800 block">Strict Pricing Boundaries</span>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">Admin Base Price</label>
                    <input
                      type="number"
                      required
                      value={editingProduct.basePrice || 0}
                      onChange={(e) => setEditingProduct({ ...editingProduct, basePrice: Number(e.target.value) })}
                      className="w-full p-2 rounded border border-slate-300 font-mono font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">Min Affiliate Price</label>
                    <input
                      type="number"
                      required
                      value={editingProduct.minPrice || 0}
                      onChange={(e) => setEditingProduct({ ...editingProduct, minPrice: Number(e.target.value) })}
                      className="w-full p-2 rounded border border-slate-300 font-mono font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">Max Affiliate Price</label>
                    <input
                      type="number"
                      required
                      value={editingProduct.maxPrice || 0}
                      onChange={(e) => setEditingProduct({ ...editingProduct, maxPrice: Number(e.target.value) })}
                      className="w-full p-2 rounded border border-slate-300 font-mono font-bold"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Inventory Stock</label>
                  <input
                    type="number"
                    required
                    value={editingProduct.stock || 0}
                    onChange={(e) => setEditingProduct({ ...editingProduct, stock: Number(e.target.value) })}
                    className="w-full p-2.5 rounded-lg border border-slate-300 font-mono"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Suggested Retail MSRP</label>
                  <input
                    type="number"
                    value={editingProduct.originalPrice || ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct, originalPrice: Number(e.target.value) })}
                    className="w-full p-2.5 rounded-lg border border-slate-300 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Description</label>
                <textarea
                  rows={2}
                  value={editingProduct.description || ''}
                  onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })}
                  className="w-full p-2.5 rounded-lg border border-slate-300 focus:outline-none"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setEditingProduct(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#0066ff] hover:bg-[#0052cc] text-white font-bold rounded-lg cursor-pointer flex items-center gap-1.5"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Save Product</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

import React, { useState } from 'react';
import { Search, PackageCheck, Clock, Truck, CheckCircle2, AlertCircle, ArrowLeft } from 'lucide-react';
import { api } from '../lib/api.ts';
import type { Order, DeliveryStatus } from '../types/index.ts';

interface OrderTrackingViewProps {
  initialOrderNumber?: string;
  onBack: () => void;
}

const statusSteps: { key: DeliveryStatus; label: string; icon: React.ReactNode }[] = [
  { key: 'pending', label: 'Order Received', icon: <Clock className="w-4 h-4" /> },
  { key: 'confirmed', label: 'Confirmed', icon: <PackageCheck className="w-4 h-4" /> },
  { key: 'processing', label: 'Processing & Packed', icon: <PackageCheck className="w-4 h-4" /> },
  { key: 'shipped', label: 'In Transit / Shipped', icon: <Truck className="w-4 h-4" /> },
  { key: 'delivered', label: 'Delivered', icon: <CheckCircle2 className="w-4 h-4" /> },
];

export const OrderTrackingView: React.FC<OrderTrackingViewProps> = ({
  initialOrderNumber = '',
  onBack,
}) => {
  const [orderNumber, setOrderNumber] = useState(initialOrderNumber);
  const [contact, setContact] = useState('');
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderNumber.trim() || !contact.trim()) {
      setErrorMsg('Please enter both your Order Number and phone number or email.');
      return;
    }

    try {
      setLoading(true);
      setErrorMsg('');
      const res = await api.lookupOrder(orderNumber.trim(), contact.trim());
      setOrder(res.order);
    } catch (err: any) {
      setErrorMsg(err.message || 'No matching order found. Please check your credentials.');
      setOrder(null);
    } finally {
      setLoading(false);
    }
  };

  const getStepIndex = (status: DeliveryStatus): number => {
    switch (status) {
      case 'pending': return 0;
      case 'confirmed': return 1;
      case 'processing': return 2;
      case 'shipped': return 3;
      case 'delivered': return 4;
      default: return -1;
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Store</span>
        </button>
        <span className="text-xs font-bold text-[#0066ff]">RONVEX Live Order Tracking</span>
      </div>

      {/* Search Input Box */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs mb-8">
        <h1 className="text-lg font-bold text-slate-900 mb-1">Track Your Order Status</h1>
        <p className="text-xs text-slate-500 mb-4">
          Enter your unique order number (e.g. <strong className="font-mono text-slate-800">RNV-2026-89412</strong>) and the phone number or email used during checkout.
        </p>

        <form onSubmit={handleLookup} className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
          <div className="sm:col-span-5">
            <label className="block text-xs font-semibold text-slate-700 mb-1">Order Number</label>
            <input
              type="text"
              required
              value={orderNumber}
              onChange={(e) => setOrderNumber(e.target.value)}
              placeholder="e.g. RNV-2026-89412"
              className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:outline-none focus:border-[#0066ff] uppercase font-mono"
            />
          </div>

          <div className="sm:col-span-5">
            <label className="block text-xs font-semibold text-slate-700 mb-1">Mobile or Email</label>
            <input
              type="text"
              required
              value={contact}
              onChange={(e) => setContact(e.target.value)}
              placeholder="017... or email@gmail.com"
              className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:outline-none focus:border-[#0066ff]"
            />
          </div>

          <div className="sm:col-span-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-[#0066ff] hover:bg-[#0052cc] text-white text-xs font-bold rounded-lg shadow-sm transition-colors cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-50"
            >
              <Search className="w-3.5 h-3.5" />
              <span>{loading ? 'Checking...' : 'Track'}</span>
            </button>
          </div>
        </form>

        {errorMsg && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
            <span>{errorMsg}</span>
          </div>
        )}
      </div>

      {/* Order Results */}
      {order && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden space-y-6">
          {/* Top Bar of Result */}
          <div className="p-6 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-4">
            <div>
              <span className="text-[11px] uppercase tracking-wider text-slate-500 font-semibold block">Order Reference</span>
              <h2 className="text-xl font-black font-mono text-slate-900 tracking-tight">{order.orderNumber}</h2>
              <span className="text-xs text-slate-500">
                Placed on {new Date(order.createdAt).toLocaleDateString('en-US', { dateStyle: 'medium' })}
              </span>
            </div>

            <div className="text-right">
              <span className="text-[11px] uppercase tracking-wider text-slate-500 font-semibold block">Current Status</span>
              <span className={`inline-block text-xs font-bold px-3 py-1 rounded-full uppercase ${
                order.deliveryStatus === 'delivered' ? 'bg-emerald-100 text-emerald-800' :
                order.deliveryStatus === 'cancelled' || order.deliveryStatus === 'returned' ? 'bg-red-100 text-red-800' :
                'bg-blue-100 text-blue-800'
              }`}>
                {order.deliveryStatus}
              </span>
            </div>
          </div>

          {/* Stepper Timeline */}
          {order.deliveryStatus !== 'cancelled' && order.deliveryStatus !== 'returned' ? (
            <div className="px-6 py-4">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-6">Delivery Progress</h3>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                {statusSteps.map((step, idx) => {
                  const currentIdx = getStepIndex(order.deliveryStatus);
                  const isDone = currentIdx >= idx;
                  const isCurrent = currentIdx === idx;

                  return (
                    <div
                      key={step.key}
                      className={`p-3 rounded-xl border flex flex-col items-center text-center transition-all ${
                        isCurrent
                          ? 'border-[#0066ff] bg-blue-50/50 shadow-xs ring-1 ring-[#0066ff]'
                          : isDone
                          ? 'border-emerald-200 bg-emerald-50/30 text-emerald-800'
                          : 'border-slate-200 bg-slate-50 text-slate-400'
                      }`}
                    >
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center mb-2 ${
                        isCurrent ? 'bg-[#0066ff] text-white' : isDone ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-500'
                      }`}>
                        {step.icon}
                      </div>
                      <span className="text-[11px] font-bold block">{step.label}</span>
                      {isCurrent && (
                        <span className="text-[10px] text-[#0066ff] font-semibold mt-1">In Progress</span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="p-6 bg-red-50 text-red-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
              <span>This order was marked as <strong>{order.deliveryStatus}</strong>. Any associated affiliate earnings have been reversed.</span>
            </div>
          )}

          {/* Items & Shipping Breakdown */}
          <div className="p-6 border-t border-slate-200 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-3">Order Items</h4>
              <div className="space-y-3">
                {order.items.map((item, i) => (
                  <div key={i} className="flex items-center gap-3 p-2.5 rounded-lg border border-slate-100 bg-slate-50">
                    {item.image && (
                      <img
                        src={item.image}
                        alt={item.productName}
                        className="w-12 h-12 rounded object-cover bg-white"
                        referrerPolicy="no-referrer"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-slate-900 truncate">{item.productName}</p>
                      <p className="text-[11px] text-slate-500">Qty: {item.quantity}</p>
                    </div>
                    <span className="text-xs font-mono font-bold text-slate-900 tabular-nums">
                      ৳{item.subtotal.toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-3">Delivery Information</h4>
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-500">Recipient:</span>
                  <span className="font-semibold text-slate-900">{order.customer.fullName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Contact:</span>
                  <span className="font-mono text-slate-900">{order.customer.mobile}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Address:</span>
                  <span className="font-medium text-slate-900 text-right max-w-[200px]">
                    {order.customer.address}, {order.customer.city}
                  </span>
                </div>
                <div className="flex justify-between pt-2 border-t border-slate-200">
                  <span className="text-slate-500">Payment:</span>
                  <span className="font-semibold uppercase text-slate-900">
                    {order.paymentMethod} ({order.paymentStatus})
                  </span>
                </div>
                <div className="flex justify-between text-sm font-bold pt-1">
                  <span className="text-slate-900">Total:</span>
                  <span className="font-mono text-[#0066ff] tabular-nums">৳{order.totalAmount.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

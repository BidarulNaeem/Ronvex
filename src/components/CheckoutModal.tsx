import React, { useState } from 'react';
import { X, CheckCircle2, ShieldCheck, Truck, CreditCard, Smartphone, Banknote, AlertCircle } from 'lucide-react';
import type { CartItem } from '../lib/api.ts';
import { api, getStoredAttribution } from '../lib/api.ts';
import type { Order, PaymentMethod } from '../types/index.ts';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onOrderSuccess: (order: Order) => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  items,
  onOrderSuccess,
}) => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [city, setCity] = useState('Dhaka');
  const [address, setAddress] = useState('');
  const [note, setNote] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cod');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const attribution = getStoredAttribution();

  const subtotal = items.reduce((sum, item) => {
    const price = item.customSellingPrice !== undefined ? item.customSellingPrice : item.product.basePrice;
    return sum + price * item.quantity;
  }, 0);

  const deliveryFee = subtotal > 5000 ? 0 : 80;
  const grandTotal = subtotal + deliveryFee;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!fullName.trim() || !mobile.trim() || !address.trim() || !city.trim()) {
      setErrorMsg('Please fill in your name, mobile number, city, and shipping address.');
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await api.createOrder({
        customer: {
          fullName: fullName.trim(),
          email: email.trim() || `${mobile.replace(/\D/g, '')}@guest.ronvex.com`,
          mobile: mobile.trim(),
          address: address.trim(),
          city: city.trim(),
          note: note.trim() || undefined,
        },
        items: items.map((it) => ({
          productId: it.product.id,
          quantity: it.quantity,
        })),
        affiliateId: attribution?.affiliateId || null,
        paymentMethod,
      });

      if (res.success && res.order) {
        onOrderSuccess(res.order);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to submit order. Please check inputs.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="relative bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="p-4 px-6 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div>
            <h2 className="text-base font-bold text-slate-900">Complete Your Order</h2>
            <p className="text-xs text-slate-500 mt-0.5">Secure Cash on Delivery & Express Courier</p>
          </div>
          <button
            onClick={onClose}
            aria-label="Close checkout"
            className="p-1 rounded-md text-slate-500 hover:text-slate-800 hover:bg-slate-200/60 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {errorMsg && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
              <span>{errorMsg}</span>
            </div>
          )}

          {attribution && (
            <div className="p-2.5 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-800 flex items-center justify-between">
              <span className="font-medium">
                Supporting Partner Store: <strong className="text-[#0066ff]">{attribution.affiliateSlug}</strong>
              </span>
              <span className="text-[11px] text-blue-600 bg-white px-2 py-0.5 rounded border border-blue-200">
                Attribution Active
              </span>
            </div>
          )}

          {/* Form Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Full Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Tanvir Ahmed"
                className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:outline-none focus:border-[#0066ff] focus:ring-1 focus:ring-[#0066ff]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Mobile Number <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                required
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
                placeholder="e.g. 01712345678"
                className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:outline-none focus:border-[#0066ff] focus:ring-1 focus:ring-[#0066ff]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Email Address (Optional)
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="For instant invoice receipt"
                className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:outline-none focus:border-[#0066ff] focus:ring-1 focus:ring-[#0066ff]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                City / Division <span className="text-red-500">*</span>
              </label>
              <select
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full text-xs p-2.5 rounded-lg border border-slate-300 bg-white focus:outline-none focus:border-[#0066ff]"
              >
                <option value="Dhaka">Dhaka (Inside Dhaka ৳80)</option>
                <option value="Chattogram">Chattogram</option>
                <option value="Sylhet">Sylhet</option>
                <option value="Rajshahi">Rajshahi</option>
                <option value="Khulna">Khulna</option>
                <option value="Barishal">Barishal</option>
                <option value="Rangpur">Rangpur</option>
                <option value="Mymensingh">Mymensingh</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Full Street Delivery Address <span className="text-red-500">*</span>
              </label>
              <textarea
                required
                rows={2}
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="House #, Road #, Area, Landmark"
                className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:outline-none focus:border-[#0066ff]"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Delivery Instructions (Optional)
              </label>
              <input
                type="text"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="e.g. Please call before arriving or deliver between 2 PM - 5 PM"
                className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:outline-none focus:border-[#0066ff]"
              />
            </div>
          </div>

          {/* Payment Method Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-2">
              Choose Payment Method
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                type="button"
                onClick={() => setPaymentMethod('cod')}
                className={`p-2.5 rounded-lg border text-left cursor-pointer flex flex-col justify-between gap-1 transition-all ${
                  paymentMethod === 'cod'
                    ? 'border-[#0066ff] bg-blue-50/60 ring-1 ring-[#0066ff]'
                    : 'border-slate-200 hover:bg-slate-50'
                }`}
              >
                <Banknote className="w-4 h-4 text-emerald-600" />
                <span className="text-xs font-bold text-slate-900">Cash on Delivery</span>
                <span className="text-[10px] text-slate-500">Pay at doorstep</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('bkash')}
                className={`p-2.5 rounded-lg border text-left cursor-pointer flex flex-col justify-between gap-1 transition-all ${
                  paymentMethod === 'bkash'
                    ? 'border-[#0066ff] bg-blue-50/60 ring-1 ring-[#0066ff]'
                    : 'border-slate-200 hover:bg-slate-50'
                }`}
              >
                <Smartphone className="w-4 h-4 text-pink-600" />
                <span className="text-xs font-bold text-slate-900">bKash</span>
                <span className="text-[10px] text-slate-500">Mobile banking</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('nagad')}
                className={`p-2.5 rounded-lg border text-left cursor-pointer flex flex-col justify-between gap-1 transition-all ${
                  paymentMethod === 'nagad'
                    ? 'border-[#0066ff] bg-blue-50/60 ring-1 ring-[#0066ff]'
                    : 'border-slate-200 hover:bg-slate-50'
                }`}
              >
                <Smartphone className="w-4 h-4 text-orange-600" />
                <span className="text-xs font-bold text-slate-900">Nagad</span>
                <span className="text-[10px] text-slate-500">Fast wallet</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('card')}
                className={`p-2.5 rounded-lg border text-left cursor-pointer flex flex-col justify-between gap-1 transition-all ${
                  paymentMethod === 'card'
                    ? 'border-[#0066ff] bg-blue-50/60 ring-1 ring-[#0066ff]'
                    : 'border-slate-200 hover:bg-slate-50'
                }`}
              >
                <CreditCard className="w-4 h-4 text-[#0066ff]" />
                <span className="text-xs font-bold text-slate-900">Card / Visa</span>
                <span className="text-[10px] text-slate-500">Debit / Credit</span>
              </button>
            </div>
          </div>

          {/* Pricing Summary Box */}
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5 text-xs">
            <div className="flex justify-between text-slate-600">
              <span>Items Total ({items.reduce((s, i) => s + i.quantity, 0)} items)</span>
              <span className="font-mono tabular-nums">৳{subtotal.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Delivery Charge</span>
              <span className="font-mono tabular-nums">
                {deliveryFee === 0 ? <span className="text-emerald-600 font-semibold">FREE</span> : `৳${deliveryFee}`}
              </span>
            </div>
            <div className="flex justify-between text-sm font-bold text-slate-900 pt-2 border-t border-slate-200">
              <span>Total Payable</span>
              <span className="font-mono tabular-nums text-[#0066ff]">৳{grandTotal.toLocaleString()}</span>
            </div>
          </div>

          {/* Submit */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 bg-[#0066ff] hover:bg-[#0052cc] text-white text-xs font-bold rounded-lg shadow-md transition-colors cursor-pointer flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {isSubmitting ? (
                <span>Confirming Order...</span>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Place Order (৳{grandTotal.toLocaleString()})</span>
                </>
              )}
            </button>
            <p className="text-[11px] text-slate-500 text-center mt-2 flex items-center justify-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Orders are secured with 100% genuine product warranty & verification.</span>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

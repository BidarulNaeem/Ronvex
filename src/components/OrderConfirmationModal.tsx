import React, { useState } from 'react';
import { CheckCircle2, Copy, Check, Truck, ArrowRight } from 'lucide-react';
import type { Order } from '../types/index.ts';

interface OrderConfirmationModalProps {
  order: Order | null;
  onClose: () => void;
  onTrackOrder: (orderNumber: string) => void;
}

export const OrderConfirmationModal: React.FC<OrderConfirmationModalProps> = ({
  order,
  onClose,
  onTrackOrder,
}) => {
  const [copied, setCopied] = useState(false);

  if (!order) return null;

  const copyOrderNumber = () => {
    navigator.clipboard.writeText(order.orderNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="relative bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden text-center p-6 sm:p-8 space-y-5">
        <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-sm">
          <CheckCircle2 className="w-8 h-8" />
        </div>

        <div>
          <span className="text-[11px] uppercase tracking-wider font-bold text-[#0066ff]">
            Order Confirmed & Placed
          </span>
          <h2 className="text-xl font-extrabold text-slate-900 mt-1">Thank you, {order.customer.fullName}!</h2>
          <p className="text-xs text-slate-500 mt-1">
            We have received your order and our fulfillment team is preparing your package.
          </p>
        </div>

        {/* Order Badge Box */}
        <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-left">
          <div>
            <span className="text-[10px] text-slate-500 font-semibold block uppercase">Tracking Order Number</span>
            <span className="text-base font-extrabold text-slate-900 font-mono tracking-tight">
              {order.orderNumber}
            </span>
          </div>

          <button
            onClick={copyOrderNumber}
            className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1.5 rounded-lg border border-slate-300 hover:bg-white text-slate-700 transition-colors cursor-pointer"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>
        </div>

        {/* Order Details Brief */}
        <div className="text-left text-xs space-y-2 border-t border-b border-slate-100 py-3">
          <div className="flex justify-between text-slate-600">
            <span>Payment Method:</span>
            <span className="font-semibold uppercase text-slate-900">{order.paymentMethod}</span>
          </div>
          <div className="flex justify-between text-slate-600">
            <span>Delivery Destination:</span>
            <span className="font-semibold text-slate-900 truncate max-w-[220px]">
              {order.customer.address}, {order.customer.city}
            </span>
          </div>
          <div className="flex justify-between text-slate-600">
            <span>Total Amount:</span>
            <span className="font-mono font-bold text-[#0066ff] tabular-nums">
              ৳{order.totalAmount.toLocaleString()}
            </span>
          </div>
          {order.affiliateSlug && (
            <div className="flex justify-between text-slate-600 pt-1">
              <span>Affiliate Partner:</span>
              <span className="font-semibold text-blue-600">store/{order.affiliateSlug}</span>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="space-y-2 pt-2">
          <button
            onClick={() => {
              onClose();
              onTrackOrder(order.orderNumber);
            }}
            className="w-full py-2.5 bg-[#0066ff] hover:bg-[#0052cc] text-white text-xs font-bold rounded-lg flex items-center justify-center gap-2 shadow-sm transition-colors cursor-pointer"
          >
            <Truck className="w-4 h-4" />
            <span>Track Live Delivery Status</span>
          </button>

          <button
            onClick={onClose}
            className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg flex items-center justify-center gap-1 transition-colors cursor-pointer"
          >
            <span>Continue Shopping</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};

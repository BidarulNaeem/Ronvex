import React, { useState } from 'react';
import { X, Store, CheckCircle2, AlertCircle, ShieldCheck } from 'lucide-react';
import { api } from '../lib/api.ts';

interface AffiliateApplyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const AffiliateApplyModal: React.FC<AffiliateApplyModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [address, setAddress] = useState('');
  const [desiredSlug, setDesiredSlug] = useState('');
  const [businessDetails, setBusinessDetails] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!fullName || !email || !mobile || !address || !desiredSlug) {
      setErrorMsg('Please fill out all required fields.');
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await api.applyAffiliate({
        fullName: fullName.trim(),
        email: email.trim(),
        mobile: mobile.trim(),
        address: address.trim(),
        desiredSlug: desiredSlug.trim().toLowerCase(),
        businessDetails: businessDetails.trim() || undefined,
        password: password || 'affiliate123',
      });

      if (res.application) {
        setSubmitted(true);
        onSuccess();
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to submit application.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="relative bg-white rounded-2xl max-w-xl w-full shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="p-4 px-6 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-[#0066ff]/10 text-[#0066ff] rounded-lg">
              <Store className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Apply for RONVEX Affiliate Program</h2>
              <p className="text-xs text-slate-500">Launch your personal mini-store and earn gross margins</p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close application modal"
            className="p-1 rounded-md text-slate-500 hover:text-slate-800 hover:bg-slate-200/60 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {submitted ? (
          <div className="p-8 text-center space-y-4">
            <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Application Submitted!</h3>
            <p className="text-xs text-slate-600 leading-relaxed max-w-md mx-auto">
              Your application has been registered with status <strong className="text-amber-600 uppercase font-bold">Pending</strong>. Our admin team will verify your details and approve your account. You will then be able to log in to your custom affiliate dashboard.
            </p>
            <div className="pt-2">
              <button
                onClick={onClose}
                className="px-6 py-2 bg-[#0066ff] hover:bg-[#0052cc] text-white text-xs font-bold rounded-lg cursor-pointer"
              >
                Return to Store
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {errorMsg && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
                <span>{errorMsg}</span>
              </div>
            )}

            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-900">
              <p className="font-semibold mb-0.5">How Affiliate Earning Works on RONVEX:</p>
              <p className="text-[11px] text-blue-800">
                You select products and set your own selling price within admin limits. Your gross commission is{' '}
                <strong className="underline">Affiliate Selling Price - Admin Base Price</strong> per delivered order.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Naeem Ahmed"
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:outline-none focus:border-[#0066ff]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@domain.com"
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:outline-none focus:border-[#0066ff]"
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
                  placeholder="01712345678"
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:outline-none focus:border-[#0066ff]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Desired Mini-Store URL Slug <span className="text-red-500">*</span>
                </label>
                <div className="flex items-center rounded-lg border border-slate-300 overflow-hidden focus-within:border-[#0066ff]">
                  <span className="bg-slate-100 text-slate-500 text-[11px] px-2 py-2.5 border-r border-slate-300">
                    /store/
                  </span>
                  <input
                    type="text"
                    required
                    value={desiredSlug}
                    onChange={(e) => setDesiredSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                    placeholder="yourname"
                    className="w-full text-xs p-2.5 focus:outline-none font-mono"
                  />
                </div>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Mailing Address <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Your residential / office address"
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:outline-none focus:border-[#0066ff]"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Content Channel / Business Overview (Optional)
                </label>
                <textarea
                  rows={2}
                  value={businessDetails}
                  onChange={(e) => setBusinessDetails(e.target.value)}
                  placeholder="Your YouTube channel, Facebook page, or community audience reach..."
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:outline-none focus:border-[#0066ff]"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Create Password <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min 6 characters for signing in once approved"
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:outline-none focus:border-[#0066ff]"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2.5 bg-[#0066ff] hover:bg-[#0052cc] text-white text-xs font-bold rounded-lg shadow-sm transition-colors cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-50"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>{isSubmitting ? 'Submitting Application...' : 'Submit Application (Pending Review)'}</span>
              </button>
              <p className="text-[10px] text-slate-500 text-center mt-2">
                By applying, you agree to RONVEX partner guidelines, authentic product pricing rules, and commission terms.
              </p>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

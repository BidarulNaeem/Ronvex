import React, { useState } from 'react';
import { X, Lock, ShieldCheck, Store, AlertCircle } from 'lucide-react';
import { api } from '../lib/api.ts';
import type { AuthSession } from '../types/index.ts';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthSuccess: (session: AuthSession) => void;
  onOpenApply: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onAuthSuccess,
  onOpenApply,
}) => {
  const [role, setRole] = useState<'affiliate' | 'admin'>('affiliate');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    try {
      setIsSubmitting(true);
      const session = await api.login(email.trim(), password, role);
      onAuthSuccess(session);
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const fillDemoAdmin = () => {
    setRole('admin');
    setEmail('admin@ronvex.com');
    setPassword('admin123');
    setErrorMsg('');
  };

  const fillDemoAffiliate = () => {
    setRole('affiliate');
    setEmail('affiliate@ronvex.com');
    setPassword('affiliate123');
    setErrorMsg('');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="relative bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="p-4 px-6 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-[#0a192f] text-white rounded-lg">
              <Lock className="w-4 h-4 text-[#38bdf8]" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">Sign In to RONVEX Portal</h2>
              <p className="text-[11px] text-slate-500">Access your private dashboard</p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close auth modal"
            className="p-1 rounded-md text-slate-500 hover:text-slate-800 hover:bg-slate-200/60 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Role Selector Tabs */}
        <div className="p-2 bg-slate-100 border-b border-slate-200 flex gap-1">
          <button
            type="button"
            onClick={() => {
              setRole('affiliate');
              setErrorMsg('');
            }}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-md flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
              role === 'affiliate'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Store className="w-3.5 h-3.5 text-[#0066ff]" />
            <span>Affiliate Partner</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setRole('admin');
              setErrorMsg('');
            }}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-md flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
              role === 'admin'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5 text-[#0066ff]" />
            <span>Administrator</span>
          </button>
        </div>

        {/* Demo Fast-Fill Helper */}
        <div className="px-6 pt-4 flex items-center justify-between text-[11px]">
          <span className="text-slate-500 font-medium">Quick Credentials:</span>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={fillDemoAffiliate}
              className="text-[#0066ff] hover:underline cursor-pointer font-semibold"
            >
              Demo Affiliate
            </button>
            <span className="text-slate-300">·</span>
            <button
              type="button"
              onClick={fillDemoAdmin}
              className="text-[#0066ff] hover:underline cursor-pointer font-semibold"
            >
              Demo Admin
            </button>
          </div>
        </div>

        <form onSubmit={handleLogin} className="p-6 pt-3 space-y-4">
          {errorMsg && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-500 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={role === 'admin' ? 'admin@ronvex.com' : 'affiliate@ronvex.com'}
              className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:outline-none focus:border-[#0066ff]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:outline-none focus:border-[#0066ff]"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-2.5 bg-[#0066ff] hover:bg-[#0052cc] text-white text-xs font-bold rounded-lg shadow-sm transition-colors cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-50"
          >
            <Lock className="w-3.5 h-3.5" />
            <span>{isSubmitting ? 'Authenticating...' : `Sign In as ${role === 'admin' ? 'Admin' : 'Affiliate'}`}</span>
          </button>

          {role === 'affiliate' && (
            <div className="text-center pt-2 border-t border-slate-100">
              <p className="text-xs text-slate-500">
                Don't have an affiliate account yet?{' '}
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenApply();
                  }}
                  className="text-[#0066ff] font-semibold hover:underline cursor-pointer"
                >
                  Apply Here
                </button>
              </p>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

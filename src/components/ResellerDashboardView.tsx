import React, { useState, useEffect } from "react";
import { Download, Sparkles, Calculator, Wallet, DollarSign, Users, Award, FileText, CheckCircle, RefreshCw } from "lucide-react";
import { User, Product, formatINR, formatINRNoDec, downloadJSON } from "../types";
import ProfitCalculator from "./ProfitCalculator";

interface ResellerDashboardViewProps {
  user: User | null;
  token: string | null;
  products: Product[];
  onOpenAICopywriter: () => void;
}

export default function ResellerDashboardView({
  user,
  token,
  products,
  onOpenAICopywriter
}: ResellerDashboardViewProps) {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [withdrawalAmount, setWithdrawalAmount] = useState("");
  const [withdrawing, setWithdrawing] = useState(false);
  const [walletBalance, setWalletBalance] = useState((user?.walletBalance || 0) * 80);

  const fetchResellerStats = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/reseller/dashboard", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      const data = await response.json();
      if (response.ok) {
        setStats(data.stats);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchResellerStats();
    }
  }, [token]);

  const handleWithdrawalRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(withdrawalAmount);
    if (isNaN(amount) || amount <= 0 || amount > walletBalance) {
      alert("Please enter a valid amount within your wallet balance.");
      return;
    }

    setWithdrawing(true);
    try {
      // simulated endpoint or inline debit
      setTimeout(() => {
        setWalletBalance(prev => prev - amount);
        setWithdrawalAmount("");
        alert(`Your withdrawal request for ₹${amount.toLocaleString("en-IN")} has been successfully authorized! Funds will be credited to your verified bank account in 24 hours.`);
        setWithdrawing(false);
      }, 1000);
    } catch (err) {
      console.error(err);
      setWithdrawing(false);
    }
  };

  // Mock marketing downloads pack
  const marketingPacks = [
    { title: "Summer Bedding PDF Catalog", type: "PDF Booklet", size: "4.8 MB", link: "#" },
    { title: "Sateen 1000TC Lifestyle Photo Pack", type: "ZIP Images", size: "12.4 MB", link: "#" },
    { title: "French Flax Linen WhatsApp Stories Pack", type: "ZIP Graphics", size: "6.1 MB", link: "#" },
    { title: "Bedsheet Washing & Care Instructions Booklet", type: "PDF Guide", size: "1.2 MB", link: "#" }
  ];

  const handleExportStats = () => {
    const resellerBackup = {
      resellerName: user?.name,
      referralCode: user?.referralCode,
      walletBalance: walletBalance,
      stats: stats,
      exportedAt: new Date().toISOString(),
      currency: "INR"
    };
    downloadJSON(resellerBackup, `stylesleep_reseller_stats_${user?.name?.toLowerCase().replace(/\s+/g, '_') || 'partner'}.json`);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10 animate-fade-in">
      
      {/* Header Profile Info Row */}
      <div className="border-b border-primary/10 pb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xxs font-bold uppercase tracking-wider bg-amber-50 text-amber-700 border border-amber-200">
            Gold Partner Portal
          </span>
          <h1 className="font-serif-luxury text-3xl font-semibold text-luxury-charcoal mt-1.5 capitalize">
            Welcome back, {user?.name || "StyleSleep Partner"}
          </h1>
          <p className="text-xs text-luxury-charcoal/60 mt-0.5">Manage your home business, consult your margins, and share high-converting copy.</p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={handleExportStats}
            className="px-5 py-3 bg-green-700 text-white hover:bg-green-800 rounded-xl font-bold text-xs sm:text-sm tracking-wide shadow-md hover:shadow-lg transition-all flex items-center gap-2 cursor-pointer"
            title="Convert and export your stats to a JSON file"
          >
            <Download className="h-4 w-4" /> Export Stats to JSON
          </button>

          <button
            onClick={onOpenAICopywriter}
            className="px-5 py-3 bg-primary text-white hover:bg-primary-dark rounded-xl font-bold text-xs sm:text-sm tracking-wide shadow-md hover:shadow-lg transition-all flex items-center gap-2 cursor-pointer"
          >
            <Sparkles className="h-4.5 w-4.5 fill-white animate-pulse" /> Launch Gemini Copywriter
          </button>
        </div>
      </div>

      {loading && (
        <div className="text-center py-10 text-xs font-semibold text-primary">
          <p>Analyzing wholesale transactions and active balances...</p>
        </div>
      )}

      {/* Grid of Reseller Stats */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
          
          <div className="bg-white border border-primary/10 rounded-2xl p-5 shadow-sm space-y-1.5">
            <span className="text-xxs font-bold text-luxury-charcoal/50 uppercase tracking-widest block">Wallet Commission</span>
            <p className="text-xl sm:text-2xl font-bold text-green-700">₹{walletBalance.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
            <span className="text-xxs text-green-700 bg-green-50 px-1.5 py-0.5 rounded font-bold">Authorized for Payout</span>
          </div>

          <div className="bg-white border border-primary/10 rounded-2xl p-5 shadow-sm space-y-1.5">
            <span className="text-xxs font-bold text-luxury-charcoal/50 uppercase tracking-widest block">Total Commission Earned</span>
            <p className="text-xl sm:text-2xl font-bold text-luxury-charcoal">{formatINR(stats.totalEarnings || 340)}</p>
            <span className="text-xxs text-luxury-charcoal/50 font-medium">Accumulated margins</span>
          </div>

          <div className="bg-white border border-primary/10 rounded-2xl p-5 shadow-sm space-y-1.5">
            <span className="text-xxs font-bold text-luxury-charcoal/50 uppercase tracking-widest block">Total Sales Dispatched</span>
            <p className="text-xl sm:text-2xl font-bold text-luxury-charcoal">{stats.ordersCount || "5"} Orders</p>
            <span className="text-xxs text-luxury-charcoal/50 font-medium">Bedsheets shipped</span>
          </div>

          <div className="bg-white border border-primary/10 rounded-2xl p-5 shadow-sm space-y-1.5">
            <span className="text-xxs font-bold text-luxury-charcoal/50 uppercase tracking-widest block">Referral Invite Code</span>
            <p className="text-xl font-bold text-primary tracking-wider">{user?.referralCode || "STYLSLP10"}</p>
            <span className="text-xxs text-primary font-bold">Share to earn 5% bonus</span>
          </div>

        </div>
      )}

      {/* Wallet Withdraw and Quick Action Rows */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        
        {/* Left column: Withdraw commission & Download center */}
        <div className="md:col-span-7 space-y-8">
          
          {/* Withdraw Form Card */}
          <div className="bg-white border border-primary/10 rounded-2xl p-6 shadow-sm space-y-4">
            <h3 className="font-serif-luxury font-semibold text-base sm:text-lg text-luxury-charcoal flex items-center gap-1.5">
              <Wallet className="h-5 w-5 text-primary" /> Instant Commission Bank Payout
            </h3>
            <p className="text-xxs text-luxury-charcoal/60 leading-relaxed">
              Transfer your verified commissions straight into your connected checking bank account. Payout transactions settle within 24 working hours.
            </p>

            <form onSubmit={handleWithdrawalRequest} className="flex gap-3 max-w-md items-end">
              <div className="flex-1">
                <label className="block text-xxs font-bold text-luxury-charcoal/60 uppercase tracking-wider mb-1.5">Withdrawal Amount (₹)</label>
                <input
                  type="number"
                  min="1"
                  step="0.01"
                  required
                  placeholder={`e.g. ${Math.round(walletBalance)}`}
                  value={withdrawalAmount}
                  onChange={(e) => setWithdrawalAmount(e.target.value)}
                  className="w-full text-xs rounded-lg border border-primary/15 bg-white p-2.5 focus:border-primary focus:outline-none"
                />
              </div>
              <button
                type="submit"
                disabled={withdrawing || walletBalance <= 0}
                className="px-5 py-2.5 bg-primary text-white text-xs font-bold rounded-lg hover:bg-primary-dark transition-colors cursor-pointer flex items-center gap-1 disabled:opacity-50 h-10"
              >
                {withdrawing ? (
                  <>
                    <RefreshCw className="h-3.5 w-3.5 animate-spin" /> Authorizing...
                  </>
                ) : (
                  "Initiate Transfer"
                )}
              </button>
            </form>
          </div>

          {/* Marketing Download Pack */}
          <div className="bg-white border border-primary/10 rounded-2xl p-6 shadow-sm space-y-4">
            <h3 className="font-serif-luxury font-semibold text-base sm:text-lg text-luxury-charcoal flex items-center gap-1.5">
              <FileText className="h-5 w-5 text-primary" /> Reseller Sharing & Download Hub
            </h3>
            <p className="text-xxs text-luxury-charcoal/60 leading-relaxed">
              Download premium, watermark-free catalogs, fabric-weave educational brochures, and social media creative bundles. Share these directly in your customer WhatsApp statuses or Facebook catalog listings to drive sales instantly.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {marketingPacks.map((pack, i) => (
                <div key={i} className="bg-luxury-cream/40 border border-primary/5 rounded-xl p-3.5 flex items-center justify-between text-xxs">
                  <div>
                    <h4 className="font-bold text-luxury-charcoal truncate max-w-[180px]">{pack.title}</h4>
                    <p className="text-luxury-charcoal/50 mt-0.5">{pack.type} • {pack.size}</p>
                  </div>
                  <button
                    onClick={() => alert(`Beginning download of your verified micro-business pack "${pack.title}". Enjoy sharing!`)}
                    className="p-2 bg-primary/10 hover:bg-primary rounded-full text-primary hover:text-white transition-colors cursor-pointer"
                    title="Download package"
                  >
                    <Download className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Right column: Interactive Profit Calculator */}
        <div className="md:col-span-5">
          <ProfitCalculator initialProductCost={products[0]?.resellerPrice || 100} productName={products[0]?.name || "Luxury Bedsheet Set"} />
        </div>

      </div>

    </div>
  );
}

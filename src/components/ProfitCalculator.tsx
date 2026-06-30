import { useState, useEffect } from "react";
import { Calculator, IndianRupee, Percent, TrendingUp, AlertCircle, ShoppingCart } from "lucide-react";

interface ProfitCalculatorProps {
  initialProductCost?: number;
  productName?: string;
}

export default function ProfitCalculator({
  initialProductCost = 100,
  productName = "StyleSleep Premium Bedding"
}: ProfitCalculatorProps) {
  const [productCost, setProductCost] = useState<number>(initialProductCost * 80);
  const [sellingPrice, setSellingPrice] = useState<number>(Math.round(initialProductCost * 80 * 1.45)); // default 45% markup
  const [shippingCost, setShippingCost] = useState<number>(1200);
  const [platformFee, setPlatformFee] = useState<number>(400);

  // Outputs
  const [netProfit, setNetProfit] = useState<number>(0);
  const [profitPercentage, setProfitPercentage] = useState<number>(0);
  const [roi, setRoi] = useState<number>(0);

  // Sync state if initial product cost changes
  useEffect(() => {
    setProductCost(initialProductCost * 80);
    setSellingPrice(Math.round(initialProductCost * 80 * 1.45));
  }, [initialProductCost]);

  useEffect(() => {
    // Total expenses
    const totalExpenses = productCost + shippingCost + platformFee;
    const profit = sellingPrice - totalExpenses;
    const percentage = sellingPrice > 0 ? (profit / sellingPrice) * 100 : 0;
    const returnOnInvestment = productCost > 0 ? (profit / productCost) * 100 : 0;

    setNetProfit(parseFloat(profit.toFixed(2)));
    setProfitPercentage(parseFloat(percentage.toFixed(1)));
    setRoi(parseFloat(returnOnInvestment.toFixed(1)));
  }, [productCost, sellingPrice, shippingCost, platformFee]);

  return (
    <div className="bg-white border border-primary/10 rounded-2xl p-6 shadow-md">
      
      {/* Title */}
      <div className="flex items-center gap-2.5 pb-4 border-b border-primary/5 mb-6">
        <div className="p-2 bg-amber-50 rounded-lg text-amber-700">
          <Calculator className="h-5 w-5" />
        </div>
        <div>
          <h3 className="font-serif-luxury font-semibold text-base sm:text-lg text-luxury-charcoal">Reseller Profit Calculator</h3>
          <p className="text-xxs text-luxury-charcoal/60 mt-0.5">Determine pricing and margins instantly for *{productName}*</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Left Side: Inputs */}
        <div className="space-y-4">
          
          {/* Input: Product Cost (Wholesale reseller price) */}
          <div>
            <label className="block text-xs font-semibold text-luxury-charcoal/80 mb-1.5 flex items-center justify-between">
              <span>Your Wholesale Cost (₹)</span>
              <span className="text-xxs text-primary font-bold">Reseller Rate</span>
            </label>
            <div className="relative rounded-lg shadow-sm">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <IndianRupee className="h-4 w-4 text-luxury-charcoal/40" />
              </div>
              <input
                type="number"
                min="0"
                value={productCost}
                onChange={(e) => setProductCost(Math.max(0, parseFloat(e.target.value) || 0))}
                className="block w-full rounded-lg border border-primary/20 bg-luxury-cream py-2 pl-9 pr-3 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
          </div>

          {/* Input: Selling Price */}
          <div>
            <label className="block text-xs font-semibold text-luxury-charcoal/80 mb-1.5 flex items-center justify-between">
              <span>Your Customer Selling Price (₹)</span>
              <span className="text-xxs text-green-600 font-bold">Suggested: ₹{Math.round(productCost * 1.45).toLocaleString("en-IN")}</span>
            </label>
            <div className="relative rounded-lg shadow-sm">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <IndianRupee className="h-4 w-4 text-luxury-charcoal/40" />
              </div>
              <input
                type="number"
                min="0"
                value={sellingPrice}
                onChange={(e) => setSellingPrice(Math.max(0, parseFloat(e.target.value) || 0))}
                className="block w-full rounded-lg border border-primary/20 bg-white py-2 pl-9 pr-3 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary font-bold text-luxury-charcoal"
              />
            </div>
          </div>

          {/* Grid for Shipping & Platform Fee */}
          <div className="grid grid-cols-2 gap-4">
            
            {/* Input: Shipping Cost */}
            <div>
              <label className="block text-xs font-semibold text-luxury-charcoal/80 mb-1.5">
                Shipping Cost (₹)
              </label>
              <div className="relative rounded-lg shadow-sm">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <IndianRupee className="h-4 w-4 text-luxury-charcoal/40" />
                </div>
                <input
                  type="number"
                  min="0"
                  value={shippingCost}
                  onChange={(e) => setShippingCost(Math.max(0, parseFloat(e.target.value) || 0))}
                  className="block w-full rounded-lg border border-primary/20 py-1.5 pl-9 pr-2 text-xs focus:border-primary focus:outline-none"
                />
              </div>
            </div>

            {/* Input: Platform / Processing Fee */}
            <div>
              <label className="block text-xs font-semibold text-luxury-charcoal/80 mb-1.5">
                Processing Fee (₹)
              </label>
              <div className="relative rounded-lg shadow-sm">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <IndianRupee className="h-4 w-4 text-luxury-charcoal/40" />
                </div>
                <input
                  type="number"
                  min="0"
                  value={platformFee}
                  onChange={(e) => setPlatformFee(Math.max(0, parseFloat(e.target.value) || 0))}
                  className="block w-full rounded-lg border border-primary/20 py-1.5 pl-9 pr-2 text-xs focus:border-primary focus:outline-none"
                />
              </div>
            </div>

          </div>

        </div>

        {/* Right Side: Outputs */}
        <div className="bg-luxury-beige/40 border border-primary/10 rounded-xl p-5 flex flex-col justify-between">
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-primary/80 mb-4">Pricing Analytics</h4>
            
            {/* Net Profit Big Display */}
            <div className="space-y-1 mb-6">
              <span className="text-xxs font-medium text-luxury-charcoal/60 block">Projected Net Profit (Per Sale)</span>
              <div className={`flex items-baseline gap-1 text-3xl font-extrabold ${netProfit >= 0 ? "text-green-700" : "text-red-600"}`}>
                <span>₹{netProfit.toLocaleString("en-IN")}</span>
                <span className="text-xs font-semibold uppercase">{netProfit >= 0 ? "Earning" : "Loss"}</span>
              </div>
            </div>

            {/* Metric Rows */}
            <div className="space-y-3.5 pt-4 border-t border-primary/10">
              
              {/* Profit Margin */}
              <div className="flex items-center justify-between text-xs font-medium">
                <span className="text-luxury-charcoal/60">Profit Margin:</span>
                <span className={`font-bold px-2.5 py-1 rounded-full ${netProfit >= 0 ? "bg-green-50 text-green-700" : "bg-red-50 text-red-600"}`}>
                  {profitPercentage}%
                </span>
              </div>

              {/* ROI */}
              <div className="flex items-center justify-between text-xs font-medium">
                <span className="text-luxury-charcoal/60">Return on Investment:</span>
                <span className="font-semibold text-luxury-charcoal">{roi}% ROI</span>
              </div>

              {/* Break-even pricing */}
              <div className="flex items-center justify-between text-xs font-medium">
                <span className="text-luxury-charcoal/60">Minimum Break-even:</span>
                <span className="font-semibold text-luxury-charcoal">₹{(productCost + shippingCost + platformFee).toLocaleString("en-IN")}</span>
              </div>

            </div>
          </div>

          {/* Quick Guidance Alert */}
          <div className="mt-6 flex items-start gap-2.5 bg-amber-50/60 border border-amber-200/50 rounded-lg p-3 text-xxs text-amber-900 leading-relaxed">
            <AlertCircle className="h-4 w-4 text-amber-700 flex-shrink-0 mt-0.5" />
            <div>
              <span className="font-bold block">Smart Reseller Strategy:</span>
              Most StyleSleep resellers report that listing bedding collections at 35%-50% markup with free local shipping drives the fastest transaction velocity.
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}

import React, { useState } from "react";
import { Search, MapPin, Truck, Calendar, ShoppingBag, CheckCircle2, RefreshCw, AlertCircle } from "lucide-react";
import { Order, OrderStatus } from "../types";

interface TrackOrderViewProps {
  onTrackOrder: (orderId: string, phone: string) => Promise<Order | null>;
}

export default function TrackOrderView({ onTrackOrder }: TrackOrderViewProps) {
  const [orderIdInput, setOrderIdInput] = useState("");
  const [phoneInput, setPhoneInput] = useState("");
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [trackedOrder, setTrackedOrder] = useState<Order | null>(null);

  const handleTrackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderIdInput || !phoneInput) return;

    setLoading(true);
    setError(null);
    setTrackedOrder(null);

    try {
      const order = await onTrackOrder(orderIdInput.trim(), phoneInput.trim());
      if (order) {
        setTrackedOrder(order);
      } else {
        setError("We couldn't locate any shipment matching that combination. Please double check your order number and phone format.");
      }
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred during tracking query.");
    } finally {
      setLoading(false);
    }
  };

  // Status mapping to helper values for timeline
  const getStepProgress = (status: OrderStatus): number => {
    switch (status) {
      case OrderStatus.PENDING: return 1;
      case OrderStatus.PAYMENT_RECEIVED: return 2;
      case OrderStatus.CONFIRMED: return 3;
      case OrderStatus.PROCESSING: return 4;
      case OrderStatus.PACKED: return 5;
      case OrderStatus.SHIPPED: return 6;
      case OrderStatus.OUT_FOR_DELIVERY: return 7;
      case OrderStatus.DELIVERED: return 8;
      default: return 3; // default confirmed
    }
  };

  const stepsList = [
    { title: "Confirmed", match: [OrderStatus.CONFIRMED, OrderStatus.PAYMENT_RECEIVED] },
    { title: "Packed & Ready", match: [OrderStatus.PACKED, OrderStatus.PROCESSING] },
    { title: "Dispatched", match: [OrderStatus.SHIPPED] },
    { title: "Delivered", match: [OrderStatus.DELIVERED] }
  ];

  const currentStepNum = trackedOrder ? getStepProgress(trackedOrder.status) : 0;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 space-y-10 animate-fade-in">
      
      {/* Title */}
      <div className="text-center space-y-1.5 border-b border-primary/10 pb-6">
        <h1 className="font-serif-luxury text-3xl sm:text-4xl font-semibold tracking-wide text-luxury-charcoal">Track Your Bedding Shipment</h1>
        <p className="text-xs sm:text-sm text-luxury-charcoal/60 mt-0.5">Real-time Bluedart and DHL tracking status logs for guests and partners</p>
      </div>

      {/* Entry Form */}
      <form onSubmit={handleTrackSubmit} className="bg-white border border-primary/10 rounded-2xl p-6 sm:p-8 shadow-sm grid grid-cols-1 sm:grid-cols-12 gap-5 items-end">
        
        <div className="sm:col-span-5">
          <label className="block text-xs font-semibold text-luxury-charcoal/80 mb-1.5">Order ID Number</label>
          <input
            type="text"
            required
            placeholder="e.g. OD-10025"
            value={orderIdInput}
            onChange={(e) => setOrderIdInput(e.target.value)}
            className="w-full text-xs sm:text-sm rounded-lg border border-primary/15 bg-luxury-cream/30 p-2.5 focus:border-primary focus:outline-none"
          />
        </div>

        <div className="sm:col-span-5">
          <label className="block text-xs font-semibold text-luxury-charcoal/80 mb-1.5">Mobile Phone Number</label>
          <input
            type="text"
            required
            placeholder="e.g. +91 98765 43210"
            value={phoneInput}
            onChange={(e) => setPhoneInput(e.target.value)}
            className="w-full text-xs sm:text-sm rounded-lg border border-primary/15 bg-luxury-cream/30 p-2.5 focus:border-primary focus:outline-none"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="sm:col-span-2 w-full py-2.5 sm:py-3 bg-primary text-white text-xs font-bold rounded-lg hover:bg-primary-dark shadow-sm cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-50 h-10 sm:h-11"
        >
          {loading ? (
            <>
              <RefreshCw className="h-3.5 w-3.5 animate-spin" /> Querying...
            </>
          ) : (
            <>
              <Search className="h-3.5 w-3.5" /> Track Now
            </>
          )}
        </button>

      </form>

      {/* Query Errors */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-150 rounded-xl flex items-start gap-3 text-xs text-red-800 leading-relaxed animate-fade-in">
          <AlertCircle className="h-4.5 w-4.5 text-red-600 flex-shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Visual Timeline and results */}
      {trackedOrder && (
        <div className="bg-white border border-primary/10 rounded-2xl p-6 sm:p-8 shadow-md space-y-8 animate-fade-in">
          
          {/* Header Summary */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-5 border-b border-primary/5">
            <div>
              <p className="text-xxs text-luxury-charcoal/50 uppercase tracking-widest font-bold">Order Verification</p>
              <h2 className="text-base sm:text-lg font-bold text-luxury-charcoal mt-0.5 flex items-center gap-1.5">
                {trackedOrder.id} <span className="inline-block px-2.5 py-0.5 rounded-full text-xxs bg-primary/10 text-primary capitalize font-medium">{trackedOrder.status}</span>
              </h2>
            </div>
            <div className="text-left sm:text-right text-xs">
              <span className="text-luxury-charcoal/50">Dispatched Airway Bill:</span>
              <p className="font-semibold text-luxury-charcoal mt-0.5">{trackedOrder.trackingNumber || "N/A"}</p>
            </div>
          </div>

          {/* Graphical Step-by-Step timeline */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-primary/80">Shipment Stepper Journey</h3>
            
            <div className="relative pt-6 pb-2">
              {/* Stepper bar base */}
              <div className="absolute top-1/2 left-0 right-0 h-1 bg-luxury-beige transform -translate-y-1/2 rounded z-0"></div>
              
              {/* Active colored bar overlay */}
              <div 
                className="absolute top-1/2 left-0 h-1 bg-primary transform -translate-y-1/2 rounded z-0 transition-all duration-500"
                style={{
                  width: 
                    trackedOrder.status === OrderStatus.DELIVERED ? "100%" :
                    trackedOrder.status === OrderStatus.SHIPPED ? "66%" :
                    trackedOrder.status === OrderStatus.PACKED ? "33%" : "0%"
                }}
              ></div>

              {/* Steps circles */}
              <div className="relative flex justify-between items-center z-10">
                {stepsList.map((step, idx) => {
                  const isCompleted = 
                    trackedOrder.status === OrderStatus.DELIVERED ||
                    (idx < 3 && trackedOrder.status === OrderStatus.SHIPPED) ||
                    (idx < 2 && trackedOrder.status === OrderStatus.PACKED) ||
                    (idx === 0);

                  return (
                    <div key={idx} className="flex flex-col items-center">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 text-xs font-bold transition-all ${isCompleted ? "bg-primary border-primary text-white" : "bg-white border-primary/20 text-luxury-charcoal/40"}`}>
                        {isCompleted ? "✓" : idx + 1}
                      </div>
                      <span className={`text-xxs font-bold tracking-tight mt-2 ${isCompleted ? "text-primary" : "text-luxury-charcoal/40"}`}>
                        {step.title}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Stepper details grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4 border-t border-primary/5">
            
            {/* Shipment Items List */}
            <div className="space-y-3.5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-primary/80 flex items-center gap-1.5">
                <ShoppingBag className="h-4 w-4" /> Package Contents
              </h3>
              <div className="space-y-2.5">
                {trackedOrder.items.map((item, index) => (
                  <div key={index} className="flex items-center gap-3 bg-luxury-cream/40 p-3 rounded-xl border border-primary/5">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-10 h-10 rounded-lg object-cover"
                      referrerPolicy="no-referrer"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xxs font-bold text-luxury-charcoal truncate">{item.name}</h4>
                      <p className="text-xxs text-luxury-charcoal/50 mt-0.5">Size: {item.size} • Qty: {item.quantity}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Destination Address details */}
            <div className="space-y-3.5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-primary/80 flex items-center gap-1.5">
                <MapPin className="h-4 w-4" /> Destination Address
              </h3>
              <div className="bg-luxury-cream/40 border border-primary/5 rounded-xl p-4 text-xxs sm:text-xs space-y-1 text-luxury-charcoal/80 leading-relaxed">
                <p className="font-bold text-luxury-charcoal">{trackedOrder.shippingAddress.name}</p>
                <p>Phone: {trackedOrder.shippingAddress.phone}</p>
                <p>{trackedOrder.shippingAddress.street}</p>
                <p>{trackedOrder.shippingAddress.city}, {trackedOrder.shippingAddress.state} - {trackedOrder.shippingAddress.zipCode}</p>
              </div>
            </div>

          </div>

          {/* Chronological Logs History */}
          <div className="space-y-4 pt-6 border-t border-primary/5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-primary/80 flex items-center gap-1.5">
              <Truck className="h-4 w-4" /> Carrier Shipment Journey History
            </h3>

            <div className="space-y-3 pl-3 border-l-2 border-primary/10">
              {trackedOrder.trackingHistory && trackedOrder.trackingHistory.length > 0 ? (
                trackedOrder.trackingHistory.map((hist, i) => (
                  <div key={i} className="relative pl-4 space-y-1">
                    {/* Circle bullet overlay */}
                    <div className="absolute top-1.5 -left-[21px] w-2.5 h-2.5 rounded-full bg-primary border-2 border-white"></div>
                    <div className="flex items-center justify-between text-xxs">
                      <span className="font-bold text-primary capitalize">{hist.status}</span>
                      <span className="text-luxury-charcoal/40 font-medium">{new Date(hist.timestamp).toLocaleString()}</span>
                    </div>
                    <p className="text-xxs text-luxury-charcoal/70">{hist.note}</p>
                  </div>
                ))
              ) : (
                <p className="text-xxs italic text-luxury-charcoal/40">Initiating carrier routing details. Check back shortly.</p>
              )}
            </div>
          </div>

        </div>
      )}

    </div>
  );
}

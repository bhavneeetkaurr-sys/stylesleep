import React from "react";
import { Heart, Star, ShoppingCart, Eye, Sparkles } from "lucide-react";
import { Product, UserRole, formatINR } from "../types";

interface ProductCardProps {
  key?: string | number;
  product: Product;
  onViewDetails: (p: Product) => void;
  isWishlisted: boolean;
  onToggleWishlist: (p: Product) => void;
  userRole: UserRole;
  onAddToCart: (p: Product, size: string) => void;
}

export default function ProductCard({
  product,
  onViewDetails,
  isWishlisted,
  onToggleWishlist,
  userRole,
  onAddToCart
}: ProductCardProps) {
  const finalPrice = product.price * (1 - (product.discount / 100));
  const hasResellerAccess = userRole === UserRole.RESELLER || userRole === UserRole.ADMIN;

  return (
    <div className="group relative bg-white rounded-2xl border border-primary/5 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col h-full overflow-hidden">
      
      {/* Product Image Stage */}
      <div className="relative aspect-square w-full bg-luxury-cream overflow-hidden">
        <img
          src={product.images[0]}
          alt={product.name}
          className="h-full w-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
          referrerPolicy="no-referrer"
        />

        {/* Badge Overlays */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
          {product.isBestseller && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xxs font-bold uppercase tracking-wider bg-luxury-accent text-white shadow-sm">
              <Star className="h-3 w-3 fill-white" /> Bestseller
            </span>
          )}
          {product.isNewArrival && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xxs font-bold uppercase tracking-wider bg-primary text-white shadow-sm">
              <Sparkles className="h-3 w-3 fill-white" /> New
            </span>
          )}
          {product.isTrending && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xxs font-bold uppercase tracking-wider bg-purple-600 text-white shadow-sm">
              Trending
            </span>
          )}
        </div>

        {/* Floating Action Utilities */}
        <div className="absolute top-3 right-3 flex flex-col gap-2 z-10">
          <button
            onClick={() => onToggleWishlist(product)}
            className={`p-2 rounded-full shadow-md backdrop-blur-sm transition-all duration-300 border cursor-pointer ${isWishlisted ? "bg-red-500 text-white border-red-500" : "bg-white/80 hover:bg-white text-luxury-charcoal hover:text-red-500 border-primary/10"}`}
            title={isWishlisted ? "Remove from Wishlist" : "Add to Wishlist"}
          >
            <Heart className={`h-4.5 w-4.5 ${isWishlisted ? "fill-white" : ""}`} />
          </button>
        </div>

        {/* Hover quick view overlay */}
        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-3">
          <button
            onClick={() => onViewDetails(product)}
            className="flex items-center gap-1 px-4 py-2 bg-white text-luxury-charcoal text-xs font-semibold rounded-full shadow-lg hover:bg-primary hover:text-white transition-all transform translate-y-4 group-hover:translate-y-0 duration-300 cursor-pointer"
          >
            <Eye className="h-3.5 w-3.5" /> Quick View
          </button>
        </div>
      </div>

      {/* Product Information */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col">
        {/* Specifications tagline */}
        <div className="flex items-center justify-between text-xxs font-semibold text-primary uppercase tracking-widest mb-1.5">
          <span>{product.material}</span>
          <span>{product.threadCount} TC</span>
        </div>

        {/* Product Title */}
        <h3 className="font-serif-luxury font-semibold text-sm sm:text-base text-luxury-charcoal hover:text-primary transition-colors line-clamp-1 mb-2 cursor-pointer" onClick={() => onViewDetails(product)}>
          {product.name}
        </h3>

        {/* Star Rating summary */}
        <div className="flex items-center gap-1 mb-3">
          <div className="flex items-center">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`h-3 w-3 ${i < Math.floor(product.rating) ? "text-luxury-accent fill-luxury-accent" : "text-gray-200"}`}
              />
            ))}
          </div>
          <span className="text-xxs font-medium text-luxury-charcoal/60">
            {product.rating} ({product.reviews.length || 2} reviews)
          </span>
        </div>

        {/* Pricing Layout */}
        <div className="mt-auto pt-3 border-t border-primary/5">
          <div className="flex items-baseline justify-between">
            <div>
              <p className="text-xxs text-luxury-charcoal/50 leading-none">Customer Price</p>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-base sm:text-lg font-bold text-luxury-charcoal">
                  {formatINR(finalPrice)}
                </span>
                {product.discount > 0 && (
                  <>
                    <span className="text-xs text-luxury-charcoal/40 line-through">
                      {formatINR(product.price)}
                    </span>
                    <span className="text-xxs font-bold text-green-600 bg-green-50 px-1.5 py-0.5 rounded">
                      -{product.discount}%
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* Exclusive Reseller Price Offer */}
            <div className="text-right">
              <span className="inline-block text-xxs font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded mb-1">
                Reseller Portal
              </span>
              <p className="text-sm font-bold text-amber-800">
                {formatINR(product.resellerPrice)}
              </p>
              <p className="text-xxs text-amber-800/60 leading-none">Exclusive Rate</p>
            </div>
          </div>

          {/* Profit sharing badge for guests/resellers */}
          <div className="mt-3.5 bg-luxury-beige/50 border border-primary/5 rounded-xl p-2.5 flex items-center justify-between text-xxs font-medium text-luxury-charcoal/80">
            <span>Potential Profit:</span>
            <span className="font-bold text-primary">
              +{formatINR(finalPrice - product.resellerPrice)} / Set
            </span>
          </div>

          {/* Interactive Actions */}
          <div className="grid grid-cols-5 gap-2 mt-4">
            <button
              onClick={() => onViewDetails(product)}
              className="col-span-2 px-3 py-2 text-xs font-semibold rounded-lg border border-primary text-primary hover:bg-primary hover:text-white transition-colors duration-200 cursor-pointer text-center"
            >
              Details
            </button>
            <button
              onClick={() => onAddToCart(product, "King")}
              className="col-span-3 flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-bold rounded-lg bg-primary text-white hover:bg-primary-dark shadow-sm hover:shadow transition-all duration-200 cursor-pointer"
            >
              <ShoppingCart className="h-3.5 w-3.5" /> Buy / Sell
            </button>
          </div>
        </div>

      </div>

    </div>
  );
}

import React, { useState } from "react";
import { Search, Filter, SlidersHorizontal, ArrowUpDown } from "lucide-react";
import { Product, UserRole } from "../types";
import ProductCard from "./ProductCard";

interface ShopViewProps {
  products: Product[];
  categories: string[];
  onViewProduct: (p: Product) => void;
  isWishlisted: (id: string) => boolean;
  onToggleWishlist: (p: Product) => void;
  onAddToCart: (p: Product, size: string) => void;
  userRole: UserRole;
  
  // Filtering and searching states forwarded
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  selectedCategory: string;
  setSelectedCategory: (c: string) => void;
  selectedSize: string;
  setSelectedSize: (s: string) => void;
  sortBy: string;
  setSortBy: (s: string) => void;
  minPrice: string;
  setMinPrice: (p: string) => void;
  maxPrice: string;
  setMaxPrice: (p: string) => void;
}

export default function ShopView({
  products,
  categories,
  onViewProduct,
  isWishlisted,
  onToggleWishlist,
  onAddToCart,
  userRole,
  searchQuery,
  setSearchQuery,
  selectedCategory,
  setSelectedCategory,
  selectedSize,
  setSelectedSize,
  sortBy,
  setSortBy,
  minPrice,
  setMinPrice,
  maxPrice,
  setMaxPrice
}: ShopViewProps) {
  const [showFilters, setShowFilters] = useState(false);

  const sizesList = ["Single", "Double", "Queen", "King"];

  const handleClearFilters = () => {
    setSearchQuery("");
    setSelectedCategory("");
    setSelectedSize("");
    setSortBy("newest");
    setMinPrice("");
    setMaxPrice("");
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Title & Page Header */}
      <div className="space-y-2 border-b border-primary/10 pb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="font-serif-luxury text-3xl sm:text-4xl font-semibold tracking-wide text-luxury-charcoal">StyleSleep Bedding Catalog</h1>
          <p className="text-xs sm:text-sm text-luxury-charcoal/60 mt-0.5">Premium quality. Exclusively direct-to-home rates.</p>
        </div>
        <button
          onClick={handleClearFilters}
          className="text-xs font-bold text-primary hover:underline hover:text-primary-dark cursor-pointer text-left md:text-right"
        >
          Reset All Filters
        </button>
      </div>

      {/* Search and Filters Hub */}
      <div className="bg-white border border-primary/10 rounded-2xl p-4 sm:p-5 shadow-sm space-y-4">
        
        {/* Core Search & Filters Trigger row */}
        <div className="flex flex-col sm:flex-row gap-3">
          
          {/* Search Input bar */}
          <div className="relative flex-1 rounded-xl shadow-sm">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-luxury-charcoal/40">
              <Search className="h-4 w-4" />
            </div>
            <input
              type="text"
              placeholder="Search by Egyptian, Satin, Silk, SKU..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="block w-full rounded-xl border border-primary/15 bg-luxury-cream/40 py-2.5 pl-10 pr-3 text-xs sm:text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          <div className="flex gap-2">
            
            {/* Sorting Dropdown */}
            <div className="relative rounded-xl border border-primary/15 bg-white px-3 py-2 flex items-center gap-1">
              <ArrowUpDown className="h-3.5 w-3.5 text-luxury-charcoal/60" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="text-xs font-semibold text-luxury-charcoal bg-transparent border-none focus:outline-none cursor-pointer"
              >
                <option value="newest">Newest Arrivals</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="rating">Rating: Highest First</option>
              </select>
            </div>

            {/* Toggle filter drawer button */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`px-4 py-2.5 rounded-xl border flex items-center gap-1.5 text-xs font-semibold cursor-pointer ${showFilters ? "bg-primary text-white border-primary" : "bg-white text-luxury-charcoal border-primary/15"}`}
            >
              <SlidersHorizontal className="h-3.5 w-3.5" />
              {showFilters ? "Hide Filters" : "More Filters"}
            </button>

          </div>

        </div>

        {/* Expanded Filters Drawer */}
        {showFilters && (
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-5 pt-4 border-t border-primary/10 animate-fade-in">
            
            {/* Category Filter */}
            <div>
              <label className="block text-xxs font-bold text-luxury-charcoal/60 uppercase tracking-widest mb-1.5">Collection Category</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full text-xs rounded-lg border border-primary/15 bg-white p-2 focus:outline-none"
              >
                <option value="">All Collections</option>
                {categories.map((cat, idx) => (
                  <option key={idx} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            {/* Size Filter */}
            <div>
              <label className="block text-xxs font-bold text-luxury-charcoal/60 uppercase tracking-widest mb-1.5">Bedsheet Bed Size</label>
              <select
                value={selectedSize}
                onChange={(e) => setSelectedSize(e.target.value)}
                className="w-full text-xs rounded-lg border border-primary/15 bg-white p-2 focus:outline-none"
              >
                <option value="">All Sizes</option>
                {sizesList.map((sz, idx) => (
                  <option key={idx} value={sz}>{sz} Size</option>
                ))}
              </select>
            </div>

            {/* Price range filters */}
            <div className="col-span-2">
              <label className="block text-xxs font-bold text-luxury-charcoal/60 uppercase tracking-widest mb-1.5">Price Filter Range ($)</label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  placeholder="Min Price"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  className="w-full text-xs rounded-lg border border-primary/15 bg-white p-2 focus:outline-none"
                />
                <span className="text-luxury-charcoal/50 text-xs">to</span>
                <input
                  type="number"
                  placeholder="Max Price"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  className="w-full text-xs rounded-lg border border-primary/15 bg-white p-2 focus:outline-none"
                />
              </div>
            </div>

          </div>
        )}

      </div>

      {/* Products Grid */}
      {products.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {products.map((p) => (
            <ProductCard
              key={p.id}
              product={p}
              onViewDetails={onViewProduct}
              isWishlisted={isWishlisted(p.id)}
              onToggleWishlist={onToggleWishlist}
              userRole={userRole}
              onAddToCart={onAddToCart}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-24 bg-white border border-primary/10 rounded-2xl p-6">
          <Filter className="h-12 w-12 text-primary/30 mx-auto mb-4" />
          <h3 className="font-serif-luxury font-semibold text-lg text-luxury-charcoal">No bedding collections found</h3>
          <p className="text-xs text-luxury-charcoal/60 mt-1 max-w-sm mx-auto">There are no products matching your specific query. Try clearing filters or revising search terms.</p>
          <button
            onClick={handleClearFilters}
            className="mt-4 px-5 py-2.5 bg-primary text-white text-xs font-bold rounded-full hover:bg-primary-dark shadow cursor-pointer"
          >
            Clear Filters & Reload
          </button>
        </div>
      )}

    </div>
  );
}

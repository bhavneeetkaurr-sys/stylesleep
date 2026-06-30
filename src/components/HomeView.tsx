import React from "react";
import { Star, ShieldCheck, HeartHandshake, Award, Sparkles, ChevronRight, MessageSquare, ArrowRight, BookOpen, Mail, Send } from "lucide-react";
import { Product, Testimonial } from "../types";
import ProductCard from "./ProductCard";

interface HomeViewProps {
  products: Product[];
  testimonials: Testimonial[];
  setCurrentView: (view: string) => void;
  onViewProduct: (p: Product) => void;
  isWishlisted: (id: string) => boolean;
  onToggleWishlist: (p: Product) => void;
  onAddToCart: (p: Product, size: string) => void;
  userRole: any;
}

export default function HomeView({
  products,
  testimonials,
  setCurrentView,
  onViewProduct,
  isWishlisted,
  onToggleWishlist,
  onAddToCart,
  userRole
}: HomeViewProps) {
  
  // Take first 3 bestseller products to display on home
  const bestSellers = products.filter(p => p.isBestseller).slice(0, 3);
  // Take first 3 new arrivals
  const newArrivals = products.filter(p => p.isNewArrival).slice(0, 3);

  const faqItems = [
    { q: "What makes StyleSleep sheets feel like a 5-star hotel?", a: "We use exclusively premium long-staple Egyptian cotton and Belgian flax, spun to extremely high thread counts (up to 1200 TC) with a luxury sateen or crisp percale weave. This delivers a silky smooth, highly breathable drape." },
    { q: "How does the reselling program work?", a: "It is free! Register as a reseller to immediately view wholesale prices. You can share our premium catalog with your network. When you receive an order, input your customer's details and pay our wholesale price. You pocket the profit difference instantly, and we ship the order directly to your customer with neutral, high-end packaging." },
    { q: "Is there a minimum purchase requirement for resellers?", a: "No! There is absolutely no minimum order quantity. You can purchase a single set at wholesale reseller prices and start earning profits from your very first sale." },
    { q: "How long does shipping take and is COD available?", a: "We dispatch orders within 24 hours. Standard delivery takes 2 to 4 business days. We offer Cash on Delivery (COD) as well as secure online payments." }
  ];

  return (
    <div className="space-y-20 pb-20">
      
      {/* Premium Hero Section */}
      <section className="relative overflow-hidden bg-luxury-beige py-20 lg:py-32 border-b border-primary/15">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          <div className="lg:col-span-6 space-y-6 text-center lg:text-left">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xxs font-bold uppercase tracking-widest bg-primary/10 text-primary">
              <Sparkles className="h-3 w-3 fill-primary" /> The Elite Bedding Experience
            </span>
            <h1 className="font-serif-luxury text-4xl sm:text-5xl lg:text-6xl font-semibold text-luxury-charcoal leading-tight">
              Slumber in <br />
              <span className="text-primary italic">Supreme Elegance</span>
            </h1>
            <p className="text-sm sm:text-base text-luxury-charcoal/80 leading-relaxed max-w-xl mx-auto lg:mx-0">
              Discover the finest Egyptian long-staple cotton and French flax linen sheets. Indulge in 1200 thread-count softness designed for temperature-controlled slumbers.
            </p>
            <div className="flex flex-col sm:flex-row justify-center lg:justify-start gap-4">
              <button
                onClick={() => setCurrentView("shop")}
                className="px-8 py-3.5 bg-primary text-white text-sm font-bold rounded-full shadow-lg hover:bg-primary-dark transition-all cursor-pointer"
              >
                Explore the Catalog
              </button>
              <button
                onClick={() => setCurrentView("resell-landing")}
                className="px-8 py-3.5 bg-white border border-primary text-primary text-sm font-bold rounded-full hover:bg-luxury-beige transition-all cursor-pointer"
              >
                Become a Partner
              </button>
            </div>
          </div>

          {/* Hero Images Grid */}
          <div className="lg:col-span-6 grid grid-cols-12 gap-4">
            <div className="col-span-7 rounded-2xl overflow-hidden shadow-2xl h-[340px] border border-white/40">
              <img
                src="https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=800&q=80"
                alt="Luxury Bed"
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="col-span-5 flex flex-col gap-4">
              <div className="rounded-2xl overflow-hidden shadow-xl h-[160px] border border-white/40">
                <img
                  src="https://images.unsplash.com/photo-1540518614846-7eded433c457?auto=format&fit=crop&w=800&q=80"
                  alt="Fine sheets"
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="rounded-2xl bg-luxury-charcoal text-white p-5 flex flex-col justify-between h-[164px] border border-white/10 shadow-xl">
                <div>
                  <span className="text-2xl font-serif-luxury font-bold text-luxury-accent">1,500+</span>
                  <p className="text-xxs text-white/60 uppercase tracking-widest mt-1">Active Resellers</p>
                </div>
                <p className="text-xxs text-white/80 font-medium">Pocketing 35%+ margins from home with 0 investment.</p>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* Featured Categories Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center space-y-2">
          <h2 className="font-serif-luxury text-2xl sm:text-3xl font-semibold tracking-tight">Featured Collections</h2>
          <p className="text-xs sm:text-sm text-luxury-charcoal/60">Find the perfect texture for your sleeping aesthetics</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
          {[
            { name: "Cotton Bedsheets", count: "Explore Percale & Sateen", img: "https://images.unsplash.com/photo-1631679706909-1844bbd07221?auto=format&fit=crop&w=400&q=80" },
            { name: "Premium Bedsheets", count: "Belgian Flax & Linen", img: "https://images.unsplash.com/photo-1616594039964-ae9021a400a0?auto=format&fit=crop&w=400&q=80" },
            { name: "Luxury Bedsheets", count: "Mulberry Silk Elegance", img: "https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?auto=format&fit=crop&w=400&q=80" },
            { name: "Hotel Collection", count: "Classic 5-Star Stripes", img: "https://images.unsplash.com/photo-1507652313519-d4e9174996dd?auto=format&fit=crop&w=400&q=80" }
          ].map((cat, i) => (
            <div
              key={i}
              onClick={() => setCurrentView("shop")}
              className="group relative rounded-xl overflow-hidden shadow-sm hover:shadow-md cursor-pointer aspect-[4/5] border border-primary/5"
            >
              <img
                src={cat.img}
                alt={cat.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-4">
                <h4 className="font-serif-luxury text-sm sm:text-base font-bold text-white leading-tight">{cat.name}</h4>
                <p className="text-xxs text-white/75 mt-0.5">{cat.count}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Best Sellers Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div className="space-y-1.5">
            <h2 className="font-serif-luxury text-2xl sm:text-3xl font-semibold tracking-tight">Our Best Sellers</h2>
            <p className="text-xs sm:text-sm text-luxury-charcoal/60">Indulgent luxury items most popular with customers</p>
          </div>
          <button
            onClick={() => setCurrentView("shop")}
            className="text-xs font-bold text-primary hover:text-primary-dark flex items-center gap-1 cursor-pointer"
          >
            Browse Full Shop <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {bestSellers.map(p => (
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
      </section>

      {/* Reseller Pitch Section */}
      <section className="bg-luxury-beige border-y border-primary/15 py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          <div className="lg:col-span-5 rounded-2xl overflow-hidden shadow-lg h-[300px]">
            <img
              src="https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=800&q=80"
              alt="Work from home"
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>

          <div className="lg:col-span-7 space-y-6">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xxs font-bold bg-amber-50 text-amber-700 border border-amber-200">
              StyleSleep Reseller Ecosystem
            </span>
            <h2 className="font-serif-luxury text-2xl sm:text-4xl font-semibold text-luxury-charcoal leading-tight">
              Launch Your Own Premium Bedsheet Business From Home
            </h2>
            <p className="text-xs sm:text-sm text-luxury-charcoal/80 leading-relaxed">
              Bedsheets represent the perfect e-commerce asset: high profit margins, zero return fitting headaches, and evergreen seasonal demand. StyleSleep equips you with exclusive discounted reseller prices, lifestyle catalog templates, and a state-of-the-art Gemini AI copywriter.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              <div className="bg-white/60 p-4 rounded-xl border border-primary/5">
                <span className="text-xl font-bold text-primary">35% to 50%</span>
                <p className="text-xxs text-luxury-charcoal/60 font-semibold mt-0.5">Average Profit Margin</p>
              </div>
              <div className="bg-white/60 p-4 rounded-xl border border-primary/5">
                <span className="text-xl font-bold text-primary">$0</span>
                <p className="text-xxs text-luxury-charcoal/60 font-semibold mt-0.5">Zero Upfront Inventory</p>
              </div>
              <div className="bg-white/60 p-4 rounded-xl border border-primary/5">
                <span className="text-xl font-bold text-primary">100% Free</span>
                <p className="text-xxs text-luxury-charcoal/60 font-semibold mt-0.5">Marketing Creative Packs</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-4 pt-2">
              <button
                onClick={() => setCurrentView("resell-landing")}
                className="px-6 py-3 bg-primary text-white text-xs font-bold rounded-full hover:bg-primary-dark transition-all shadow cursor-pointer"
              >
                Learn More & Calculate Profits
              </button>
              <button
                onClick={() => setCurrentView("register")}
                className="px-6 py-3 bg-white text-luxury-charcoal border border-primary/20 text-xs font-semibold rounded-full hover:bg-primary/5 transition-all cursor-pointer"
              >
                Register as Reseller
              </button>
            </div>
          </div>

        </div>
      </section>

      {/* New Arrivals Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="space-y-1.5 text-center">
          <h2 className="font-serif-luxury text-2xl sm:text-3xl font-semibold tracking-tight">Luxury New Arrivals</h2>
          <p className="text-xs sm:text-sm text-luxury-charcoal/60">Explore our latest seasonal collections fresh from the looms</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {newArrivals.map(p => (
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
      </section>

      {/* FAQ Accordion Section */}
      <section className="max-w-3xl mx-auto px-4 sm:px-6 space-y-8">
        <div className="text-center space-y-1.5">
          <h2 className="font-serif-luxury text-2xl sm:text-3xl font-semibold tracking-tight">Frequently Answered Queries</h2>
          <p className="text-xs sm:text-sm text-luxury-charcoal/60">Everything you need to know about sleeping luxury and resale</p>
        </div>

        <div className="space-y-4">
          {faqItems.map((faq, idx) => (
            <details key={idx} className="group border border-primary/10 rounded-xl bg-white p-4.5 [&_summary::-webkit-details-marker]:hidden transition-all">
              <summary className="flex items-center justify-between cursor-pointer focus:outline-none">
                <h3 className="text-xs sm:text-sm font-semibold text-luxury-charcoal pr-4 group-open:text-primary">
                  {faq.q}
                </h3>
                <span className="text-primary group-open:rotate-180 transition-transform">
                  ▼
                </span>
              </summary>
              <p className="mt-2.5 text-xxs sm:text-xs text-luxury-charcoal/70 leading-relaxed pt-2 border-t border-primary/5">
                {faq.a}
              </p>
            </details>
          ))}
        </div>
      </section>

      {/* Testimonials section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center space-y-1.5">
          <h2 className="font-serif-luxury text-2xl sm:text-3xl font-semibold tracking-tight">What Our Partners & Sleepers Say</h2>
          <p className="text-xs sm:text-sm text-luxury-charcoal/60">Honest reviews from premium clients and gold-tier resellers</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((test) => (
            <div key={test.id} className="bg-white border border-primary/5 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-1.5 mb-3.5">
                  {[...Array(test.rating)].map((_, i) => (
                    <Star key={i} className="h-3.5 w-3.5 text-luxury-accent fill-luxury-accent" />
                  ))}
                </div>
                <p className="text-xs text-luxury-charcoal/80 italic leading-relaxed">
                  "{test.text}"
                </p>
              </div>

              <div className="flex items-center gap-3.5 mt-5 pt-4 border-t border-primary/5">
                <img
                  src={test.avatar}
                  alt={test.name}
                  className="h-9 w-9 rounded-full object-cover"
                  referrerPolicy="no-referrer"
                />
                <div>
                  <h4 className="text-xs font-bold text-luxury-charcoal">{test.name}</h4>
                  <p className="text-xxs font-medium text-primary uppercase tracking-wider">{test.role} • {test.location}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
}

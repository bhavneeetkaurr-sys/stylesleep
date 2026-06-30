import React from "react";
import { Mail, Phone, Clock, MapPin, Instagram, Facebook, Send, Award, ShieldCheck, HeartHandshake } from "lucide-react";

interface FooterProps {
  setCurrentView: (view: string) => void;
}

export default function Footer({ setCurrentView }: FooterProps) {
  const handleSubmitNewsletter = (e: React.FormEvent) => {
    e.preventDefault();
    alert("Thank you for subscribing! Exquisite collection updates and exclusive reseller invites will be dispatched to your inbox shortly.");
  };

  return (
    <footer className="bg-luxury-charcoal text-white mt-24">
      
      {/* Brand trust badges section */}
      <div className="border-b border-white/10 bg-black/20 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-primary/20 rounded-full border border-primary/25">
              <Award className="h-6 w-6 text-luxury-accent" />
            </div>
            <div>
              <h4 className="font-serif-luxury font-semibold text-sm tracking-wider uppercase text-luxury-accent">Elite Quality Craft</h4>
              <p className="text-xs text-white/60 mt-0.5">Sourced from certified Egyptian cotton & French flax mills.</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="p-3 bg-primary/20 rounded-full border border-primary/25">
              <ShieldCheck className="h-6 w-6 text-luxury-accent" />
            </div>
            <div>
              <h4 className="font-serif-luxury font-semibold text-sm tracking-wider uppercase text-luxury-accent">100% Risk-Free Escrow</h4>
              <p className="text-xs text-white/60 mt-0.5">Your funds are protected with transparent dispute-free COD.</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="p-3 bg-primary/20 rounded-full border border-primary/25">
              <HeartHandshake className="h-6 w-6 text-luxury-accent" />
            </div>
            <div>
              <h4 className="font-serif-luxury font-semibold text-sm tracking-wider uppercase text-luxury-accent">Empowering Micro-Business</h4>
              <p className="text-xs text-white/60 mt-0.5">Over 1,500 active resellers pocketing 35%+ margins from home.</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 grid grid-cols-1 md:grid-cols-4 gap-10">
        
        {/* Brand overview */}
        <div className="md:col-span-1 space-y-4">
          <span className="font-serif-luxury text-3xl font-bold tracking-wider text-primary">
            Style<span className="text-luxury-accent">Sleep</span>
          </span>
          <p className="text-xs text-white/60 leading-relaxed">
            StyleSleep represents the pinnacle of luxury resting. We combine centuries-old spinning traditions with contemporary visual motifs to design bedding that nurtures beautiful slumber.
          </p>
          <div className="flex space-x-4 pt-2">
            <a href="#" className="p-2 rounded-full bg-white/5 hover:bg-primary transition-colors text-white hover:text-white">
              <Instagram className="h-4 w-4" />
            </a>
            <a href="#" className="p-2 rounded-full bg-white/5 hover:bg-primary transition-colors text-white hover:text-white">
              <Facebook className="h-4 w-4" />
            </a>
          </div>
        </div>

        {/* Quick links */}
        <div>
          <h4 className="font-serif-luxury font-semibold text-base text-luxury-accent mb-4 tracking-wide border-b border-white/5 pb-2">Catalog & Shop</h4>
          <ul className="space-y-2.5 text-xs text-white/70">
            <li><button onClick={() => setCurrentView("shop")} className="hover:text-primary transition-colors cursor-pointer text-left">Cotton Bedding</button></li>
            <li><button onClick={() => setCurrentView("shop")} className="hover:text-primary transition-colors cursor-pointer text-left">Hotel Satin Collection</button></li>
            <li><button onClick={() => setCurrentView("shop")} className="hover:text-primary transition-colors cursor-pointer text-left">Luxury Pure Silk</button></li>
            <li><button onClick={() => setCurrentView("shop")} className="hover:text-primary transition-colors cursor-pointer text-left">Kids Bedding Collections</button></li>
            <li><button onClick={() => setCurrentView("resell-landing")} className="hover:text-primary transition-colors cursor-pointer text-left font-semibold text-luxury-accent">Reseller Exclusive Pricing</button></li>
          </ul>
        </div>

        {/* Company & Support */}
        <div>
          <h4 className="font-serif-luxury font-semibold text-base text-luxury-accent mb-4 tracking-wide border-b border-white/5 pb-2">Support & Info</h4>
          <ul className="space-y-2.5 text-xs text-white/70">
            <li><button onClick={() => setCurrentView("track-order")} className="hover:text-primary transition-colors cursor-pointer text-left">Track Active Shipments</button></li>
            <li><button onClick={() => setCurrentView("blog")} className="hover:text-primary transition-colors cursor-pointer text-left">Sleep Tips & Textile Blog</button></li>
            <li><button onClick={() => setCurrentView("contact")} className="hover:text-primary transition-colors cursor-pointer text-left">Contact Luxury Support</button></li>
            <li><button onClick={() => setCurrentView("resell-landing")} className="hover:text-primary transition-colors cursor-pointer text-left">Reseller Training Center</button></li>
          </ul>
        </div>

        {/* Newsletter subscription */}
        <div className="space-y-4">
          <h4 className="font-serif-luxury font-semibold text-base text-luxury-accent mb-2 tracking-wide border-b border-white/5 pb-2">Luxury Newsletter</h4>
          <p className="text-xs text-white/60 leading-relaxed">
            Subscribe to receive priority notifications of limited-edition drops, fabric care masterclasses, and reseller program guides.
          </p>
          <form onSubmit={handleSubmitNewsletter} className="flex rounded-lg overflow-hidden border border-white/10 focus-within:border-primary transition-colors mt-2">
            <input
              type="email"
              required
              placeholder="Your premium email"
              className="flex-1 px-3 py-2 bg-white/5 text-xs text-white placeholder-white/40 focus:outline-none"
            />
            <button
              type="submit"
              className="px-4 bg-primary hover:bg-primary-dark transition-colors text-white cursor-pointer"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
        </div>

      </div>

      {/* Footer bottom bar */}
      <div className="border-t border-white/5 bg-black/40 py-6 text-center text-xs text-white/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© 2026 StyleSleep Bedding Co. All rights reserved. Elegant sleep, guaranteed.</p>
          <div className="flex space-x-6">
            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-white transition-colors">Reseller Policy</a>
          </div>
        </div>
      </div>

    </footer>
  );
}

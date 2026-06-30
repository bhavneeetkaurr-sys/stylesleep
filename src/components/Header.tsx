import { useState } from "react";
import { ShoppingBag, Heart, User as UserIcon, Search, Menu, X, BarChart3, ShieldCheck, Mail, BookOpen } from "lucide-react";
import { User, UserRole } from "../types";

interface HeaderProps {
  currentView: string;
  setCurrentView: (view: string) => void;
  user: User | null;
  onLogout: () => void;
  cartCount: number;
  wishlistCount: number;
}

export default function Header({
  currentView,
  setCurrentView,
  user,
  onLogout,
  cartCount,
  wishlistCount
}: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 backdrop-blur-md bg-white/90 border-b border-primary/10 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center cursor-pointer" onClick={() => { setCurrentView("home"); setMobileMenuOpen(false); }}>
            <span className="font-serif-luxury text-2xl font-bold tracking-wider text-primary flex items-center gap-1.5">
              Style<span className="text-luxury-accent">Sleep</span>
            </span>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8 text-sm font-medium">
            <button
              onClick={() => setCurrentView("home")}
              className={`hover:text-primary transition-colors cursor-pointer ${currentView === "home" ? "text-primary border-b-2 border-primary pb-1" : "text-luxury-charcoal/80"}`}
            >
              Home
            </button>
            <button
              onClick={() => setCurrentView("shop")}
              className={`hover:text-primary transition-colors cursor-pointer ${currentView === "shop" ? "text-primary border-b-2 border-primary pb-1" : "text-luxury-charcoal/80"}`}
            >
              Shop Bedsheets
            </button>
            <button
              onClick={() => setCurrentView("resell-landing")}
              className={`hover:text-primary transition-colors cursor-pointer ${currentView === "resell-landing" || currentView === "reseller-dashboard" ? "text-primary border-b-2 border-primary pb-1 font-semibold" : "text-luxury-charcoal/80"}`}
            >
              Become Reseller
            </button>
            <button
              onClick={() => setCurrentView("blog")}
              className={`hover:text-primary transition-colors cursor-pointer ${currentView === "blog" ? "text-primary border-b-2 border-primary pb-1" : "text-luxury-charcoal/80"}`}
            >
              Sleep Blog
            </button>
            <button
              onClick={() => setCurrentView("contact")}
              className={`hover:text-primary transition-colors cursor-pointer ${currentView === "contact" ? "text-primary border-b-2 border-primary pb-1" : "text-luxury-charcoal/80"}`}
            >
              Contact Us
            </button>
            <button
              onClick={() => setCurrentView("track-order")}
              className={`hover:text-primary transition-colors cursor-pointer ${currentView === "track-order" ? "text-primary border-b-2 border-primary pb-1" : "text-luxury-charcoal/80"}`}
            >
              Track Order
            </button>
          </nav>

          {/* Actions & Utilities */}
          <div className="hidden md:flex items-center space-x-6">
            {/* Wishlist */}
            <button 
              onClick={() => setCurrentView("wishlist")}
              className="relative p-2 text-luxury-charcoal/80 hover:text-primary transition-colors cursor-pointer"
              title="Wishlist"
            >
              <Heart className="h-6 w-6" />
              {wishlistCount > 0 && (
                <span className="absolute top-0 right-0 inline-flex items-center justify-center px-1.5 py-0.5 text-xxs font-bold leading-none text-white bg-primary rounded-full transform translate-x-1/3 -translate-y-1/3">
                  {wishlistCount}
                </span>
              )}
            </button>

            {/* Shopping Cart */}
            <button 
              onClick={() => setCurrentView("cart")}
              className="relative p-2 text-luxury-charcoal/80 hover:text-primary transition-colors cursor-pointer"
              title="Cart"
            >
              <ShoppingBag className="h-6 w-6" />
              {cartCount > 0 && (
                <span className="absolute top-0 right-0 inline-flex items-center justify-center px-1.5 py-0.5 text-xxs font-bold leading-none text-white bg-luxury-accent rounded-full transform translate-x-1/3 -translate-y-1/3">
                  {cartCount}
                </span>
              )}
            </button>

            {/* Profile Dropdown / User Greeting */}
            {user ? (
              <div className="flex items-center space-x-3 pl-4 border-l border-primary/20">
                <div className="text-right">
                  <p className="text-xs font-semibold text-luxury-charcoal max-w-[120px] truncate">{user.name}</p>
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xxs font-medium bg-primary/10 text-primary capitalize">
                    {user.role}
                  </span>
                </div>
                
                <div className="flex space-x-2">
                  {user.role === UserRole.ADMIN && (
                    <button 
                      onClick={() => setCurrentView("admin-dashboard")}
                      className="p-1.5 rounded-full bg-red-50 text-red-600 hover:bg-red-100 transition-colors cursor-pointer"
                      title="Admin Dashboard"
                    >
                      <ShieldCheck className="h-5 w-5" />
                    </button>
                  )}
                  {user.role === UserRole.RESELLER && (
                    <button 
                      onClick={() => setCurrentView("reseller-dashboard")}
                      className="p-1.5 rounded-full bg-amber-50 text-amber-600 hover:bg-amber-100 transition-colors cursor-pointer"
                      title="Reseller Hub"
                    >
                      <BarChart3 className="h-5 w-5" />
                    </button>
                  )}
                  <button 
                    onClick={() => setCurrentView("profile")}
                    className="p-1.5 rounded-full bg-luxury-beige text-primary hover:bg-primary hover:text-white transition-all cursor-pointer"
                    title="Profile Settings"
                  >
                    <UserIcon className="h-5 w-5" />
                  </button>
                  <button 
                    onClick={onLogout}
                    className="text-xs font-medium text-red-600 hover:text-red-800 hover:underline cursor-pointer"
                  >
                    Logout
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setCurrentView("login")}
                className="flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-primary text-white hover:bg-primary-dark transition-all text-sm font-semibold cursor-pointer shadow-md hover:shadow-lg"
              >
                <UserIcon className="h-4 w-4" />
                Login / Register
              </button>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center space-x-4">
            <button 
              onClick={() => setCurrentView("wishlist")}
              className="relative p-1.5 text-luxury-charcoal/80"
            >
              <Heart className="h-5.5 w-5.5" />
              {wishlistCount > 0 && (
                <span className="absolute top-0 right-0 inline-flex items-center justify-center px-1.5 py-0.5 text-xxs font-bold leading-none text-white bg-primary rounded-full transform translate-x-1/4 -translate-y-1/4">
                  {wishlistCount}
                </span>
              )}
            </button>

            <button 
              onClick={() => setCurrentView("cart")}
              className="relative p-1.5 text-luxury-charcoal/80"
            >
              <ShoppingBag className="h-5.5 w-5.5" />
              {cartCount > 0 && (
                <span className="absolute top-0 right-0 inline-flex items-center justify-center px-1.5 py-0.5 text-xxs font-bold leading-none text-white bg-luxury-accent rounded-full transform translate-x-1/4 -translate-y-1/4">
                  {cartCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-1.5 rounded-md text-luxury-charcoal hover:text-primary transition-colors focus:outline-none"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-primary/10 py-4 px-4 transition-all animate-fade-in">
          <div className="space-y-3">
            <button
              onClick={() => { setCurrentView("home"); setMobileMenuOpen(false); }}
              className="block w-full text-left py-2 px-3 rounded-lg text-sm font-medium hover:bg-luxury-beige text-luxury-charcoal"
            >
              Home
            </button>
            <button
              onClick={() => { setCurrentView("shop"); setMobileMenuOpen(false); }}
              className="block w-full text-left py-2 px-3 rounded-lg text-sm font-medium hover:bg-luxury-beige text-luxury-charcoal"
            >
              Shop Bedsheets
            </button>
            <button
              onClick={() => { setCurrentView("resell-landing"); setMobileMenuOpen(false); }}
              className="block w-full text-left py-2 px-3 rounded-lg text-sm font-semibold hover:bg-luxury-beige text-primary"
            >
              Become a Reseller
            </button>
            <button
              onClick={() => { setCurrentView("blog"); setMobileMenuOpen(false); }}
              className="block w-full text-left py-2 px-3 rounded-lg text-sm font-medium hover:bg-luxury-beige text-luxury-charcoal"
            >
              Sleep Blog
            </button>
            <button
              onClick={() => { setCurrentView("contact"); setMobileMenuOpen(false); }}
              className="block w-full text-left py-2 px-3 rounded-lg text-sm font-medium hover:bg-luxury-beige text-luxury-charcoal"
            >
              Contact Us
            </button>
            <button
              onClick={() => { setCurrentView("track-order"); setMobileMenuOpen(false); }}
              className="block w-full text-left py-2 px-3 rounded-lg text-sm font-medium hover:bg-luxury-beige text-luxury-charcoal"
            >
              Track Order
            </button>

            {user ? (
              <div className="pt-4 border-t border-primary/10">
                <p className="text-xs text-luxury-charcoal/60 px-3">Signed in as</p>
                <p className="font-semibold text-sm px-3 text-luxury-charcoal">{user.name} ({user.role})</p>
                
                <div className="grid grid-cols-2 gap-2 mt-3 px-3">
                  <button
                    onClick={() => { setCurrentView("profile"); setMobileMenuOpen(false); }}
                    className="py-2 px-3 rounded-lg bg-luxury-beige text-center text-xs font-semibold text-primary"
                  >
                    My Profile
                  </button>
                  {user.role === UserRole.RESELLER && (
                    <button
                      onClick={() => { setCurrentView("reseller-dashboard"); setMobileMenuOpen(false); }}
                      className="py-2 px-3 rounded-lg bg-amber-50 text-center text-xs font-semibold text-amber-700"
                    >
                      Reseller Hub
                    </button>
                  )}
                  {user.role === UserRole.ADMIN && (
                    <button
                      onClick={() => { setCurrentView("admin-dashboard"); setMobileMenuOpen(false); }}
                      className="py-2 px-3 rounded-lg bg-red-50 text-center text-xs font-semibold text-red-700"
                    >
                      Admin Panel
                    </button>
                  )}
                </div>
                <button
                  onClick={() => { onLogout(); setMobileMenuOpen(false); }}
                  className="block w-full text-left mt-3 py-2 px-3 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="pt-4 border-t border-primary/10 px-3">
                <button
                  onClick={() => { setCurrentView("login"); setMobileMenuOpen(false); }}
                  className="w-full py-2.5 rounded-lg bg-primary text-white text-center text-sm font-semibold shadow-md"
                >
                  Login / Register
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

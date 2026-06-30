import React, { useState, useEffect } from "react";
import { 
  ShoppingBag, Heart, User as UserIcon, Search, Menu, X, 
  Trash2, Plus, Minus, Tag, Truck, CreditCard, ChevronLeft, Star, 
  MapPin, MessageSquare, AlertCircle, CheckCircle2, UserCheck, HelpCircle, Key, LogIn
} from "lucide-react";

// Types
import { 
  User, Product, CartItem, Order, Coupon, Testimonial, Blog, 
  UserRole, OrderStatus, Address, formatINR, formatINRNoDec
} from "./types";

// Extracted Modular Views
import Header from "./components/Header";
import Footer from "./components/Footer";
import HomeView from "./components/HomeView";
import ShopView from "./components/ShopView";
import BlogView from "./components/BlogView";
import TrackOrderView from "./components/TrackOrderView";
import AdminView from "./components/AdminView";
import ResellerDashboardView from "./components/ResellerDashboardView";
import AICopywriterModal from "./components/AICopywriterModal";

export default function App() {
  // Navigation & Routing
  const [currentView, setCurrentView] = useState<string>("home");
  
  // App Core State
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem("token"));
  const [products, setProducts] = useState<Product[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [blogs, setBlogs] = useState<Blog[]>([]);
  
  // Cart & Wishlist States
  const [cart, setCart] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [couponInput, setCouponInput] = useState<string>("");
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);

  // Filters for Shop Page
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [selectedSize, setSelectedSize] = useState<string>("");
  const [sortBy, setSortBy] = useState<string>("newest");
  const [minPrice, setMinPrice] = useState<string>("");
  const [maxPrice, setMaxPrice] = useState<string>("");

  // Target Selections (Modals/Details)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedBlog, setSelectedBlog] = useState<Blog | null>(null);
  const [showAICopywriter, setShowAICopywriter] = useState<boolean>(false);

  // Authentication Forms
  const [authEmail, setAuthEmail] = useState<string>("");
  const [authPassword, setAuthPassword] = useState<string>("");
  const [authName, setAuthName] = useState<string>("");
  const [authPhone, setAuthPhone] = useState<string>("");
  const [authRole, setAuthRole] = useState<UserRole>(UserRole.CUSTOMER);
  const [authError, setAuthError] = useState<string | null>(null);

  // Checkout Form
  const [shippingName, setShippingName] = useState<string>("");
  const [shippingPhone, setShippingPhone] = useState<string>("");
  const [shippingStreet, setShippingStreet] = useState<string>("");
  const [shippingCity, setShippingCity] = useState<string>("");
  const [shippingState, setShippingState] = useState<string>("");
  const [shippingZip, setShippingZip] = useState<string>("");
  const [paymentMethod, setPaymentMethod] = useState<string>("cod");
  const [isDirectCustomerShip, setIsDirectCustomerShip] = useState<boolean>(true);

  // Ratings for review form
  const [reviewRating, setReviewRating] = useState<number>(5);
  const [reviewComment, setReviewComment] = useState<string>("");
  const [reviewName, setReviewName] = useState<string>("");

  // Contact Form
  const [contactName, setContactName] = useState<string>("");
  const [contactEmail, setContactEmail] = useState<string>("");
  const [contactMessage, setContactMessage] = useState<string>("");

  // Fetch Public Data
  const fetchProducts = async () => {
    try {
      const res = await fetch("/api/products");
      const data = await res.json();
      if (res.ok) setProducts(data);
    } catch (err) {
      console.error("Error fetching products", err);
    }
  };

  const fetchCoupons = async () => {
    try {
      const res = await fetch("/api/coupons");
      const data = await res.json();
      if (res.ok) setCoupons(data);
    } catch (err) {
      console.error("Error fetching coupons", err);
    }
  };

  const fetchTestimonials = async () => {
    try {
      const res = await fetch("/api/testimonials");
      const data = await res.json();
      if (res.ok) setTestimonials(data);
    } catch (err) {
      console.error("Error fetching testimonials", err);
    }
  };

  const fetchBlogs = async () => {
    try {
      const res = await fetch("/api/blogs");
      const data = await res.json();
      if (res.ok) setBlogs(data);
    } catch (err) {
      console.error("Error fetching blogs", err);
    }
  };

  // Profile Auto-login via Token
  const fetchUserProfile = async () => {
    if (!token) return;
    try {
      const res = await fetch("/api/auth/profile", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        setUser(data);
        // Pre-populate checkout form with user details
        setShippingName(data.name || "");
        setShippingPhone(data.phone || "");
      } else {
        // Stale token
        handleLogout();
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchCoupons();
    fetchTestimonials();
    fetchBlogs();
  }, []);

  useEffect(() => {
    if (token) {
      fetchUserProfile();
    }
  }, [token]);

  // Handle User Logins
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: authEmail, password: authPassword })
      });
      const data = await res.json();
      if (res.ok) {
        setUser(data.user);
        setToken(data.token);
        localStorage.setItem("token", data.token);
        setAuthEmail("");
        setAuthPassword("");
        // Redirect based on role
        if (data.user.role === UserRole.ADMIN) {
          setCurrentView("admin-dashboard");
        } else if (data.user.role === UserRole.RESELLER) {
          setCurrentView("reseller-dashboard");
        } else {
          setCurrentView("home");
        }
      } else {
        setAuthError(data.error || "Authentication failed. Incorrect email or password.");
      }
    } catch (err) {
      setAuthError("Failed to communicate with authentication server.");
    }
  };

  // Handle User Registration
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: authName,
          email: authEmail,
          phone: authPhone,
          password: authPassword,
          role: authRole
        })
      });
      const data = await res.json();
      if (res.ok) {
        setUser(data.user);
        setToken(data.token);
        localStorage.setItem("token", data.token);
        // Clear forms
        setAuthName("");
        setAuthEmail("");
        setAuthPhone("");
        setAuthPassword("");
        if (data.user.role === UserRole.RESELLER) {
          setCurrentView("reseller-dashboard");
        } else {
          setCurrentView("home");
        }
      } else {
        setAuthError(data.error || "Failed to register new profile.");
      }
    } catch (err) {
      setAuthError("Connection error during registration.");
    }
  };

  const handleLogout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("token");
    setCurrentView("home");
  };

  // Add Item to Shopping Cart
  const handleAddToCart = (product: Product, size: string) => {
    const existing = cart.find(item => item.product.id === product.id && item.size === size);
    if (existing) {
      setCart(cart.map(item => 
        (item.product.id === product.id && item.size === size) 
          ? { ...item, quantity: item.quantity + 1 } 
          : item
      ));
    } else {
      setCart([...cart, { product, size, quantity: 1 }]);
    }
    alert(`"${product.name}" (${size}) added to your active basket!`);
  };

  const handleRemoveFromCart = (productId: string, size: string) => {
    setCart(cart.filter(item => !(item.product.id === productId && item.size === size)));
  };

  const handleQuantityChange = (productId: string, size: string, change: number) => {
    setCart(cart.map(item => {
      if (item.product.id === productId && item.size === size) {
        const newQty = item.quantity + change;
        return { ...item, quantity: Math.max(1, newQty) };
      }
      return item;
    }));
  };

  // Wishlist controls
  const handleToggleWishlist = (product: Product) => {
    if (wishlist.includes(product.id)) {
      setWishlist(wishlist.filter(id => id !== product.id));
    } else {
      setWishlist([...wishlist, product.id]);
    }
  };

  // Submit Product Review
  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) return;

    try {
      const res = await fetch(`/api/products/${selectedProduct.id}/reviews`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rating: reviewRating,
          comment: reviewComment,
          userName: reviewName || user?.name || "Guest Sleeper"
        })
      });
      const data = await res.json();
      if (res.ok) {
        alert("Thank you for your valuable feedback! Your review has been listed.");
        // refresh selected product info
        setSelectedProduct(data.product);
        // clear inputs
        setReviewComment("");
        setReviewName("");
        fetchProducts(); // refresh all
      } else {
        alert(data.error || "Failed to submit review.");
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Apply Coupon promo code
  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    const match = coupons.find(c => c.code.toUpperCase() === couponInput.toUpperCase());
    if (match && match.active) {
      setAppliedCoupon(match);
      setCouponInput("");
      alert(`Success! Promocode "${match.code}" has been applied to this session.`);
    } else {
      alert("Invalid or expired coupon promo code.");
    }
  };

  // Order Placement logic (direct customer or reseller order)
  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) return;

    const roleForOrder = user ? user.role : UserRole.CUSTOMER;
    const isResellerOrder = roleForOrder === UserRole.RESELLER || !isDirectCustomerShip;

    const payload = {
      items: cart.map(item => ({
        productId: item.product.id,
        name: item.product.name,
        size: item.size,
        quantity: item.quantity,
        price: item.product.price,
        resellerPrice: item.product.resellerPrice,
        image: item.product.images[0]
      })),
      couponCode: appliedCoupon?.code,
      shippingAddress: {
        name: shippingName,
        phone: shippingPhone,
        street: shippingStreet,
        city: shippingCity,
        state: shippingState,
        zipCode: shippingZip
      },
      paymentMethod,
      isResellerOrder,
      userId: user?.id
    };

    try {
      const headers: any = { "Content-Type": "application/json" };
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const res = await fetch("/api/orders", {
        method: "POST",
        headers,
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (res.ok) {
        alert(`Excellent! Your order has been placed successfully. Order ID: ${data.order.id}. Track your shipping status in our timeline page.`);
        setCart([]); // Clear cart
        setAppliedCoupon(null);
        // Clear shipping inputs
        setShippingStreet("");
        setShippingCity("");
        setShippingState("");
        setShippingZip("");
        
        // Refresh User profile for updated wallet balance
        if (token) fetchUserProfile();

        setCurrentView("track-order");
      } else {
        alert(data.error || "Failed to finalize checkout.");
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Submit Contact Form Message
  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: contactName,
          email: contactEmail,
          message: contactMessage
        })
      });
      if (res.ok) {
        alert("Your luxury support ticket has been registered. Our premium concierge will reply within 4 working hours.");
        setContactName("");
        setContactEmail("");
        setContactMessage("");
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Order tracking query forward
  const handleTrackQuery = async (orderId: string, phone: string): Promise<Order | null> => {
    try {
      const res = await fetch(`/api/orders/track?orderId=${orderId}&phone=${encodeURIComponent(phone)}`);
      const data = await res.json();
      if (res.ok) {
        return data.order;
      }
      return null;
    } catch (err) {
      return null;
    }
  };

  // Price calculations
  const calculateCartSubtotal = () => {
    const isResellerPriceActive = user?.role === UserRole.RESELLER || user?.role === UserRole.ADMIN;
    return cart.reduce((total, item) => {
      const rate = isResellerPriceActive ? item.product.resellerPrice : (item.product.price * (1 - (item.product.discount / 100)));
      return total + (rate * item.quantity);
    }, 0);
  };

  const cartSubtotal = calculateCartSubtotal();
  const shippingCharge = cartSubtotal > 150 ? 0 : 15;
  const discountReduction = appliedCoupon 
    ? (appliedCoupon.discountType === "percentage" 
        ? (cartSubtotal * (appliedCoupon.discountValue / 100)) 
        : appliedCoupon.discountValue)
    : 0;
  
  const finalCartTotal = Math.max(0, cartSubtotal + shippingCharge - discountReduction);

  // Extract list of all unique categories
  const categoriesList: string[] = Array.from(new Set(products.map(p => p.category))) as string[];

  // Filter products for Shop Page
  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          p.material.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          p.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory ? p.category === selectedCategory : true;
    const matchesSize = selectedSize ? p.sizes.includes(selectedSize) : true;
    
    const finalPrice = p.price * (1 - (p.discount / 100));
    const matchesMinPrice = minPrice ? finalPrice >= Number(minPrice) : true;
    const matchesMaxPrice = maxPrice ? finalPrice <= Number(maxPrice) : true;

    return matchesSearch && matchesCategory && matchesSize && matchesMinPrice && matchesMaxPrice;
  }).sort((a, b) => {
    const finalPriceA = a.price * (1 - (a.discount / 100));
    const finalPriceB = b.price * (1 - (b.discount / 100));

    if (sortBy === "price_asc") return finalPriceA - finalPriceB;
    if (sortBy === "price_desc") return finalPriceB - finalPriceA;
    if (sortBy === "rating") return b.rating - a.rating;
    return 1; // default newest
  });

  return (
    <div className="min-h-screen bg-luxury-cream text-luxury-charcoal flex flex-col font-sans selection:bg-primary/20 selection:text-primary">
      
      {/* Sticky Header Nav */}
      <Header
        currentView={currentView}
        user={user}
        cartCount={cart.reduce((sum, item) => sum + item.quantity, 0)}
        wishlistCount={wishlist.length}
        setCurrentView={setCurrentView}
        onLogout={handleLogout}
      />

      {/* Main Content Layout Switcher */}
      <main className="flex-1">
        
        {currentView === "home" && (
          <HomeView
            products={products}
            testimonials={testimonials}
            setCurrentView={setCurrentView}
            onViewProduct={(p) => { setSelectedProduct(p); setCurrentView("product-details"); }}
            isWishlisted={(id) => wishlist.includes(id)}
            onToggleWishlist={handleToggleWishlist}
            onAddToCart={handleAddToCart}
            userRole={user?.role || UserRole.CUSTOMER}
          />
        )}

        {currentView === "shop" && (
          <ShopView
            products={filteredProducts}
            categories={categoriesList}
            onViewProduct={(p) => { setSelectedProduct(p); setCurrentView("product-details"); }}
            isWishlisted={(id) => wishlist.includes(id)}
            onToggleWishlist={handleToggleWishlist}
            onAddToCart={handleAddToCart}
            userRole={user?.role || UserRole.CUSTOMER}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
            selectedSize={selectedSize}
            setSelectedSize={setSelectedSize}
            sortBy={sortBy}
            setSortBy={setSortBy}
            minPrice={minPrice}
            setMinPrice={setMinPrice}
            maxPrice={maxPrice}
            setMaxPrice={setMaxPrice}
          />
        )}

        {currentView === "blog" && (
          <BlogView
            blogs={blogs}
            onBackToHome={() => setCurrentView("home")}
            selectedBlog={selectedBlog}
            setSelectedBlog={setSelectedBlog}
          />
        )}

        {currentView === "track-order" && (
          <TrackOrderView onTrackOrder={handleTrackQuery} />
        )}

        {currentView === "resell-landing" && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-16 animate-fade-in">
            {/* Enrollment Landing */}
            <div className="text-center space-y-4 max-w-3xl mx-auto border-b border-primary/10 pb-10">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xxs font-bold uppercase tracking-widest bg-amber-50 text-amber-700 border border-amber-200">
                StyleSleep Reseller Academy
              </span>
              <h1 className="font-serif-luxury text-3xl sm:text-5xl font-semibold tracking-wide text-luxury-charcoal leading-tight">
                Launch Your Zero-Capital Bedding Reseller Business
              </h1>
              <p className="text-sm text-luxury-charcoal/70 leading-relaxed">
                Bedding represents an evergreen luxury category. Partner with StyleSleep to immediately access wholesale prices, share design catalogs on WhatsApp or Instagram, and keep up to 45% profit margins! No stock, no warehouse, no dispatch stress.
              </p>
              <div className="flex justify-center gap-4 pt-4">
                <button
                  onClick={() => setCurrentView("register")}
                  className="px-8 py-3.5 bg-primary text-white text-sm font-bold rounded-full shadow hover:bg-primary-dark transition-all cursor-pointer"
                >
                  Create Free Partner Profile
                </button>
                <button
                  onClick={() => {
                    setAuthEmail("reseller@stylesleep.com");
                    setAuthPassword("password123");
                    setCurrentView("login");
                  }}
                  className="px-8 py-3.5 bg-white border border-primary text-primary text-sm font-bold rounded-full hover:bg-luxury-beige transition-all cursor-pointer"
                >
                  Try Reseller Demo account
                </button>
              </div>
            </div>

            {/* How It Works section */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { step: "1", title: "Join & Register", desc: "Create a free reseller profile on our portal. No registration fees or initial collateral security deposit required." },
                { step: "2", title: "Promote & Share", desc: "Download high-end catalogs and watermark-free lifestyle bedroom photography with one click. Share on WhatsApp, Facebook, or Instagram." },
                { step: "3", title: "Pocket Commissions", desc: "Receive customer orders, input ship-to details on checkout, and clear the discounted reseller cost. Pocket the difference instantly!" }
              ].map((step, idx) => (
                <div key={idx} className="bg-white border border-primary/10 rounded-2xl p-6 text-center space-y-3 shadow-sm">
                  <div className="w-12 h-12 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center text-lg mx-auto">
                    {step.step}
                  </div>
                  <h3 className="font-serif-luxury font-bold text-base text-luxury-charcoal">{step.title}</h3>
                  <p className="text-xxs sm:text-xs text-luxury-charcoal/70 leading-relaxed">{step.desc}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {currentView === "reseller-dashboard" && (
          <ResellerDashboardView
            user={user}
            token={token}
            products={products}
            onOpenAICopywriter={() => setShowAICopywriter(true)}
          />
        )}

        {currentView === "admin-dashboard" && (
          <AdminView
            token={token}
            onRefreshProducts={fetchProducts}
            products={products}
            coupons={coupons}
            onRefreshCoupons={fetchCoupons}
          />
        )}

        {currentView === "login" && (
          <div className="max-w-md mx-auto px-4 py-16 animate-fade-in">
            <div className="bg-white border border-primary/10 rounded-2xl p-6 sm:p-8 shadow-xl space-y-6">
              
              <div className="text-center space-y-1">
                <h1 className="font-serif-luxury text-2xl font-bold text-luxury-charcoal">Sign In to StyleSleep</h1>
                <p className="text-xxs text-luxury-charcoal/50">Enter credentials to manage shopping or reseller accounts</p>
              </div>

              {authError && (
                <div className="p-3 bg-red-50 border border-red-150 rounded-lg text-xxs text-red-800 flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 text-red-600 flex-shrink-0 mt-0.5" />
                  <span>{authError}</span>
                </div>
              )}

              <form onSubmit={handleLoginSubmit} className="space-y-4">
                <div>
                  <label className="block text-xxs font-bold uppercase tracking-wider text-luxury-charcoal/60 mb-1.5">Email Address</label>
                  <input
                    type="email"
                    required
                    placeholder="reseller@stylesleep.com"
                    value={authEmail}
                    onChange={(e) => setAuthEmail(e.target.value)}
                    className="w-full text-xs rounded-lg border border-primary/15 bg-white p-2.5 focus:border-primary focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xxs font-bold uppercase tracking-wider text-luxury-charcoal/60 mb-1.5">Secure Password</label>
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={authPassword}
                    onChange={(e) => setAuthPassword(e.target.value)}
                    className="w-full text-xs rounded-lg border border-primary/15 bg-white p-2.5 focus:border-primary focus:outline-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-primary hover:bg-primary-dark text-white rounded-xl font-bold text-xs sm:text-sm tracking-wide shadow cursor-pointer transition-all"
                >
                  Authorized Sign In
                </button>
              </form>

              {/* Demo Helper box */}
              <div className="bg-luxury-beige/50 border border-primary/10 rounded-xl p-3 text-xxs space-y-1.5 text-luxury-charcoal/70">
                <span className="font-bold text-primary block">🔑 Instant Testing Accounts (Demo):</span>
                <p>• <span className="font-bold">Reseller Account:</span> reseller@stylesleep.com / password123</p>
                <p>• <span className="font-bold">Admin Account:</span> admin@stylesleep.com / password123</p>
              </div>

              <div className="text-center text-xxs text-luxury-charcoal/60 pt-2 border-t border-primary/5">
                New partner or shopper?{" "}
                <button onClick={() => setCurrentView("register")} className="font-bold text-primary hover:underline cursor-pointer">
                  Create free account
                </button>
              </div>

            </div>
          </div>
        )}

        {currentView === "register" && (
          <div className="max-w-md mx-auto px-4 py-16 animate-fade-in">
            <div className="bg-white border border-primary/10 rounded-2xl p-6 sm:p-8 shadow-xl space-y-6">
              
              <div className="text-center space-y-1">
                <h1 className="font-serif-luxury text-2xl font-bold text-luxury-charcoal">Create StyleSleep Account</h1>
                <p className="text-xxs text-luxury-charcoal/50">Register to buy sheets or sell under our wholesale partner ecosystem</p>
              </div>

              {authError && (
                <div className="p-3 bg-red-50 border border-red-150 rounded-lg text-xxs text-red-800 flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 text-red-600 flex-shrink-0 mt-0.5" />
                  <span>{authError}</span>
                </div>
              )}

              <form onSubmit={handleRegisterSubmit} className="space-y-4">
                <div>
                  <label className="block text-xxs font-bold uppercase tracking-wider text-luxury-charcoal/60 mb-1.5">Full Name</label>
                  <input
                    type="text"
                    required
                    placeholder="Bhavneet Kaur"
                    value={authName}
                    onChange={(e) => setAuthName(e.target.value)}
                    className="w-full text-xs rounded-lg border border-primary/15 bg-white p-2.5 focus:border-primary focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xxs font-bold uppercase tracking-wider text-luxury-charcoal/60 mb-1.5">Email Address</label>
                  <input
                    type="email"
                    required
                    placeholder="bhavneet@gmail.com"
                    value={authEmail}
                    onChange={(e) => setAuthEmail(e.target.value)}
                    className="w-full text-xs rounded-lg border border-primary/15 bg-white p-2.5 focus:border-primary focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xxs font-bold uppercase tracking-wider text-luxury-charcoal/60 mb-1.5">Phone Mobile</label>
                  <input
                    type="text"
                    required
                    placeholder="+91 98765 43210"
                    value={authPhone}
                    onChange={(e) => setAuthPhone(e.target.value)}
                    className="w-full text-xs rounded-lg border border-primary/15 bg-white p-2.5 focus:border-primary focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xxs font-bold uppercase tracking-wider text-luxury-charcoal/60 mb-1.5">Password</label>
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={authPassword}
                    onChange={(e) => setAuthPassword(e.target.value)}
                    className="w-full text-xs rounded-lg border border-primary/15 bg-white p-2.5 focus:border-primary focus:outline-none"
                  />
                </div>

                {/* Role Switcher */}
                <div>
                  <label className="block text-xxs font-bold uppercase tracking-wider text-luxury-charcoal/60 mb-1.5">Select Account Objective</label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setAuthRole(UserRole.CUSTOMER)}
                      className={`px-4 py-2.5 rounded-lg text-xxs font-bold border transition-all cursor-pointer ${authRole === UserRole.CUSTOMER ? "bg-primary text-white border-primary" : "bg-white text-luxury-charcoal border-primary/15 hover:bg-primary/5"}`}
                    >
                      Customer (I want to buy)
                    </button>
                    <button
                      type="button"
                      onClick={() => setAuthRole(UserRole.RESELLER)}
                      className={`px-4 py-2.5 rounded-lg text-xxs font-bold border transition-all cursor-pointer ${authRole === UserRole.RESELLER ? "bg-amber-700 text-white border-amber-700" : "bg-white text-luxury-charcoal border-primary/15 hover:bg-primary/5"}`}
                    >
                      Reseller (I want to resell)
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-primary hover:bg-primary-dark text-white rounded-xl font-bold text-xs sm:text-sm tracking-wide shadow cursor-pointer transition-all mt-2"
                >
                  Create Secure Profile
                </button>
              </form>

              <div className="text-center text-xxs text-luxury-charcoal/60 pt-2 border-t border-primary/5">
                Already have an account?{" "}
                <button onClick={() => setCurrentView("login")} className="font-bold text-primary hover:underline cursor-pointer">
                  Sign In
                </button>
              </div>

            </div>
          </div>
        )}

        {currentView === "cart" && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10 animate-fade-in">
            <h1 className="font-serif-luxury text-3xl font-semibold tracking-wide text-luxury-charcoal">Your Selected Bedding</h1>

            {cart.length > 0 ? (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                
                {/* Cart items list */}
                <div className="lg:col-span-8 space-y-4">
                  {cart.map((item, idx) => {
                    const isResellerPriceActive = user?.role === UserRole.RESELLER || user?.role === UserRole.ADMIN;
                    const finalRate = isResellerPriceActive ? item.product.resellerPrice : (item.product.price * (1 - (item.product.discount / 100)));
                    
                    return (
                      <div key={idx} className="bg-white border border-primary/10 rounded-2xl p-4 sm:p-5 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        
                        <div className="flex items-center gap-4">
                          <img
                            src={item.product.images[0]}
                            alt={item.product.name}
                            className="w-16 h-16 rounded-xl object-cover border border-primary/10"
                            referrerPolicy="no-referrer"
                          />
                          <div>
                            <h3 className="font-serif-luxury font-bold text-sm sm:text-base text-luxury-charcoal">{item.product.name}</h3>
                            <p className="text-xxs text-luxury-charcoal/50 mt-0.5">Size: {item.size} Size • Material: {item.product.material}</p>
                            
                            {isResellerPriceActive && (
                              <span className="inline-block mt-1 px-1.5 py-0.5 text-[9px] font-bold text-amber-800 bg-amber-50 rounded">
                                Partner Pricing Applied
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Quantity adjusters & Price summary */}
                        <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto border-t sm:border-none pt-3 sm:pt-0">
                          
                          <div className="flex items-center border border-primary/15 rounded-lg overflow-hidden bg-luxury-cream">
                            <button
                              onClick={() => handleQuantityChange(item.product.id, item.size, -1)}
                              className="p-1.5 hover:bg-primary/10 text-luxury-charcoal cursor-pointer"
                            >
                              <Minus className="h-3 w-3" />
                            </button>
                            <span className="px-3.5 text-xs font-bold text-luxury-charcoal">{item.quantity}</span>
                            <button
                              onClick={() => handleQuantityChange(item.product.id, item.size, 1)}
                              className="p-1.5 hover:bg-primary/10 text-luxury-charcoal cursor-pointer"
                            >
                              <Plus className="h-3 w-3" />
                            </button>
                          </div>

                          <div className="text-right">
                            <p className="font-bold text-sm sm:text-base text-luxury-charcoal">
                              {formatINR(finalRate * item.quantity)}
                            </p>
                            <button
                              onClick={() => handleRemoveFromCart(item.product.id, item.size)}
                              className="text-xxs text-red-500 font-medium hover:underline mt-1 cursor-pointer"
                            >
                              Remove Item
                            </button>
                          </div>

                        </div>

                      </div>
                    );
                  })}
                </div>

                {/* Subtotal calculation card */}
                <div className="lg:col-span-4 bg-white border border-primary/10 rounded-2xl p-6 shadow-sm space-y-6">
                  <h3 className="font-serif-luxury font-bold text-base text-luxury-charcoal">Order Accounting Summary</h3>
                  
                  {/* Coupon Application form */}
                  <form onSubmit={handleApplyCoupon} className="flex gap-2">
                    <input
                      type="text"
                      placeholder="PROMOCODE"
                      value={couponInput}
                      onChange={(e) => setCouponInput(e.target.value)}
                      className="flex-1 text-xs rounded-lg border border-primary/15 bg-luxury-cream/40 px-3 py-2 focus:outline-none uppercase"
                    />
                    <button
                      type="submit"
                      className="px-4 py-2 bg-primary text-white hover:bg-primary-dark text-xs font-bold rounded-lg cursor-pointer"
                    >
                      Apply
                    </button>
                  </form>

                  {appliedCoupon && (
                    <div className="flex items-center justify-between text-xxs font-bold text-green-700 bg-green-50 p-2.5 rounded-lg border border-green-200">
                      <span>Applied: {appliedCoupon.code}</span>
                      <button onClick={() => setAppliedCoupon(null)} className="text-red-500 hover:underline">✕ Cancel</button>
                    </div>
                  )}

                  <div className="space-y-3.5 text-xs border-t border-primary/5 pt-4">
                    <div className="flex justify-between text-luxury-charcoal/60">
                      <span>Bedsheets Subtotal:</span>
                      <span className="font-semibold text-luxury-charcoal">{formatINR(cartSubtotal)}</span>
                    </div>
                    <div className="flex justify-between text-luxury-charcoal/60">
                      <span>Logistics & Shipping:</span>
                      <span className="font-semibold text-luxury-charcoal">
                        {shippingCharge === 0 ? "FREE" : formatINR(shippingCharge)}
                      </span>
                    </div>
                    {discountReduction > 0 && (
                      <div className="flex justify-between text-green-600 font-semibold">
                        <span>Campaign Discount:</span>
                        <span>-{formatINR(discountReduction)}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-sm font-bold text-luxury-charcoal border-t border-primary/10 pt-4">
                      <span>Grand Total:</span>
                      <span className="text-base font-extrabold text-primary">{formatINR(finalCartTotal)}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => setCurrentView("checkout")}
                    className="w-full py-3 bg-primary hover:bg-primary-dark text-white rounded-xl font-bold text-xs sm:text-sm tracking-wide shadow cursor-pointer text-center"
                  >
                    Proceed to Secure Checkout
                  </button>
                </div>

              </div>
            ) : (
              <div className="text-center py-20 bg-white border border-primary/10 rounded-2xl p-6">
                <ShoppingBag className="h-12 w-12 text-primary/30 mx-auto mb-4" />
                <h3 className="font-serif-luxury font-semibold text-lg text-luxury-charcoal">Your cart is empty</h3>
                <p className="text-xs text-luxury-charcoal/60 mt-1 max-w-sm mx-auto">Discover the softest sheets in Egypt. Choose items and start reselling!</p>
                <button
                  onClick={() => setCurrentView("shop")}
                  className="mt-5 px-6 py-2.5 bg-primary text-white text-xs font-bold rounded-full hover:bg-primary-dark shadow cursor-pointer"
                >
                  Explore Catalog
                </button>
              </div>
            )}
          </div>
        )}

        {currentView === "checkout" && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10 animate-fade-in">
            <h1 className="font-serif-luxury text-3xl font-semibold tracking-wide text-luxury-charcoal">Checkout & Logistics</h1>

            <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              
              {/* Shipping Inputs Form */}
              <div className="lg:col-span-8 bg-white border border-primary/10 rounded-2xl p-6 sm:p-8 shadow-sm space-y-6">
                
                {/* Reseller Dispatch Mode Switcher */}
                {user?.role === UserRole.RESELLER && (
                  <div className="bg-amber-50 border border-amber-200 p-4.5 rounded-xl space-y-2">
                    <span className="text-xxs font-bold text-amber-800 uppercase tracking-widest block">Reseller Shipping Mode</span>
                    <p className="text-xxs text-amber-900 leading-relaxed">
                      If you are shipping directly to your customer, select "Ship directly to client". We will dispatch using a generic, premium white-label box without StyleSleep branding or invoice pricing.
                    </p>
                    <div className="grid grid-cols-2 gap-3 mt-2">
                      <button
                        type="button"
                        onClick={() => setIsDirectCustomerShip(true)}
                        className={`px-3 py-2 rounded-lg text-xxs font-bold border ${isDirectCustomerShip ? "bg-amber-700 text-white border-amber-700" : "bg-white text-luxury-charcoal border-primary/10"}`}
                      >
                        Ship directly to customer (Blind Box)
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsDirectCustomerShip(false)}
                        className={`px-3 py-2 rounded-lg text-xxs font-bold border ${!isDirectCustomerShip ? "bg-amber-700 text-white border-amber-700" : "bg-white text-luxury-charcoal border-primary/10"}`}
                      >
                        Ship to myself (Reseller Address)
                      </button>
                    </div>
                  </div>
                )}

                <h3 className="font-serif-luxury font-bold text-base text-luxury-charcoal">Shipping Address Details</h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xxs font-bold text-luxury-charcoal/60 uppercase mb-1.5">Recipient Full Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Jasmeet Singh"
                      value={shippingName}
                      onChange={(e) => setShippingName(e.target.value)}
                      className="w-full text-xs rounded-lg border border-primary/15 bg-white p-2.5 focus:border-primary focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xxs font-bold text-luxury-charcoal/60 uppercase mb-1.5">Recipient Contact Phone</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. +91 98765 43210"
                      value={shippingPhone}
                      onChange={(e) => setShippingPhone(e.target.value)}
                      className="w-full text-xs rounded-lg border border-primary/15 bg-white p-2.5 focus:border-primary focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xxs font-bold text-luxury-charcoal/60 uppercase mb-1.5">Street Address & Landmark</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Flat 402, Elegant Heights, Model Town"
                    value={shippingStreet}
                    onChange={(e) => setShippingStreet(e.target.value)}
                    className="w-full text-xs rounded-lg border border-primary/15 bg-white p-2.5 focus:border-primary focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xxs font-bold text-luxury-charcoal/60 uppercase mb-1.5">City</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Ludhiana"
                      value={shippingCity}
                      onChange={(e) => setShippingCity(e.target.value)}
                      className="w-full text-xs rounded-lg border border-primary/15 bg-white p-2.5 focus:border-primary focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xxs font-bold text-luxury-charcoal/60 uppercase mb-1.5">State</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Punjab"
                      value={shippingState}
                      onChange={(e) => setShippingState(e.target.value)}
                      className="w-full text-xs rounded-lg border border-primary/15 bg-white p-2.5 focus:border-primary focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xxs font-bold text-luxury-charcoal/60 uppercase mb-1.5">Postal Zip Code</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. 141001"
                      value={shippingZip}
                      onChange={(e) => setShippingZip(e.target.value)}
                      className="w-full text-xs rounded-lg border border-primary/15 bg-white p-2.5 focus:border-primary focus:outline-none"
                    />
                  </div>
                </div>

                {/* Payment Selection */}
                <div className="space-y-3 pt-4 border-t border-primary/5">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-primary/80">Select Escrow Payment Gateway</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setPaymentMethod("cod")}
                      className={`p-3 rounded-xl border text-xs font-bold flex items-center justify-between cursor-pointer ${paymentMethod === "cod" ? "bg-primary/5 text-primary border-primary" : "bg-white border-primary/15"}`}
                    >
                      <span>Cash on Delivery (COD)</span>
                      <Truck className="h-4.5 w-4.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setPaymentMethod("card")}
                      className={`p-3 rounded-xl border text-xs font-bold flex items-center justify-between cursor-pointer ${paymentMethod === "card" ? "bg-primary/5 text-primary border-primary" : "bg-white border-primary/15"}`}
                    >
                      <span>Online Payment (Simulated)</span>
                      <CreditCard className="h-4.5 w-4.5" />
                    </button>
                  </div>
                </div>

              </div>

              {/* Accounting summary sidebar */}
              <div className="lg:col-span-4 bg-white border border-primary/10 rounded-2xl p-6 shadow-sm space-y-4">
                <h3 className="font-serif-luxury font-bold text-base text-luxury-charcoal">Logistics summary</h3>
                
                <div className="space-y-2 max-h-[160px] overflow-y-auto">
                  {cart.map((item, i) => (
                    <div key={i} className="text-xxs text-luxury-charcoal/80 flex justify-between">
                      <span className="truncate max-w-[180px]">{item.product.name} ({item.size})</span>
                      <span className="font-bold">x{item.quantity}</span>
                    </div>
                  ))}
                </div>

                <div className="border-t border-primary/10 pt-4 space-y-2.5 text-xs">
                  <div className="flex justify-between text-luxury-charcoal/60">
                    <span>Grand Total:</span>
                    <span className="font-extrabold text-base text-primary">{formatINR(finalCartTotal)}</span>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 bg-primary hover:bg-primary-dark text-white rounded-xl font-bold text-xs sm:text-sm tracking-wide shadow cursor-pointer text-center"
                >
                  Finalize Shipment Order
                </button>
              </div>

            </form>
          </div>
        )}

        {currentView === "product-details" && selectedProduct && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12 animate-fade-in">
            
            {/* Back Button */}
            <button
              onClick={() => setCurrentView("shop")}
              className="flex items-center gap-1.5 text-xs font-bold text-primary hover:underline cursor-pointer"
            >
              <ChevronLeft className="h-4 w-4" /> Return to Catalog
            </button>

            {/* Product core detail block */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-start">
              
              {/* Left Column: Image stages */}
              <div className="space-y-4">
                <div className="rounded-2xl overflow-hidden aspect-square shadow-md bg-luxury-cream border border-primary/5">
                  <img
                    src={selectedProduct.images[0]}
                    alt={selectedProduct.name}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>
                {selectedProduct.images.length > 1 && (
                  <div className="grid grid-cols-3 gap-3">
                    {selectedProduct.images.map((img, idx) => (
                      <div key={idx} className="rounded-xl overflow-hidden aspect-square bg-luxury-cream border border-primary/5 shadow-sm">
                        <img src={img} alt="" className="w-full h-full object-cover" />
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Right Column: Specifications details */}
              <div className="space-y-6">
                
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-xxs font-semibold text-primary uppercase tracking-widest">
                    <span>{selectedProduct.category}</span>
                    <span>•</span>
                    <span>SKU: {selectedProduct.sku}</span>
                  </div>
                  <h1 className="font-serif-luxury text-2xl sm:text-4xl font-semibold tracking-wide text-luxury-charcoal leading-tight">
                    {selectedProduct.name}
                  </h1>

                  <div className="flex items-center gap-2 pt-1">
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className={`h-4 w-4 ${i < Math.floor(selectedProduct.rating) ? "text-luxury-accent fill-luxury-accent" : "text-gray-200"}`} />
                      ))}
                    </div>
                    <span className="text-xs text-luxury-charcoal/60">({selectedProduct.reviews.length || 2} verified client reviews)</span>
                  </div>
                </div>

                {/* Price Display Block */}
                <div className="p-4 bg-white border border-primary/5 rounded-2xl flex items-baseline justify-between shadow-sm">
                  <div>
                    <span className="text-xxs text-luxury-charcoal/50 uppercase font-bold tracking-wider leading-none">Shopper retail rate</span>
                    <p className="text-2xl font-bold text-luxury-charcoal mt-1">
                      {formatINR(selectedProduct.price * (1 - (selectedProduct.discount / 100)))}
                      {selectedProduct.discount > 0 && (
                        <span className="text-xs text-luxury-charcoal/40 line-through pl-2">
                          {formatINR(selectedProduct.price)}
                        </span>
                      )}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="inline-block text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded mb-1">
                      Partner Portal Price
                    </span>
                    <p className="text-xl font-bold text-amber-800">{formatINR(selectedProduct.resellerPrice)}</p>
                    <p className="text-[10px] text-amber-800/60 leading-none">Margins: +{formatINR((selectedProduct.price * (1 - (selectedProduct.discount / 100))) - selectedProduct.resellerPrice)}/Set</p>
                  </div>
                </div>

                {/* Textile Specs */}
                <div className="grid grid-cols-2 gap-4 text-xxs sm:text-xs">
                  <div className="bg-luxury-cream/50 p-3 rounded-xl border border-primary/5">
                    <span className="text-luxury-charcoal/50 uppercase tracking-wider font-semibold block">Material Composition</span>
                    <span className="font-bold text-luxury-charcoal mt-1 block">{selectedProduct.material}</span>
                  </div>
                  <div className="bg-luxury-cream/50 p-3 rounded-xl border border-primary/5">
                    <span className="text-luxury-charcoal/50 uppercase tracking-wider font-semibold block">Thread Count Weave</span>
                    <span className="font-bold text-luxury-charcoal mt-1 block">{selectedProduct.threadCount} TC Sateen</span>
                  </div>
                  <div className="bg-luxury-cream/50 p-3 rounded-xl border border-primary/5">
                    <span className="text-luxury-charcoal/50 uppercase tracking-wider font-semibold block">Weight Class</span>
                    <span className="font-bold text-luxury-charcoal mt-1 block">{selectedProduct.gsm} GSM Weight</span>
                  </div>
                  <div className="bg-luxury-cream/50 p-3 rounded-xl border border-primary/5">
                    <span className="text-luxury-charcoal/50 uppercase tracking-wider font-semibold block">Colorway Tone</span>
                    <span className="font-bold text-luxury-charcoal mt-1 block capitalize">{selectedProduct.color}</span>
                  </div>
                </div>

                {/* Sizing selection */}
                <div className="space-y-2">
                  <span className="text-xxs font-bold text-luxury-charcoal/60 uppercase tracking-widest block">Select Bed Size</span>
                  <div className="flex gap-2">
                    {selectedProduct.sizes.map((sz) => (
                      <button
                        key={sz}
                        onClick={() => setSelectedSize(sz)}
                        className={`px-4 py-2 border rounded-lg text-xs font-semibold cursor-pointer ${selectedSize === sz ? "bg-primary text-white border-primary" : "bg-white text-luxury-charcoal border-primary/10 hover:bg-primary/5"}`}
                      >
                        {sz}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Interactive Purchase Row */}
                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => handleAddToCart(selectedProduct, selectedSize || "King")}
                    className="flex-1 py-3.5 bg-primary hover:bg-primary-dark text-white rounded-xl font-bold text-xs sm:text-sm tracking-wide shadow-md hover:shadow-lg transition-all text-center cursor-pointer"
                  >
                    Add Bedding to Shopping Cart
                  </button>
                  <button
                    onClick={() => handleToggleWishlist(selectedProduct)}
                    className="p-3 bg-white border border-primary/15 rounded-xl text-luxury-charcoal hover:text-red-500 cursor-pointer"
                  >
                    <Heart className={`h-5 w-5 ${wishlist.includes(selectedProduct.id) ? "fill-red-500 text-red-500" : ""}`} />
                  </button>
                </div>

                {/* Features & Description */}
                <div className="space-y-2 pt-4 border-t border-primary/10">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-primary/80">Sleep Experience Features</h4>
                  <p className="text-xxs sm:text-xs text-luxury-charcoal/70 leading-relaxed">{selectedProduct.description}</p>
                  
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xxs font-medium text-luxury-charcoal/80 pt-2 pl-4 list-disc">
                    {selectedProduct.features.map((f, i) => <li key={i}>{f}</li>)}
                  </ul>
                </div>

              </div>

            </div>

            {/* Product Reviews Section */}
            <div className="border-t border-primary/10 pt-10 grid grid-cols-1 md:grid-cols-12 gap-8">
              
              {/* List reviews */}
              <div className="md:col-span-7 space-y-6">
                <h3 className="font-serif-luxury text-lg sm:text-xl font-bold text-luxury-charcoal">Verified Sleeping Experiences</h3>
                
                <div className="space-y-4">
                  {(selectedProduct.reviews && selectedProduct.reviews.length > 0) ? (
                    selectedProduct.reviews.map((rev) => (
                      <div key={rev.id} className="bg-white border border-primary/5 rounded-xl p-4 shadow-sm space-y-1.5">
                        <div className="flex items-center justify-between text-xxs">
                          <span className="font-bold text-luxury-charcoal">{rev.userName}</span>
                          <span className="text-luxury-charcoal/40">{rev.date}</span>
                        </div>
                        <div className="flex items-center">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className={`h-3 w-3 ${i < rev.rating ? "text-luxury-accent fill-luxury-accent" : "text-gray-200"}`} />
                          ))}
                        </div>
                        <p className="text-xxs sm:text-xs text-luxury-charcoal/70 leading-relaxed">
                          {rev.comment}
                        </p>
                      </div>
                    ))
                  ) : (
                    <p className="text-xxs text-luxury-charcoal/50 italic">Be the first to review this elegant bedsheet collection!</p>
                  )}
                </div>
              </div>

              {/* Add review form */}
              <div className="md:col-span-5 bg-luxury-beige/50 border border-primary/5 rounded-2xl p-5 space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-primary/80">Submit Your Review</h4>
                
                <form onSubmit={handleSubmitReview} className="space-y-3.5">
                  <div>
                    <label className="block text-xxs font-bold text-luxury-charcoal/60 uppercase tracking-widest mb-1.5">Rating Rating</label>
                    <div className="flex gap-1.5">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setReviewRating(star)}
                          className="p-1 cursor-pointer"
                        >
                          <Star className={`h-5 w-5 ${star <= reviewRating ? "text-luxury-accent fill-luxury-accent" : "text-gray-200"}`} />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xxs font-bold text-luxury-charcoal/60 uppercase tracking-widest mb-1.5">Your Name (Or Guest)</label>
                    <input
                      type="text"
                      placeholder="e.g. Gurpreet Singh"
                      value={reviewName}
                      onChange={(e) => setReviewName(e.target.value)}
                      className="w-full text-xs rounded-lg border border-primary/10 bg-white p-2 focus:border-primary focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xxs font-bold text-luxury-charcoal/60 uppercase tracking-widest mb-1.5">Review Thoughts</label>
                    <textarea
                      required
                      rows={3}
                      placeholder="Describe the fabric thickness, thread count elegance, washing behavior..."
                      value={reviewComment}
                      onChange={(e) => setReviewComment(e.target.value)}
                      className="w-full text-xs rounded-lg border border-primary/10 bg-white p-2 focus:border-primary focus:outline-none"
                    ></textarea>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 bg-primary text-white text-xs font-bold rounded-lg shadow-sm cursor-pointer"
                  >
                    Publish Verified Experience
                  </button>
                </form>
              </div>

            </div>

          </div>
        )}

        {currentView === "contact" && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12 animate-fade-in">
            <div className="text-center space-y-2 border-b border-primary/10 pb-6 max-w-2xl mx-auto">
              <h1 className="font-serif-luxury text-3xl sm:text-4xl font-semibold tracking-wide text-luxury-charcoal">StyleSleep Luxury Concierge</h1>
              <p className="text-xs sm:text-sm text-luxury-charcoal/60 mt-0.5">Need help choosing sheets or tracking reseller settlements? Contact our premium helpdesk.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start max-w-5xl mx-auto">
              
              {/* Left Column: Direct contact info */}
              <div className="space-y-6">
                <h3 className="font-serif-luxury text-xl font-bold text-luxury-charcoal">Bespoke Support Channels</h3>
                <p className="text-xs sm:text-sm text-luxury-charcoal/80 leading-relaxed">
                  Our customer service operates daily with direct, non-robot phone lines and premium email support to ensure dispute-free settlements for shoppers and boutique reseller micro-merchants.
                </p>

                <div className="space-y-4 pt-4 border-t border-primary/5">
                  <div className="flex items-center gap-3 text-xs">
                    <div className="p-2 bg-primary/10 rounded text-primary">📞</div>
                    <div>
                      <span className="font-bold text-luxury-charcoal block">Concierge Desk Helpline</span>
                      <span className="text-luxury-charcoal/60">+91 1800 212 9000 (Toll Free)</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-xs">
                    <div className="p-2 bg-primary/10 rounded text-primary">✉️</div>
                    <div>
                      <span className="font-bold text-luxury-charcoal block">Corporate Inquiry Email</span>
                      <span className="text-luxury-charcoal/60">support@stylesleep.com</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-xs">
                    <div className="p-2 bg-primary/10 rounded text-primary">📍</div>
                    <div>
                      <span className="font-bold text-luxury-charcoal block">Ludhiana Premium Loom Showroom</span>
                      <span className="text-luxury-charcoal/60">34-C, Rose Villa Estate, Ludhiana, Punjab - 141001</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Contact form */}
              <form onSubmit={handleContactSubmit} className="bg-white border border-primary/10 rounded-2xl p-6 shadow-md space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-primary/80">Message the Care Desk</h3>

                <div>
                  <label className="block text-xxs font-bold text-luxury-charcoal/60 uppercase mb-1.5">Full Name</label>
                  <input
                    type="text"
                    required
                    placeholder="Bhavneet Kaur"
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    className="w-full text-xs rounded-lg border border-primary/15 bg-white p-2.5 focus:border-primary focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xxs font-bold text-luxury-charcoal/60 uppercase mb-1.5">Email Address</label>
                  <input
                    type="email"
                    required
                    placeholder="bhavneet@gmail.com"
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    className="w-full text-xs rounded-lg border border-primary/15 bg-white p-2.5 focus:border-primary focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xxs font-bold text-luxury-charcoal/60 uppercase mb-1.5">Message ticket details</label>
                  <textarea
                    required
                    rows={4}
                    placeholder="Write details of your thread-count custom inquiries or coupon activation problems..."
                    value={contactMessage}
                    onChange={(e) => setContactMessage(e.target.value)}
                    className="w-full text-xs rounded-lg border border-primary/15 bg-white p-2.5 focus:border-primary focus:outline-none"
                  ></textarea>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-primary text-white rounded-xl font-bold text-xs sm:text-sm tracking-wide shadow cursor-pointer text-center"
                >
                  Dispatch concierge ticket
                </button>
              </form>

            </div>
          </div>
        )}

      </main>

      {/* Floating Gemini AI Copywriter Modal Workspace */}
      {showAICopywriter && (
        <AICopywriterModal
          products={products}
          token={token}
          onClose={() => setShowAICopywriter(false)}
        />
      )}

      {/* Luxury Footer bar */}
      <Footer setCurrentView={setCurrentView} />

    </div>
  );
}

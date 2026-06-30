import express from "express";
import path from "path";
import fs from "fs";
import crypto from "crypto";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import { UserRole, OrderStatus } from "./src/types.js";

// Load environment variables from .env file
dotenv.config();

// Initialize Gemini AI client
const geminiApiKey = process.env.GEMINI_API_KEY || "";
const ai = geminiApiKey 
  ? new GoogleGenAI({
      apiKey: geminiApiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    })
  : null;

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const DB_FILE = path.join(process.cwd(), "src", "db_store.json");

// Express middle-wares
app.use(express.json());

// Secret for signing custom session tokens (HMAC SHA-256)
const JWT_SECRET = "stylesleep-ultra-premium-secure-key-2026";

// Helper function to generate tokens
function generateToken(payload: { id: string; email: string; role: string }): string {
  const header = Buffer.from(JSON.stringify({ alg: "HS256", typ: "JWT" })).toString("base64url");
  const body = Buffer.from(JSON.stringify({ ...payload, exp: Date.now() + 7 * 24 * 60 * 60 * 1000 })).toString("base64url");
  const signature = crypto.createHmac("sha256", JWT_SECRET).update(`${header}.${body}`).digest("base64url");
  return `${header}.${body}.${signature}`;
}

// Helper function to verify tokens
function verifyToken(token: string): { id: string; email: string; role: string } | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const [header, body, signature] = parts;
    const expectedSig = crypto.createHmac("sha256", JWT_SECRET).update(`${header}.${body}`).digest("base64url");
    if (signature !== expectedSig) return null;
    const decodedBody = JSON.parse(Buffer.from(body, "base64url").toString());
    if (decodedBody.exp < Date.now()) return null;
    return decodedBody;
  } catch {
    return null;
  }
}

// Authentication middleware
function authenticate(req: any, res: any, next: any) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Access denied. No token provided." });
  }
  const token = authHeader.split(" ")[1];
  const decoded = verifyToken(token);
  if (!decoded) {
    return res.status(401).json({ error: "Invalid or expired token." });
  }
  req.user = decoded;
  next();
}

// Admin-only middleware
function requireAdmin(req: any, res: any, next: any) {
  authenticate(req, res, () => {
    if (req.user.role !== UserRole.ADMIN) {
      return res.status(403).json({ error: "Forbidden. Admin access required." });
    }
    next();
  });
}

// Reseller-only middleware
function requireReseller(req: any, res: any, next: any) {
  authenticate(req, res, () => {
    if (req.user.role !== UserRole.RESELLER && req.user.role !== UserRole.ADMIN) {
      return res.status(403).json({ error: "Forbidden. Reseller access required." });
    }
    next();
  });
}

// Ensure the db_store.json file exists with beautiful dummy data
function initializeDatabase() {
  const dir = path.dirname(DB_FILE);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  if (fs.existsSync(DB_FILE)) {
    try {
      const data = JSON.parse(fs.readFileSync(DB_FILE, "utf-8"));
      if (data.products && data.products.length > 0) {
        console.log("Database already initialized with products count:", data.products.length);
        return;
      }
    } catch (e) {
      console.log("Error reading existing DB. Re-creating db store...");
    }
  }

  // Set up dummy data
  const dummyProducts = [
    {
      id: "prod-1",
      name: "Royal Egyptian Cotton King Bedsheet",
      sku: "SS-COT-EGY-001",
      category: "Cotton Bedsheets",
      price: 180,
      discount: 15,
      resellerPrice: 125,
      stock: 45,
      images: [
        "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1631679706909-1844bbd07221?auto=format&fit=crop&w=800&q=80"
      ],
      sizes: ["King", "Queen"],
      material: "100% Egyptian Cotton",
      gsm: 400,
      threadCount: 800,
      color: "Classic Pearl White",
      description: "Indulge in pure luxury with our Egyptian Cotton Bedsheet. Sourced from the Nile delta, this exquisite bedsheet is combed to perfection and offers unparalleled softness, supreme durability, and a premium glossy finish that matches 7-star hotels.",
      features: [
        "Extra-long staple fibers for rich texture and high durability",
        "Sateen weave for a majestic silky feel",
        "Deep pockets to fit mattress up to 18 inches",
        "Eco-friendly, certified organic dyes"
      ],
      careInstructions: [
        "Machine wash warm on gentle cycle",
        "Tumble dry low, remove promptly",
        "Do not bleach, use mild detergents"
      ],
      reviews: [
        { id: "rev-1", userName: "Aishwarya R.", rating: 5, comment: "Absolutely incredible! The sateen weave is super soft and breathable. Feels like a high-end luxury resort bed.", date: "2026-06-15" },
        { id: "rev-2", userName: "Vikram S.", rating: 4.5, comment: "Premium quality bedsheet. Resold this to three clients already and they loved it. Highly recommended!", date: "2026-06-19" }
      ],
      rating: 4.8,
      isBestseller: true,
      isTrending: true
    },
    {
      id: "prod-2",
      name: "Tuscan Sunshine Linen Blossom Set",
      sku: "SS-LIN-BLS-002",
      category: "Premium Bedsheets",
      price: 210,
      discount: 20,
      resellerPrice: 140,
      stock: 30,
      images: [
        "https://images.unsplash.com/photo-1616594039964-ae9021a400a0?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=800&q=80"
      ],
      sizes: ["King", "Double"],
      material: "Belgian Flax Linen",
      gsm: 350,
      threadCount: 400,
      color: "Sandy Gold & Cream",
      description: "Experience the cool, breathability of French flax. This Belgian linen bedsheet features delicate, modern floral embroidery with custom hand-finished hems. Perfect for summers, this sheets becomes softer with every single wash.",
      features: [
        "Woven from high-grade natural French flax",
        "Highly breathable, perfect for hot sleepers",
        "Pre-washed for supreme vintage softness",
        "Hypoallergenic and highly moisture-wicking"
      ],
      careInstructions: [
        "Wash separately in cold water on gentle",
        "Line dry or tumble dry low",
        "Linen's natural wrinkles are part of its beauty"
      ],
      reviews: [
        { id: "rev-3", userName: "Meera K.", rating: 5, comment: "The vintage wash color is so elegant. Fits my boho aesthetic perfectly.", date: "2026-05-22" }
      ],
      rating: 5.0,
      isNewArrival: true,
      isTrending: true
    },
    {
      id: "prod-3",
      name: "Imperial Mulberry Silk Premium Bedding",
      sku: "SS-SLK-IMP-003",
      category: "Luxury Bedsheets",
      price: 320,
      discount: 10,
      resellerPrice: 220,
      stock: 12,
      images: [
        "https://images.unsplash.com/photo-1540518614846-7eded433c457?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?auto=format&fit=crop&w=800&q=80"
      ],
      sizes: ["King"],
      material: "100% Mulberry Silk (19 Momme)",
      gsm: 250,
      threadCount: 1200,
      color: "Imperial Gold",
      description: "The ultimate peak of luxury bedding. Made from 100% Grade 6A Mulberry Silk, these bedsheets offer a buttery soft touch that protects your skin and hair while keeping you perfectly cool. Perfect as an ultra-luxury wedding gift.",
      features: [
        "Grade 6A Mulberry silk for premium shine",
        "Protects hair from frizz and reduces skin wrinkles",
        "Naturally temperature-regulating all year round",
        "Exquisite gift packaging included"
      ],
      careInstructions: [
        "Dry clean recommended, or hand wash cold with silk detergent",
        "Lay flat to dry in shade, do not tumble dry",
        "Iron on silk setting on the reverse side only"
      ],
      reviews: [
        { id: "rev-4", userName: "Rajesh G.", rating: 5, comment: "Simply outstanding. Worth every dollar. My premium clients buy these as wedding hampers.", date: "2026-06-25" }
      ],
      rating: 5.0,
      isBestseller: true
    },
    {
      id: "prod-4",
      name: "Grand Plaza Hotel Stripe White",
      sku: "SS-HOT-STR-004",
      category: "Hotel Collection",
      price: 130,
      discount: 10,
      resellerPrice: 90,
      stock: 80,
      images: [
        "https://images.unsplash.com/photo-1507652313519-d4e9174996dd?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1616594039964-ae9021a400a0?auto=format&fit=crop&w=800&q=80"
      ],
      sizes: ["King", "Queen", "Double"],
      material: "Cotton-Satin Blend",
      gsm: 380,
      threadCount: 600,
      color: "Bright Sterling White",
      description: "Recreate the five-star suite experience at home. This crisp bedsheet is designed with elegant 1-cm damask stripes and is crafted to withstand frequent washing without losing its luxury sheen and smooth feel.",
      features: [
        "Mercerized for long-lasting high shine and silky softness",
        "Shrink-resistant and wrinkle-resistant fabric",
        "Anti-pilling treatment for crisp, long-term use",
        "Preferred by top 5-star hotel chains globally"
      ],
      careInstructions: [
        "Machine wash hot with like colors",
        "Bleach safe if necessary, tumble dry medium",
        "Hot iron to get that professional crisp look"
      ],
      reviews: [],
      rating: 4.5,
      isTrending: true
    },
    {
      id: "prod-5",
      name: "Cute Cosmos Galaxy Kids Bedsheet",
      sku: "SS-KID-COS-005",
      category: "Kids Collection",
      price: 90,
      discount: 25,
      resellerPrice: 58,
      stock: 50,
      images: [
        "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=800&q=80"
      ],
      sizes: ["Single", "Double"],
      material: "100% Breathable Organic Cotton",
      gsm: 280,
      threadCount: 300,
      color: "Cosmic Navy Blue",
      description: "Spark your child's imagination with stars, spaceships, and friendly aliens. Woven from ultra-soft, pure organic cotton that is certified chemical-free and extremely gentle on delicate skin.",
      features: [
        "100% certified organic cotton safe for children",
        "Glow-in-the-dark premium printing highlights",
        "Pre-shrunk and highly fade-resistant colors",
        "Comes with matching astronaut-shaped pillow covers"
      ],
      careInstructions: [
        "Machine wash cold, inside out",
        "Tumble dry low, remove immediately",
        "Do not dry clean"
      ],
      reviews: [
        { id: "rev-5", userName: "Priyanka T.", rating: 4.8, comment: "My son absolutely loves this! The stars really glow softly at night.", date: "2026-04-10" }
      ],
      rating: 4.8,
      isNewArrival: true
    },
    {
      id: "prod-6",
      name: "Heritage Summer Floral Queen Bedsheet",
      sku: "SS-COT-FLO-006",
      category: "Floral Bedsheets",
      price: 110,
      discount: 15,
      resellerPrice: 75,
      stock: 60,
      images: [
        "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1631679706909-1844bbd07221?auto=format&fit=crop&w=800&q=80"
      ],
      sizes: ["Queen", "Double"],
      material: "Pure Soft Percale Cotton",
      gsm: 300,
      threadCount: 450,
      color: "Mint Green & Pastel Rose",
      description: "Bring the serenity of an English summer garden into your bedroom. This pure cotton percale bedsheet is highly breathable, light, and features elegant floral motifs hand-painted by artisan designers.",
      features: [
        "Cool, crisp feel ideal for hot summer months",
        "Hand-painted floral digital print design",
        "Highly sweat-absorbent and breathable",
        "Full-surround robust elastic fitment"
      ],
      careInstructions: [
        "Machine wash cold with mild detergent",
        "Tumble dry low or line dry in shade",
        "Medium iron"
      ],
      reviews: [
        { id: "rev-6", userName: "Anjali M.", rating: 4.6, comment: "Colors are very beautiful and don't fade after washing. Excellent buy.", date: "2026-06-20" }
      ],
      rating: 4.6,
      isNewArrival: true
    }
  ];

  const dummyCoupons = [
    { code: "SLEEP10", discountType: "percentage", discountValue: 10, minPurchase: 50, description: "Get 10% OFF on all elegant bedding with a minimum purchase of $50.", active: true },
    { code: "LUXURY50", discountType: "fixed", discountValue: 50, minPurchase: 250, description: "Save $50 flat on premium luxury bedding collections over $250.", active: true },
    { code: "RESELLERFREE", discountType: "percentage", discountValue: 100, minPurchase: 1000, description: "Special coupon code for high-volume resellers.", active: true }
  ];

  const dummyBlogs = [
    {
      id: "blog-1",
      title: "How to Choose the Perfect Bedsheet Thread Count for Elite Comfort",
      slug: "choosing-perfect-thread-count",
      excerpt: "Is a higher thread count always better? Discover the scientific truths behind GSM, materials, and weaving methods to choose premium luxury bedding.",
      content: "Many buyers are misled into believing that a higher thread count automatically guarantees luxury bedding. However, the thread count simply measures the number of horizontal and vertical threads per square inch of fabric. In this comprehensive guide, we dissect the three pillars of elite bedsheet craftsmanship: fiber quality (Egyptian long-staple vs generic short-staple), thread count metrics (where 400-800 is the sweet spot of breathable luxury), and weaving architecture (silky sateen vs cool crisp percale). Choosing the right combination ensures you stay cool in the summer and warm in the winter without sweating.",
      image: "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=800&q=80",
      category: "Sleep Wellness",
      comments: [
        { id: "c-1", userName: "Dr. Sandeep", comment: "Very informative article! Helps clarify why my 1000 TC sheets felt like plastic.", date: "2026-06-21" }
      ],
      date: "2026-06-20",
      author: "Samantha Carter",
      readTime: "5 mins read"
    },
    {
      id: "blog-2",
      title: "The Ultimate Guide to Starting a Home Bedsheet Reselling Business",
      slug: "start-home-reselling-business",
      excerpt: "Learn how you can easily start your own bedsheet reselling venture from home, earn steady passive income, and build customer loyalty with StyleSleep.",
      content: "Bedsheets are high-margin, evergreen products. Unlike fast fashion, they do not suffer from severe fitting or styling return issues. This makes bedsheets the ultimate choice for home-based resellers, boutique owners, and side-hustlers. In this guide, we teach you how to market premium bedsheets via WhatsApp status, Instagram stories, and direct family networks. We reveal how StyleSleep's reseller pricing enables you to pocket 40% profits instantly with zero inventory investment. Plus, we explore how to utilize our high-resolution creative packs to drive immediate orders.",
      image: "https://images.unsplash.com/photo-1616594039964-ae9021a400a0?auto=format&fit=crop&w=800&q=80",
      category: "Reseller Academy",
      comments: [],
      date: "2026-06-24",
      author: "Devendra Mehta",
      readTime: "7 mins read"
    }
  ];

  const dummyTestimonials = [
    { id: "test-1", name: "Ananya Sharma", role: "Gold Reseller", text: "I started reselling StyleSleep bedsheets from my home. The material is so premium that my clients keep ordering more. I made over $1,200 in profits last month alone!", rating: 5, avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=120&q=80", location: "New Delhi" },
    { id: "test-2", name: "Robert Miller", role: "Premium Customer", text: "The Egyptian Cotton sheets are absolutely divine. It matches the luxurious bedding in elite 5-star suites. Customer service was incredibly helpful too.", rating: 5, avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=120&q=80", location: "Los Angeles" },
    { id: "test-3", name: "Kiran Patel", role: "Elite Reseller", text: "Using StyleSleep's download templates and WhatsApp status packages, I resold 50 sets in my first week! The profit calculator is incredibly precise.", rating: 5, avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80", location: "Mumbai" }
  ];

  const dummyDownloads = [
    { id: "dl-1", title: "StyleSleep Luxury Bedsheets Catalog PDF", type: "pdf", url: "#", category: "Catalog", size: "12.4 MB" },
    { id: "dl-2", title: "WhatsApp Daily Creative Status Kit", type: "image", url: "#", category: "WhatsApp", size: "4.8 MB" },
    { id: "dl-3", title: "Instagram Luxury Collection High-Res Kit", type: "image", url: "#", category: "Instagram", size: "8.2 MB" },
    { id: "dl-4", title: "Egyptian Cotton Bedsheet Video Review", type: "video", url: "#", category: "Lifestyle", size: "25.1 MB" },
    { id: "dl-5", title: "Reseller Master Price List & Margins", type: "excel", url: "#", category: "Catalog", size: "1.1 MB" }
  ];

  // Default Admin Account (hashed password)
  const defaultAdmin = {
    id: "admin-1",
    name: "StyleSleep Admin",
    email: "admin@stylesleep.com",
    passwordHash: crypto.createHash("sha256").update("password123").digest("hex"),
    role: UserRole.ADMIN,
    walletBalance: 0,
    createdAt: new Date().toISOString()
  };

  const defaultUser = {
    id: "user-1",
    name: "Bhavneet Kaur",
    email: "bhavneeetkaurr@gmail.com",
    passwordHash: crypto.createHash("sha256").update("password123").digest("hex"),
    role: UserRole.CUSTOMER,
    walletBalance: 250,
    phone: "+91 98765 43210",
    createdAt: new Date().toISOString()
  };

  const defaultReseller = {
    id: "reseller-1",
    name: "Preeti Bedi",
    email: "reseller@stylesleep.com",
    passwordHash: crypto.createHash("sha256").update("password123").digest("hex"),
    role: UserRole.RESELLER,
    walletBalance: 580,
    phone: "+91 99999 88888",
    referralCode: "SLEEP_PREETI_99",
    createdAt: new Date().toISOString()
  };

  const initialStore = {
    users: [defaultAdmin, defaultUser, defaultReseller],
    products: dummyProducts,
    coupons: dummyCoupons,
    orders: [
      {
        id: "OD-10025",
        userId: "user-1",
        userRole: UserRole.CUSTOMER,
        email: "bhavneeetkaurr@gmail.com",
        phone: "+91 98765 43210",
        customerName: "Bhavneet Kaur",
        items: [
          { productId: "prod-1", name: "Royal Egyptian Cotton King Bedsheet", image: "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=800&q=80", sku: "SS-COT-EGY-001", price: 153, quantity: 1, size: "King" }
        ],
        shippingAddress: { name: "Bhavneet Kaur", phone: "+91 98765 43210", street: "12A Elite Villas, Sector 45", city: "Chandigarh", state: "Punjab", zipCode: "160047" },
        subtotal: 153,
        discount: 0,
        shippingCost: 0,
        finalTotal: 153,
        resellerEarnings: 0,
        paymentMethod: "Online",
        paymentStatus: "Paid",
        status: OrderStatus.SHIPPED,
        createdAt: "2026-06-27T10:30:00.000Z",
        trackingNumber: "TR-9831093129",
        trackingHistory: [
          { status: OrderStatus.PENDING, timestamp: "2026-06-27T10:30:00.000Z", note: "Order placed successfully." },
          { status: OrderStatus.PAYMENT_RECEIVED, timestamp: "2026-06-27T10:31:00.000Z", note: "Online payment confirmed via Stripe." },
          { status: OrderStatus.CONFIRMED, timestamp: "2026-06-27T14:15:00.000Z", note: "Order verified and confirmed by warehouse team." },
          { status: OrderStatus.PACKED, timestamp: "2026-06-28T09:00:00.000Z", note: "Premium eco-friendly box packaging completed." },
          { status: OrderStatus.SHIPPED, timestamp: "2026-06-28T16:40:00.000Z", note: "Dispatched via Bluedart. Airway bill generated." }
        ]
      }
    ],
    blogs: dummyBlogs,
    testimonials: dummyTestimonials,
    downloads: dummyDownloads,
    contactMessages: [],
    addresses: {
      "user-1": [
        { id: "adr-1", name: "Bhavneet Kaur", phone: "+91 98765 43210", street: "12A Elite Villas, Sector 45", city: "Chandigarh", state: "Punjab", zipCode: "160047", isDefault: true }
      ]
    },
    carts: {
      "user-1": []
    },
    wishlists: {
      "user-1": ["prod-2"]
    }
  };

  fs.writeFileSync(DB_FILE, JSON.stringify(initialStore, null, 2), "utf-8");
  console.log("Database initialized successfully at:", DB_FILE);
}

// Ensure database state is loaded
initializeDatabase();

// Load DB Helper
function getDB() {
  try {
    return JSON.parse(fs.readFileSync(DB_FILE, "utf-8"));
  } catch (e) {
    console.error("DB reading error. Re-initializing...", e);
    initializeDatabase();
    return JSON.parse(fs.readFileSync(DB_FILE, "utf-8"));
  }
}

// Write DB Helper
function writeDB(data: any) {
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), "utf-8");
}

/* -----------------------------------------------
   API ROUTES
   ----------------------------------------------- */

// Auth Register
app.post("/api/auth/register", (req, res) => {
  const { name, email, password, role, phone, referralCode } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ error: "Name, email and password are required." });
  }

  const db = getDB();
  const existing = db.users.find((u: any) => u.email.toLowerCase() === email.toLowerCase());
  if (existing) {
    return res.status(400).json({ error: "An account with this email already exists." });
  }

  const desiredRole = role === UserRole.RESELLER ? UserRole.RESELLER : UserRole.CUSTOMER;
  const passwordHash = crypto.createHash("sha256").update(password).digest("hex");
  const newUser = {
    id: "user-" + Math.floor(Math.random() * 100000),
    name,
    email: email.toLowerCase(),
    passwordHash,
    role: desiredRole,
    phone: phone || "",
    walletBalance: 0,
    referralCode: desiredRole === UserRole.RESELLER ? `SLEEP_${name.toUpperCase().replace(/\s+/g, "")}_${Math.floor(10 + Math.random() * 90)}` : undefined,
    createdAt: new Date().toISOString()
  };

  db.users.push(newUser);
  writeDB(db);

  const token = generateToken({ id: newUser.id, email: newUser.email, role: newUser.role });
  res.status(201).json({
    message: "Registration successful!",
    token,
    user: {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      phone: newUser.phone,
      walletBalance: newUser.walletBalance,
      referralCode: newUser.referralCode
    }
  });
});

// Auth Login
app.post("/api/auth/login", (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required." });
  }

  const db = getDB();
  const user = db.users.find((u: any) => u.email.toLowerCase() === email.toLowerCase());
  if (!user) {
    return res.status(401).json({ error: "Invalid email or password." });
  }

  const passwordHash = crypto.createHash("sha256").update(password).digest("hex");
  if (user.passwordHash !== passwordHash) {
    return res.status(401).json({ error: "Invalid email or password." });
  }

  const token = generateToken({ id: user.id, email: user.email, role: user.role });
  res.json({
    message: "Login successful!",
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone || "",
      walletBalance: user.walletBalance || 0,
      referralCode: user.referralCode
    }
  });
});

// Auth Get Me / Profile
app.get(["/api/auth/me", "/api/auth/profile"], authenticate, (req: any, res) => {
  const db = getDB();
  const user = db.users.find((u: any) => u.id === req.user.id);
  if (!user) {
    return res.status(404).json({ error: "User not found." });
  }
  res.json({
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    phone: user.phone || "",
    walletBalance: user.walletBalance || 0,
    referralCode: user.referralCode
  });
});

// Update Profile
app.put("/api/auth/profile", authenticate, (req: any, res) => {
  const { name, phone, password } = req.body;
  const db = getDB();
  const idx = db.users.findIndex((u: any) => u.id === req.user.id);
  if (idx === -1) {
    return res.status(404).json({ error: "User not found." });
  }

  if (name) db.users[idx].name = name;
  if (phone !== undefined) db.users[idx].phone = phone;
  if (password) {
    db.users[idx].passwordHash = crypto.createHash("sha256").update(password).digest("hex");
  }

  writeDB(db);
  res.json({
    message: "Profile updated successfully!",
    user: {
      id: db.users[idx].id,
      name: db.users[idx].name,
      email: db.users[idx].email,
      role: db.users[idx].role,
      phone: db.users[idx].phone,
      walletBalance: db.users[idx].walletBalance,
      referralCode: db.users[idx].referralCode
    }
  });
});

// Get Categories
app.get("/api/categories", (req, res) => {
  const db = getDB();
  const cats = Array.from(new Set(db.products.map((p: any) => p.category)));
  res.json(cats);
});

// Get Products (with Search, Category, Sorting, Pagination, etc.)
app.get("/api/products", (req, res) => {
  const db = getDB();
  const { search, category, size, sortBy, minPrice, maxPrice, isBestseller, isTrending, isNewArrival } = req.query;
  
  let filtered = [...db.products];

  if (search) {
    const q = (search as string).toLowerCase();
    filtered = filtered.filter(p => p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q) || p.material.toLowerCase().includes(q));
  }

  if (category) {
    filtered = filtered.filter(p => p.category.toLowerCase() === (category as string).toLowerCase());
  }

  if (size) {
    filtered = filtered.filter(p => p.sizes.some((s: string) => s.toLowerCase() === (size as string).toLowerCase()));
  }

  if (minPrice) {
    filtered = filtered.filter(p => p.price * (1 - (p.discount / 100)) >= Number(minPrice));
  }

  if (maxPrice) {
    filtered = filtered.filter(p => p.price * (1 - (p.discount / 100)) <= Number(maxPrice));
  }

  if (isBestseller === "true") {
    filtered = filtered.filter(p => p.isBestseller === true);
  }

  if (isTrending === "true") {
    filtered = filtered.filter(p => p.isTrending === true);
  }

  if (isNewArrival === "true") {
    filtered = filtered.filter(p => p.isNewArrival === true);
  }

  // Sorting
  if (sortBy === "price_asc") {
    filtered.sort((a, b) => {
      const pa = a.price * (1 - (a.discount / 100));
      const pb = b.price * (1 - (b.discount / 100));
      return pa - pb;
    });
  } else if (sortBy === "price_desc") {
    filtered.sort((a, b) => {
      const pa = a.price * (1 - (a.discount / 100));
      const pb = b.price * (1 - (b.discount / 100));
      return pb - pa;
    });
  } else if (sortBy === "rating") {
    filtered.sort((a, b) => b.rating - a.rating);
  } else {
    // default/newest
    filtered.reverse();
  }

  res.json(filtered);
});

// Get Single Product
app.get("/api/products/:id", (req, res) => {
  const db = getDB();
  const product = db.products.find((p: any) => p.id === req.params.id);
  if (!product) {
    return res.status(404).json({ error: "Product not found." });
  }

  // Get similar products
  const similar = db.products
    .filter((p: any) => p.id !== product.id && (p.category === product.category || p.material === product.material))
    .slice(0, 3);

  res.json({ product, similar });
});

// Add Review
app.post(["/api/products/:id/review", "/api/products/:id/reviews"], (req, res) => {
  const { userName, rating, comment } = req.body;
  if (!userName || !rating) {
    return res.status(400).json({ error: "Username and rating are required." });
  }

  const db = getDB();
  const prodIdx = db.products.findIndex((p: any) => p.id === req.params.id);
  if (prodIdx === -1) {
    return res.status(404).json({ error: "Product not found." });
  }

  const newReview = {
    id: "rev-" + Math.floor(Math.random() * 100000),
    userName,
    rating: Number(rating),
    comment: comment || "",
    date: new Date().toISOString().split("T")[0]
  };

  db.products[prodIdx].reviews.push(newReview);
  
  // Recalculate average rating
  const totalRating = db.products[prodIdx].reviews.reduce((sum: number, r: any) => sum + r.rating, 0);
  db.products[prodIdx].rating = parseFloat((totalRating / db.products[prodIdx].reviews.length).toFixed(1));

  writeDB(db);
  res.status(201).json({ message: "Review added successfully!", review: newReview, rating: db.products[prodIdx].rating });
});

// Get Cart
app.get("/api/cart", authenticate, (req: any, res) => {
  const db = getDB();
  const userCart = db.carts?.[req.user.id] || [];
  res.json(userCart);
});

// Update Cart
app.post("/api/cart", authenticate, (req: any, res) => {
  const { cartItems } = req.body;
  if (!Array.isArray(cartItems)) {
    return res.status(400).json({ error: "Cart items must be an array." });
  }

  const db = getDB();
  if (!db.carts) db.carts = {};
  db.carts[req.user.id] = cartItems;
  writeDB(db);
  res.json({ message: "Cart synchronized successfully!" });
});

// Get Wishlist
app.get("/api/wishlist", authenticate, (req: any, res) => {
  const db = getDB();
  const userWishlist = db.wishlists?.[req.user.id] || [];
  res.json(userWishlist);
});

// Toggle Wishlist Item
app.post("/api/wishlist/toggle", authenticate, (req: any, res) => {
  const { productId } = req.body;
  if (!productId) {
    return res.status(400).json({ error: "Product ID is required." });
  }

  const db = getDB();
  if (!db.wishlists) db.wishlists = {};
  if (!db.wishlists[req.user.id]) db.wishlists[req.user.id] = [];

  const idx = db.wishlists[req.user.id].indexOf(productId);
  let isAdded = false;
  if (idx > -1) {
    db.wishlists[req.user.id].splice(idx, 1);
  } else {
    db.wishlists[req.user.id].push(productId);
    isAdded = true;
  }

  writeDB(db);
  res.json({ message: isAdded ? "Added to wishlist" : "Removed from wishlist", wishlist: db.wishlists[req.user.id] });
});

// Apply Coupon
app.post("/api/coupons/apply", (req, res) => {
  const { code, cartTotal } = req.body;
  if (!code) {
    return res.status(400).json({ error: "Coupon code is required." });
  }

  const db = getDB();
  const coupon = db.coupons.find((c: any) => c.code.toUpperCase() === code.toUpperCase() && c.active);
  if (!coupon) {
    return res.status(404).json({ error: "Invalid coupon code or expired." });
  }

  if (cartTotal < coupon.minPurchase) {
    return res.status(400).json({ error: `Minimum purchase of $${coupon.minPurchase} is required to apply this coupon.` });
  }

  let discountAmount = 0;
  if (coupon.discountType === "percentage") {
    discountAmount = parseFloat(((cartTotal * coupon.discountValue) / 100).toFixed(2));
  } else {
    discountAmount = coupon.discountValue;
  }

  res.json({
    message: "Coupon applied successfully!",
    code: coupon.code,
    discountAmount,
    coupon
  });
});

// Get all coupons
app.get("/api/coupons", (req, res) => {
  const db = getDB();
  res.json(db.coupons || []);
});

// Get User Addresses
app.get("/api/addresses", authenticate, (req: any, res) => {
  const db = getDB();
  const userAddresses = db.addresses?.[req.user.id] || [];
  res.json(userAddresses);
});

// Save Address
app.post("/api/addresses", authenticate, (req: any, res) => {
  const { address } = req.body;
  if (!address || !address.name || !address.street || !address.city || !address.state || !address.zipCode || !address.phone) {
    return res.status(400).json({ error: "Missing required address fields." });
  }

  const db = getDB();
  if (!db.addresses) db.addresses = {};
  if (!db.addresses[req.user.id]) db.addresses[req.user.id] = [];

  const newAddress = {
    id: address.id || "adr-" + Math.floor(Math.random() * 100000),
    ...address,
    isDefault: address.isDefault || db.addresses[req.user.id].length === 0
  };

  if (newAddress.isDefault) {
    db.addresses[req.user.id].forEach((a: any) => a.isDefault = false);
  }

  const existingIdx = db.addresses[req.user.id].findIndex((a: any) => a.id === newAddress.id);
  if (existingIdx > -1) {
    db.addresses[req.user.id][existingIdx] = newAddress;
  } else {
    db.addresses[req.user.id].push(newAddress);
  }

  writeDB(db);
  res.json({ message: "Address saved successfully!", addresses: db.addresses[req.user.id] });
});

// Delete Address
app.delete("/api/addresses/:id", authenticate, (req: any, res) => {
  const db = getDB();
  if (!db.addresses || !db.addresses[req.user.id]) {
    return res.status(404).json({ error: "No addresses found." });
  }

  db.addresses[req.user.id] = db.addresses[req.user.id].filter((a: any) => a.id !== req.params.id);
  writeDB(db);
  res.json({ message: "Address deleted successfully!", addresses: db.addresses[req.user.id] });
});

// Get My Orders
app.get("/api/orders", authenticate, (req: any, res) => {
  const db = getDB();
  const userOrders = db.orders.filter((o: any) => o.userId === req.user.id);
  res.json(userOrders.reverse());
});

// Create Order (Guest or Authenticated Customer or Reseller)
app.post("/api/orders", (req, res) => {
  const { 
    userId, 
    userRole, 
    email, 
    phone, 
    customerName, 
    items, 
    shippingAddress, 
    couponCode, 
    paymentMethod, 
    isResellerOrder 
  } = req.body;

  if (!email || !phone || !customerName || !items || items.length === 0 || !shippingAddress) {
    return res.status(400).json({ error: "Missing required order information." });
  }

  const db = getDB();

  // Validate stock and calculate totals
  let subtotal = 0;
  let resellerEarnings = 0;
  const processedItems = [];

  for (const item of items) {
    const prod = db.products.find((p: any) => p.id === item.productId);
    if (!prod) {
      return res.status(404).json({ error: `Product not found: ${item.productName}` });
    }
    if (prod.stock < item.quantity) {
      return res.status(400).json({ error: `Insufficient stock for product ${prod.name}. Available: ${prod.stock}` });
    }

    // Deduct stock
    prod.stock -= item.quantity;

    // Calculate prices
    const discPercentage = prod.discount || 0;
    const baseDiscountedPrice = prod.price * (1 - (discPercentage / 100));
    const activeResellerPrice = prod.resellerPrice;

    let itemSoldPrice = baseDiscountedPrice;
    if (isResellerOrder && (userRole === UserRole.RESELLER || userRole === UserRole.ADMIN)) {
      itemSoldPrice = activeResellerPrice;
      // Reseller buys at resellerPrice, sells at standard retail price.
      // If reseller places an order directly for their customer, they collect full price from their customer
      // and pay style sleep the resellerPrice. The difference is reseller earnings.
      const retailCustomerPrice = baseDiscountedPrice;
      resellerEarnings += (retailCustomerPrice - activeResellerPrice) * item.quantity;
    }

    subtotal += itemSoldPrice * item.quantity;
    processedItems.push({
      productId: prod.id,
      name: prod.name,
      image: prod.images[0],
      sku: prod.sku,
      price: parseFloat(itemSoldPrice.toFixed(2)),
      quantity: item.quantity,
      size: item.size || "King"
    });
  }

  // Calculate discounts from Coupon
  let discount = 0;
  if (couponCode) {
    const coupon = db.coupons.find((c: any) => c.code.toUpperCase() === couponCode.toUpperCase() && c.active);
    if (coupon && subtotal >= coupon.minPurchase) {
      if (coupon.discountType === "percentage") {
        discount = parseFloat(((subtotal * coupon.discountValue) / 100).toFixed(2));
      } else {
        discount = coupon.discountValue;
      }
    }
  }

  const shippingCost = subtotal - discount > 150 ? 0 : 15;
  const finalTotal = parseFloat((subtotal - discount + shippingCost).toFixed(2));

  // Build New Order
  const orderId = "OD-" + Math.floor(10000 + Math.random() * 90000);
  const trackingNumber = "TR-" + Math.floor(1000000000 + Math.random() * 9000000000);

  const newOrder = {
    id: orderId,
    userId: userId || "guest",
    userRole: userRole || UserRole.GUEST,
    email: email.toLowerCase(),
    phone,
    customerName,
    items: processedItems,
    shippingAddress,
    subtotal: parseFloat(subtotal.toFixed(2)),
    discount,
    shippingCost,
    finalTotal,
    resellerEarnings: parseFloat(resellerEarnings.toFixed(2)),
    paymentMethod: paymentMethod || "COD",
    paymentStatus: paymentMethod === "Online" ? "Paid" : "Pending",
    status: OrderStatus.CONFIRMED, // Auto-confirm on checkout
    createdAt: new Date().toISOString(),
    trackingNumber,
    trackingHistory: [
      { status: OrderStatus.PENDING, timestamp: new Date().toISOString(), note: "Order placed successfully." },
      { status: OrderStatus.CONFIRMED, timestamp: new Date().toISOString(), note: "Payment validated & order auto-confirmed." }
    ]
  };

  db.orders.push(newOrder);

  // If reseller order, credit reseller wallet with earnings!
  if (isResellerOrder && resellerEarnings > 0 && userId && userId !== "guest") {
    const userIdx = db.users.findIndex((u: any) => u.id === userId);
    if (userIdx > -1) {
      db.users[userIdx].walletBalance = parseFloat(((db.users[userIdx].walletBalance || 0) + resellerEarnings).toFixed(2));
    }
  }

  writeDB(db);

  res.status(201).json({
    message: "Order placed successfully!",
    order: newOrder
  });
});

// Track Order via Order ID and Mobile Phone
app.get("/api/orders/track", (req, res) => {
  const { orderId, phone } = req.query;
  if (!orderId || !phone) {
    return res.status(400).json({ error: "Order ID and phone number are required for tracking." });
  }

  const db = getDB();
  const order = db.orders.find(
    (o: any) => o.id.toLowerCase() === (orderId as string).toLowerCase() && 
    (o.phone.replace(/[^0-9]/g, "").endsWith((phone as string).replace(/[^0-9]/g, "").slice(-10)))
  );

  if (!order) {
    return res.status(404).json({ error: "No matching order found with the provided details. Please verify your entries." });
  }

  res.json(order);
});

// Cancel Order
app.post("/api/orders/:id/cancel", authenticate, (req: any, res) => {
  const db = getDB();
  const orderIdx = db.orders.findIndex((o: any) => o.id === req.params.id && o.userId === req.user.id);
  
  if (orderIdx === -1) {
    return res.status(404).json({ error: "Order not found or unauthorized." });
  }

  const order = db.orders[orderIdx];
  if ([OrderStatus.SHIPPED, OrderStatus.OUT_FOR_DELIVERY, OrderStatus.DELIVERED].includes(order.status)) {
    return res.status(400).json({ error: "Shipped orders cannot be cancelled directly. Please initiate a Return/Refund once delivered." });
  }

  // Restore inventory stock
  for (const item of order.items) {
    const prodIdx = db.products.findIndex((p: any) => p.id === item.productId);
    if (prodIdx > -1) {
      db.products[prodIdx].stock += item.quantity;
    }
  }

  // Deduct reseller earnings if it was credited
  if (order.resellerEarnings > 0 && order.userId !== "guest") {
    const userIdx = db.users.findIndex((u: any) => u.id === order.userId);
    if (userIdx > -1) {
      db.users[userIdx].walletBalance = parseFloat((Math.max(0, db.users[userIdx].walletBalance - order.resellerEarnings)).toFixed(2));
    }
  }

  db.orders[orderIdx].status = OrderStatus.CANCELLED;
  db.orders[orderIdx].trackingHistory.push({
    status: OrderStatus.CANCELLED,
    timestamp: new Date().toISOString(),
    note: "Order cancelled by the customer."
  });

  writeDB(db);
  res.json({ message: "Order cancelled successfully!", order: db.orders[orderIdx] });
});

// Return / Refund Request
app.post("/api/orders/:id/return", authenticate, (req: any, res) => {
  const { reason } = req.body;
  const db = getDB();
  const orderIdx = db.orders.findIndex((o: any) => o.id === req.params.id && o.userId === req.user.id);

  if (orderIdx === -1) {
    return res.status(404).json({ error: "Order not found or unauthorized." });
  }

  const order = db.orders[orderIdx];
  if (order.status !== OrderStatus.DELIVERED) {
    return res.status(400).json({ error: "Only delivered orders can be returned." });
  }

  db.orders[orderIdx].status = OrderStatus.RETURNED;
  db.orders[orderIdx].paymentStatus = "Refunded";
  db.orders[orderIdx].trackingHistory.push({
    status: OrderStatus.RETURNED,
    timestamp: new Date().toISOString(),
    note: `Return initiated. Reason: ${reason || "No reason specified"}.`
  });

  // Refund amount back to user wallet!
  const userIdx = db.users.findIndex((u: any) => u.id === req.user.id);
  if (userIdx > -1) {
    db.users[userIdx].walletBalance = parseFloat(((db.users[userIdx].walletBalance || 0) + order.finalTotal).toFixed(2));
  }

  writeDB(db);
  res.json({ message: "Return requested successfully! Refund has been credited to your StyleSleep Wallet.", order: db.orders[orderIdx] });
});

// Reseller Downloads
app.get("/api/reseller/downloads", requireReseller, (req, res) => {
  const db = getDB();
  res.json(db.downloads || []);
});

// Reseller Dashboard Stats
app.get("/api/reseller/dashboard", requireReseller, (req: any, res) => {
  const db = getDB();
  const userId = req.user.id;
  const resellerOrders = db.orders.filter((o: any) => o.userId === userId);
  
  const totalOrders = resellerOrders.length;
  const monthlyOrders = resellerOrders.filter((o: any) => {
    const orderMonth = new Date(o.createdAt).getMonth();
    const currentMonth = new Date().getMonth();
    return orderMonth === currentMonth;
  }).length;

  const totalEarnings = resellerOrders.reduce((sum: number, o: any) => sum + (o.resellerEarnings || 0), 0);
  
  const userObj = db.users.find((u: any) => u.id === userId);
  const walletBalance = userObj ? userObj.walletBalance : 0;
  const referralCode = userObj ? userObj.referralCode : "";

  res.json({
    totalOrders,
    monthlyOrders,
    totalEarnings: parseFloat(totalEarnings.toFixed(2)),
    walletBalance,
    referralCode,
    recentOrders: resellerOrders.slice(-5).reverse()
  });
});

// AI Copywriting Assistant (Using Gemini AI)
app.post("/api/reseller/ai-copywriter", requireReseller, async (req, res) => {
  const { productId, platform, tone } = req.body;
  if (!productId) {
    return res.status(400).json({ error: "Product ID is required." });
  }

  if (!ai) {
    // Return high-quality pre-baked marketing copywriting as fallback if API key is not configured yet.
    const dbFallback = getDB();
    const prod = dbFallback.products.find((p: any) => p.id === productId);
    const prodName = prod ? prod.name : "StyleSleep Luxury Bedsheets";
    const sku = prod ? prod.sku : "StyleSleep";
    const price = prod ? prod.price : 150;
    
    return res.json({
      caption: `✨ FALLBACK PREMIUM COPYWRITING ✨\n\n🏡 Elevate your bedroom to a 5-Star luxury suite with our *${prodName}*! \n\n💎 *Premium Craftsmanship & Elite Style:* \n• Premium luxury weaving for an ultra-soft feel\n• High thread count offering supreme breathability\n• Perfect fit with rich colors that never wash out!\n\n🛒 DM us to lock in exclusive client pricing! Fast door-step shipping available. Cash on delivery accepted.\n\n#StyleSleep #PremiumBedding #HomeDecor #LuxuryLinen #CosyHome #BedsheetsReseller #Elegance`,
      notice: "Gemini API Key is currently not set up or inactive. Showing beautiful built-in templates."
    });
  }

  try {
    const db = getDB();
    const product = db.products.find((p: any) => p.id === productId);
    if (!product) {
      return res.status(404).json({ error: "Product not found." });
    }

    const platformName = platform || "WhatsApp Status";
    const toneName = tone || "Luxurious & Persuasive";

    const promptString = `
      You are an elite, highly persuasive social media copywriter and e-commerce marketing genius.
      Write an incredible, high-conversion, highly scannable promotional caption/creative copy for a bedsheet reseller to sell this specific product:
      
      PRODUCT DETAILS:
      - Name: ${product.name}
      - SKU: ${product.sku}
      - Category: ${product.category}
      - Core Material: ${product.material}
      - GSM: ${product.gsm}
      - Thread Count: ${product.threadCount}
      - Rich Color: ${product.color}
      - Selling Retail Price: $${product.price} (with ${product.discount}% Discount already applied)
      - Key Selling Features: ${product.features.join(", ")}
      - Care instructions to mention: ${product.careInstructions.join(", ")}

      MARKETING SPECIFICATIONS:
      - Intended Platform: ${platformName} (Tailor formatting, emojis, line spacing, and hashtags specifically for ${platformName})
      - Copywriting Tone: ${toneName}

      Provide a polished, stunning, emojis-rich template that the reseller can copy-paste directly onto their social feeds. Include clear call-to-actions, pricing details, and spacing. Highlight the luxury feeling, soft touch, and unmatched breathability of the StyleSleep brand. Do not include any HTML tags; return only clean, beautifully structured plaintext.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: promptString,
    });

    const captionText = response.text || "Failed to generate caption text.";
    res.json({ caption: captionText });

  } catch (error: any) {
    console.error("Gemini copywriter error:", error);
    res.status(500).json({ 
      error: "AI copywriting assistant failed to generate. Please try again.",
      details: error.message 
    });
  }
});

// Get Testimonials
app.get("/api/testimonials", (req, res) => {
  const db = getDB();
  res.json(db.testimonials || []);
});

// Get Blogs
app.get("/api/blogs", (req, res) => {
  const db = getDB();
  const { search } = req.query;
  let blogs = [...(db.blogs || [])];

  if (search) {
    const q = (search as string).toLowerCase();
    blogs = blogs.filter(b => b.title.toLowerCase().includes(q) || b.excerpt.toLowerCase().includes(q) || b.content.toLowerCase().includes(q));
  }

  res.json(blogs);
});

// Get Single Blog
app.get("/api/blogs/:id", (req, res) => {
  const db = getDB();
  const blog = db.blogs.find((b: any) => b.id === req.params.id || b.slug === req.params.id);
  if (!blog) {
    return res.status(404).json({ error: "Blog post not found." });
  }
  res.json(blog);
});

// Add Blog Comment
app.post("/api/blogs/:id/comment", (req, res) => {
  const { userName, comment } = req.body;
  if (!userName || !comment) {
    return res.status(400).json({ error: "Name and comment are required." });
  }

  const db = getDB();
  const blogIdx = db.blogs.findIndex((b: any) => b.id === req.params.id || b.slug === req.params.id);
  if (blogIdx === -1) {
    return res.status(404).json({ error: "Blog post not found." });
  }

  const newComment = {
    id: "comment-" + Math.floor(Math.random() * 100000),
    userName,
    comment,
    date: new Date().toISOString().split("T")[0]
  };

  db.blogs[blogIdx].comments.push(newComment);
  writeDB(db);
  res.status(201).json({ message: "Comment posted successfully!", comment: newComment });
});

// Submit Contact Message
app.post("/api/contact", (req, res) => {
  const { name, email, subject, message } = req.body;
  if (!name || !email || !message) {
    return res.status(400).json({ error: "Name, email and message are required." });
  }

  const db = getDB();
  if (!db.contactMessages) db.contactMessages = [];

  const newMessage = {
    id: "msg-" + Math.floor(Math.random() * 100000),
    name,
    email,
    subject: subject || "General Inquiry",
    message,
    createdAt: new Date().toISOString()
  };

  db.contactMessages.push(newMessage);
  writeDB(db);

  res.json({ message: "Thank you! Your inquiry has been received. Our luxury support team will respond within 2-4 hours." });
});

/* -----------------------------------------------
   ADMIN PANEL ENDPOINTS
   ----------------------------------------------- */

// Admin Dashboard Analytics
app.get("/api/admin/dashboard", requireAdmin, (req, res) => {
  const db = getDB();
  
  const totalSales = db.orders
    .filter((o: any) => o.status !== OrderStatus.CANCELLED)
    .reduce((sum: number, o: any) => sum + o.finalTotal, 0);

  const totalOrders = db.orders.length;
  const totalUsers = db.users.length;
  const resellersCount = db.users.filter((u: any) => u.role === UserRole.RESELLER).length;
  const customersCount = db.users.filter((u: any) => u.role === UserRole.CUSTOMER).length;

  // Generate sales by day for graph
  const salesByDay: Record<string, number> = {};
  db.orders.forEach((o: any) => {
    const day = o.createdAt.split("T")[0];
    salesByDay[day] = (salesByDay[day] || 0) + o.finalTotal;
  });

  const salesGraph = Object.entries(salesByDay).map(([date, amount]) => ({
    date,
    revenue: parseFloat(amount.toFixed(2))
  })).slice(-7); // last 7 days

  // Best selling products
  const productSalesCount: Record<string, { name: string; quantity: number }> = {};
  db.orders.forEach((o: any) => {
    o.items.forEach((item: any) => {
      if (!productSalesCount[item.productId]) {
        productSalesCount[item.productId] = { name: item.name, quantity: 0 };
      }
      productSalesCount[item.productId].quantity += item.quantity;
    });
  });

  const topSellingProducts = Object.entries(productSalesCount)
    .map(([id, data]) => ({ id, name: data.name, sales: data.quantity }))
    .sort((a, b) => b.sales - a.sales)
    .slice(0, 5);

  res.json({
    analytics: {
      totalSales: parseFloat(totalSales.toFixed(2)),
      totalOrders,
      totalUsers,
      resellersCount,
      customersCount
    },
    salesGraph,
    topSellingProducts,
    recentOrders: db.orders.slice(-5).reverse(),
    recentCustomers: db.users.filter((u: any) => u.role !== UserRole.ADMIN).slice(-5).reverse()
  });
});

// Admin Add Product
app.post("/api/admin/products", requireAdmin, (req, res) => {
  const productData = req.body;
  if (!productData.name || !productData.price || !productData.category) {
    return res.status(400).json({ error: "Name, category, and price are required." });
  }

  const db = getDB();
  const newProduct = {
    id: "prod-" + Math.floor(Math.random() * 100000),
    reviews: [],
    rating: 5.0,
    ...productData,
    price: Number(productData.price),
    discount: Number(productData.discount || 0),
    resellerPrice: Number(productData.resellerPrice || (productData.price * 0.75)), // default 25% profit margin
    stock: Number(productData.stock || 10),
    images: productData.images && productData.images.length > 0 ? productData.images : [
      "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=800&q=80"
    ]
  };

  db.products.push(newProduct);
  writeDB(db);
  res.status(201).json({ message: "Product added successfully!", product: newProduct });
});

// Admin Edit Product
app.put("/api/admin/products/:id", requireAdmin, (req, res) => {
  const db = getDB();
  const idx = db.products.findIndex((p: any) => p.id === req.params.id);
  if (idx === -1) {
    return res.status(404).json({ error: "Product not found." });
  }

  db.products[idx] = {
    ...db.products[idx],
    ...req.body,
    price: Number(req.body.price),
    discount: Number(req.body.discount || 0),
    resellerPrice: Number(req.body.resellerPrice || (req.body.price * 0.75)),
    stock: Number(req.body.stock || 0)
  };

  writeDB(db);
  res.json({ message: "Product updated successfully!", product: db.products[idx] });
});

// Admin Delete Product
app.delete("/api/admin/products/:id", requireAdmin, (req, res) => {
  const db = getDB();
  const initialLen = db.products.length;
  db.products = db.products.filter((p: any) => p.id !== req.params.id);
  
  if (db.products.length === initialLen) {
    return res.status(404).json({ error: "Product not found." });
  }

  writeDB(db);
  res.json({ message: "Product deleted successfully!" });
});

// Admin Get Orders
app.get("/api/admin/orders", requireAdmin, (req, res) => {
  const db = getDB();
  res.json(db.orders.reverse());
});

// Admin Update Order Status
app.put("/api/admin/orders/:id", requireAdmin, (req, res) => {
  const { status, note } = req.body;
  if (!status) {
    return res.status(400).json({ error: "Status is required." });
  }

  const db = getDB();
  const idx = db.orders.findIndex((o: any) => o.id === req.params.id);
  if (idx === -1) {
    return res.status(404).json({ error: "Order not found." });
  }

  db.orders[idx].status = status;
  db.orders[idx].trackingHistory.push({
    status,
    timestamp: new Date().toISOString(),
    note: note || `Order status updated to ${status}.`
  });

  writeDB(db);
  res.json({ message: "Order status updated successfully!", order: db.orders[idx] });
});

// Admin View Users (Customers & Resellers)
app.get("/api/admin/users", requireAdmin, (req, res) => {
  const db = getDB();
  const sanitisedUsers = db.users.map((u: any) => ({
    id: u.id,
    name: u.name,
    email: u.email,
    role: u.role,
    phone: u.phone,
    walletBalance: u.walletBalance,
    referralCode: u.referralCode,
    createdAt: u.createdAt
  }));
  res.json(sanitisedUsers);
});

// Admin Manage Coupons
app.post("/api/admin/coupons", requireAdmin, (req, res) => {
  const { code, discountType, discountValue, minPurchase, description } = req.body;
  if (!code || !discountValue) {
    return res.status(400).json({ error: "Coupon code and discount values are required." });
  }

  const db = getDB();
  const existing = db.coupons.find((c: any) => c.code.toUpperCase() === code.toUpperCase());
  if (existing) {
    return res.status(400).json({ error: "Coupon code already exists." });
  }

  const newCoupon = {
    code: code.toUpperCase(),
    discountType: discountType || "percentage",
    discountValue: Number(discountValue),
    minPurchase: Number(minPurchase || 0),
    description: description || `Save ${discountValue} using this coupon code!`,
    active: true
  };

  db.coupons.push(newCoupon);
  writeDB(db);
  res.status(201).json({ message: "Coupon created successfully!", coupon: newCoupon });
});

// Serve the web application in a full-stack capacity
async function startServer() {
  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Production client bundle static serving
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`StyleSleep full-stack platform listening on http://localhost:${PORT}`);
  });
}

startServer();

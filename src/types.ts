/**
 * StyleSleep Type Definitions
 */

export enum UserRole {
  GUEST = "guest",
  CUSTOMER = "customer",
  RESELLER = "reseller",
  ADMIN = "admin"
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  phone?: string;
  walletBalance: number;
  referralCode?: string;
  createdAt: string;
}

export interface Address {
  id: string;
  name: string;
  phone: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  isDefault: boolean;
}

export interface Review {
  id: string;
  userName: string;
  rating: number;
  comment: string;
  date: string;
}

export interface Product {
  id: string;
  name: string;
  sku: string;
  category: string;
  price: number; // Customer price
  discount: number; // percentage
  resellerPrice: number; // Discounted pricing exclusive to resellers
  stock: number;
  images: string[];
  sizes: string[]; // e.g. "Single", "Double", "Queen", "King"
  material: string; // e.g. "Egyptian Cotton", "Organic Linen", "Mulberry Silk"
  gsm: number; // Grams per square meter, e.g. 300, 400
  threadCount: number; // e.g. 400, 600, 1000
  color: string;
  description: string;
  features: string[];
  careInstructions: string[];
  reviews: Review[];
  rating: number;
  isBestseller?: boolean;
  isTrending?: boolean;
  isNewArrival?: boolean;
}

export interface CartItem {
  productId: string;
  productName: string;
  productImage: string;
  sku: string;
  price: number; // price at time of cart entry
  resellerPrice: number;
  quantity: number;
  size: string;
}

export interface OrderItem {
  productId: string;
  name: string;
  image: string;
  sku: string;
  price: number; // price sold at (regular or reseller)
  quantity: number;
  size: string;
}

export enum OrderStatus {
  PENDING = "Pending",
  PAYMENT_RECEIVED = "Payment Received",
  CONFIRMED = "Confirmed",
  PROCESSING = "Processing",
  PACKED = "Packed",
  SHIPPED = "Shipped",
  OUT_FOR_DELIVERY = "Out For Delivery",
  DELIVERED = "Delivered",
  CANCELLED = "Cancelled",
  RETURNED = "Returned",
  REFUNDED = "Refunded"
}

export interface Order {
  id: string;
  userId: string; // "guest" or customerId/resellerId
  userRole: UserRole;
  email: string;
  phone: string;
  customerName: string;
  items: OrderItem[];
  shippingAddress: {
    name: string;
    phone: string;
    street: string;
    city: string;
    state: string;
    zipCode: string;
  };
  subtotal: number;
  discount: number; // Coupon discount or general markdown
  shippingCost: number;
  finalTotal: number;
  resellerEarnings: number; // Profit earned by the reseller if it is a reseller placement
  paymentMethod: "COD" | "Online";
  paymentStatus: "Pending" | "Paid" | "Refunded";
  status: OrderStatus;
  createdAt: string;
  trackingNumber?: string;
  trackingHistory?: { status: OrderStatus; timestamp: string; note: string }[];
}

export interface Coupon {
  code: string;
  discountType: "percentage" | "fixed";
  discountValue: number;
  minPurchase: number;
  description: string;
  active: boolean;
}

export interface Testimonial {
  id: string;
  name: string;
  role: string; // "Customer" or "Reseller"
  text: string;
  rating: number;
  avatar: string;
  location?: string;
}

export interface BlogComment {
  id: string;
  userName: string;
  comment: string;
  date: string;
}

export interface Blog {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  image: string;
  category: string;
  comments: BlogComment[];
  date: string;
  author: string;
  readTime: string;
}

export interface MarketingResource {
  id: string;
  title: string;
  type: "image" | "video" | "pdf" | "excel";
  url: string;
  category: "Instagram" | "WhatsApp" | "Catalog" | "Lifestyle" | "Bedsheet Main";
  size: string;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  createdAt: string;
}

export function formatINR(usdAmount: number): string {
  const inrAmount = usdAmount * 80;
  return "₹" + inrAmount.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}

export function formatINRNoDec(usdAmount: number): string {
  const inrAmount = usdAmount * 80;
  return "₹" + Math.round(inrAmount).toLocaleString("en-IN");
}

export function downloadJSON(data: any, filename: string): void {
  const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
    JSON.stringify(data, null, 2)
  )}`;
  const downloadAnchor = document.createElement("a");
  downloadAnchor.setAttribute("href", jsonString);
  downloadAnchor.setAttribute("download", filename);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
}


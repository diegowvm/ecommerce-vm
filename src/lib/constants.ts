// Application Constants
export const APP_CONFIG = {
  name: 'Xegai Shop',
  description: 'Plataforma de e-commerce moderna focada em moda, calçados e acessórios',
  url: 'https://xegaishop.com',
  contact: {
    phone: '(44) 99151-2466',
    email: 'contato.xegaientregas@gmail.com',
    whatsapp: '5544991512466'
  },
  social: {
    instagram: '@xegaishop',
    facebook: 'xegaishop',
    twitter: '@xegaishop'
  }
} as const;

export const ROUTES = {
  HOME: '/',
  PRODUCTS: '/products',
  CART: '/cart',
  CHECKOUT: '/checkout',
  PROFILE: '/profile',
  AUTH: '/auth',
  ADMIN: '/admin',
  ABOUT: '/about',
  CONTACT: '/contact',
  HELP: '/help'
} as const;

export const ORDER_STATUS = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  SHIPPED: 'shipped',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled'
} as const;

export const PAYMENT_STATUS = {
  PENDING: 'pending',
  PAID: 'paid',
  FAILED: 'failed',
  REFUNDED: 'refunded'
} as const;

export const PRODUCT_SIZES = [
  'PP', 'P', 'M', 'G', 'GG', 'XG',
  '34', '35', '36', '37', '38', '39', '40', '41', '42', '43', '44'
] as const;

export const SHIPPING_CONFIG = {
  FREE_SHIPPING_THRESHOLD: 199,
  DELIVERY_DAYS: {
    STANDARD: 7,
    EXPRESS: 3,
    SAME_DAY: 1
  }
} as const;

export const PAGINATION = {
  DEFAULT_LIMIT: 12,
  MAX_LIMIT: 50
} as const;

export const CACHE_KEYS = {
  PRODUCTS: 'products',
  CATEGORIES: 'categories',
  USER_CART: 'user_cart',
  USER_PROFILE: 'user_profile'
} as const;

export const API_ENDPOINTS = {
  PRODUCTS: '/api/products',
  CATEGORIES: '/api/categories',
  CART: '/api/cart',
  ORDERS: '/api/orders',
  AUTH: '/api/auth',
  USERS: '/api/users'
} as const;
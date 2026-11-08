export interface ProductReview {
  rating: number;
  comment: string;
  date: string;
  reviewerName: string;
}
export interface Product {
  id: number;
  title: string;
  description: string;
  category: string;
  price: number;
  discountPercentage: number;
  rating: number;
  stock: number;
  brand?: string;
  thumbnail: string;
  images: string[];
  tags?: string[];
  reviews: ProductReview[];
}
export interface ProductsResponse {
  products: Product[];
  total: number;
  skip: number;
  limit: number;
}
export interface Category {
  slug: string;
  name: string;
  url: string;
}
export interface AuthUser {
  username: string;
  isLoggedIn: boolean;
}
export interface LoginFormValues {
  username: string;
  password: string;
}
export interface User extends AuthUser {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}
export type ProfileFormValues = Pick<
  User,
  'firstName' | 'lastName' | 'email' | 'phone'
>;
export interface CartItem {
  productId: number;
  title: string;
  thumbnail: string;
  price: number;
  discountPercentage: number;
  stock: number;
  quantity: number;
}
export interface CartState {
  items: CartItem[];
  promoCode?: string | null;
}
export interface ShippingInfo {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  postalCode: string;
  country: string;
}
export type OrderStatus = 'Processing' | 'Shipped' | 'Delivered';
export interface Order {
  id: number;
  number: string;
  userId: number;
  items: CartItem[];
  shipping: ShippingInfo;
  subtotal: number;
  discount: number;
  shippingCost: number;
  total: number;
  placedAt: string;
}
export type AsyncState<T> =
  | {
      status: 'idle';
    }
  | {
      status: 'loading';
    }
  | {
      status: 'success';
      data: T;
    }
  | {
      status: 'error';
      message: string;
    };
export type SortOption =
  '' | 'price-asc' | 'price-desc' | 'rating-desc' | 'title-asc';
